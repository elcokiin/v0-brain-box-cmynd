import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { sql } from "@/lib/db"
import { ensureApiKeysTable, generateApiKey, hashApiKey } from "@/lib/api-keys"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await ensureApiKeysTable()

    const keys = await sql`
      SELECT id, name, key_preview, created_at, last_used_at
      FROM api_keys
      WHERE user_id = ${session.user.id}
      ORDER BY created_at DESC
    `

    return NextResponse.json({ keys })
  } catch (error) {
    console.error("Failed to fetch API keys:", error)
    return NextResponse.json({ error: "Failed to fetch API keys" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const name = typeof body?.name === "string" ? body.name.trim() : ""

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    await ensureApiKeysTable()

    const fullKey = generateApiKey()
    const keyHash = hashApiKey(fullKey)
    const keyPreview = fullKey.slice(-4)

    const result = await sql`
      INSERT INTO api_keys (user_id, name, key_hash, key_preview)
      VALUES (${session.user.id}, ${name}, ${keyHash}, ${keyPreview})
      RETURNING id, name, key_preview, created_at, last_used_at
    `

    return NextResponse.json(
      {
        key: {
          ...result[0],
          full_key: fullKey,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Failed to create API key:", error)
    return NextResponse.json({ error: "Failed to create API key" }, { status: 500 })
  }
}
