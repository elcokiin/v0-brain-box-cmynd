import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { neon } from "@neondatabase/serverless"
import crypto from "crypto"

const sql = neon(process.env.DATABASE_URL!)

// Generate a secure random API key
function generateApiKey(): string {
  return `bb_${crypto.randomBytes(24).toString("hex")}`
}

// Hash API key for storage
function hashApiKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex")
}

// GET - List all API keys for the current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const keys = await sql`
      SELECT id, name, key_preview, created_at, last_used_at
      FROM api_keys
      WHERE user_id = ${session.user.id}
      ORDER BY created_at DESC
    `

    return NextResponse.json({ keys })
  } catch (error) {
    console.error("Failed to fetch API keys:", error)
    return NextResponse.json(
      { error: "Failed to fetch API keys" },
      { status: 500 }
    )
  }
}

// POST - Create a new API key
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name } = body

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      )
    }

    // Generate a new API key
    const apiKey = generateApiKey()
    const hashedKey = hashApiKey(apiKey)
    const keyPreview = apiKey.slice(-4)

    const result = await sql`
      INSERT INTO api_keys (user_id, name, key_hash, key_preview)
      VALUES (${session.user.id}, ${name.trim()}, ${hashedKey}, ${keyPreview})
      RETURNING id, name, key_preview, created_at
    `

    // Return the full key only once (on creation)
    return NextResponse.json({
      key: {
        ...result[0],
        full_key: apiKey // Only returned on creation!
      }
    }, { status: 201 })
  } catch (error) {
    console.error("Failed to create API key:", error)
    return NextResponse.json(
      { error: "Failed to create API key" },
      { status: 500 }
    )
  }
}
