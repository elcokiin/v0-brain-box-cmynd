import { sql } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

// Validate API key for external integrations (n8n, Telegram, etc.)
function validateApiKey(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer ")) return false
  
  const apiKey = authHeader.slice(7)
  return apiKey === process.env.BRAINBOX_API_KEY
}

// GET - Fetch all ideas (for web dashboard)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") || "inbox"
    const search = searchParams.get("search")
    
    let ideas
    if (search) {
      ideas = await sql`
        SELECT * FROM ideas 
        WHERE status = ${status} 
        AND content ILIKE ${'%' + search + '%'}
        ORDER BY pinned DESC, created_at DESC
      `
    } else {
      ideas = await sql`
        SELECT * FROM ideas 
        WHERE status = ${status}
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
  // Check for API key authentication (for n8n/Telegram)
  const hasApiKey = validateApiKey(request)
  
  try {
    const body = await request.json()
    const { content, source = hasApiKey ? "telegram" : "web" } = body
    
    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      )
    }
    
    const result = await sql`
      INSERT INTO ideas (content, source, status, pinned, background_color)
      VALUES (${content.trim()}, ${source}, 'inbox', false, null)
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
