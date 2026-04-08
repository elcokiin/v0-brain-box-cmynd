import { sql } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

// Hash API key for comparison
function hashApiKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex")
}

// Validate API key for external integrations (n8n, Telegram, etc.)
// Returns user_id if valid, null otherwise
async function validateApiKey(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get("authorization")
  console.log("[v0] validateApiKey - authHeader:", authHeader ? "present" : "missing")
  
  if (!authHeader?.startsWith("Bearer ")) {
    console.log("[v0] validateApiKey - no Bearer prefix")
    return null
  }
  
  const apiKey = authHeader.slice(7)
  console.log("[v0] validateApiKey - apiKey length:", apiKey.length, "prefix:", apiKey.slice(0, 5))
  
  // First check legacy global API key (for backward compatibility)
  if (process.env.BRAINBOX_API_KEY && apiKey === process.env.BRAINBOX_API_KEY) {
    console.log("[v0] validateApiKey - matched legacy key")
    const users = await sql`SELECT id FROM users LIMIT 1`
    return users.length > 0 ? users[0].id : null
  }
  
  // Check user-created API keys
  const hashedKey = hashApiKey(apiKey)
  console.log("[v0] validateApiKey - hashedKey:", hashedKey.slice(0, 16) + "...")
  
  const result = await sql`
    SELECT user_id FROM api_keys 
    WHERE key_hash = ${hashedKey}
  `
  console.log("[v0] validateApiKey - db result count:", result.length)
  
  if (result.length > 0) {
    // Update last_used_at timestamp
    await sql`
      UPDATE api_keys 
      SET last_used_at = NOW() 
      WHERE key_hash = ${hashedKey}
    `
    console.log("[v0] validateApiKey - found user_id:", result[0].user_id)
    return result[0].user_id
  }
  
  console.log("[v0] validateApiKey - no matching key found")
  return null
}

// Get authenticated user ID from session or API key
async function getAuthenticatedUserId(request: NextRequest): Promise<string | null> {
  // First check session auth
  const session = await getServerSession(authOptions)
  if (session?.user?.id) {
    return session.user.id
  }
  
  // Fall back to API key auth
  return validateApiKey(request)
}

// GET - Fetch all ideas (for web dashboard)
export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request)
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") || "inbox"
    const search = searchParams.get("search")
    
    let ideas
    if (search) {
      ideas = await sql`
        SELECT * FROM ideas 
        WHERE user_id = ${userId}
        AND status = ${status} 
        AND content ILIKE ${'%' + search + '%'}
        ORDER BY pinned DESC, created_at DESC
      `
    } else {
      ideas = await sql`
        SELECT * FROM ideas 
        WHERE user_id = ${userId}
        AND status = ${status}
        ORDER BY pinned DESC, created_at DESC
      `
    }
    
    return NextResponse.json({ ideas })
  } catch (error) {
    console.error("Failed to fetch ideas:", error)
    return NextResponse.json(
      { error: "Failed to fetch ideas" },
      { status: 500 }
    )
  }
}

// POST - Create new idea (API key auth for external tools)
export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request)
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    // Determine source based on auth method
    const session = await getServerSession(authOptions)
    const source = session?.user?.id ? "web" : "telegram"
    
    const body = await request.json()
    const { content } = body
    
    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      )
    }
    
    const result = await sql`
      INSERT INTO ideas (user_id, content, source, status, pinned, background_color)
      VALUES (${userId}, ${content.trim()}, ${source}, 'inbox', false, null)
      RETURNING *
    `
    
    return NextResponse.json({ idea: result[0] }, { status: 201 })
  } catch (error) {
    console.error("Failed to create idea:", error)
    return NextResponse.json(
      { error: "Failed to create idea" },
      { status: 500 }
    )
  }
}
