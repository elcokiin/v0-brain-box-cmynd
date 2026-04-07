import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

// PATCH - Update API key name
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { name } = body

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      )
    }

    const result = await sql`
      UPDATE api_keys
      SET name = ${name.trim()}
      WHERE id = ${id} AND user_id = ${session.user.id}
      RETURNING id, name, key_preview, created_at, last_used_at
    `

    if (result.length === 0) {
      return NextResponse.json(
        { error: "API key not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ key: result[0] })
  } catch (error) {
    console.error("Failed to update API key:", error)
    return NextResponse.json(
      { error: "Failed to update API key" },
      { status: 500 }
    )
  }
}

// DELETE - Delete an API key
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params

    const result = await sql`
      DELETE FROM api_keys
      WHERE id = ${id} AND user_id = ${session.user.id}
      RETURNING id
    `

    if (result.length === 0) {
      return NextResponse.json(
        { error: "API key not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete API key:", error)
    return NextResponse.json(
      { error: "Failed to delete API key" },
      { status: 500 }
    )
  }
}
