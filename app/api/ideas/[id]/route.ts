import { sql } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

// GET - Fetch single idea
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const result = await sql`
      SELECT * FROM ideas WHERE id = ${id}
    `
    
    if (result.length === 0) {
      return NextResponse.json(
        { error: "Idea not found" },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ idea: result[0] })
  } catch (error) {
    console.error("Failed to fetch idea:", error)
    return NextResponse.json(
      { error: "Failed to fetch idea" },
      { status: 500 }
    )
  }
}

// PATCH - Update idea (content, status, tags, pinned, background_color)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { content, status, tags, pinned, background_color } = body
    
    // Handle deleted_at based on status change
    let deletedAtClause = sql`deleted_at`
    if (status === 'deleted') {
      // Set deleted_at only if not already set
      deletedAtClause = sql`COALESCE(deleted_at, NOW())`
    } else if (status === 'inbox' || status === 'archived') {
      // Clear deleted_at when restoring
      deletedAtClause = sql`NULL`
    }
    
    const result = await sql`
      UPDATE ideas 
      SET 
        content = COALESCE(${content !== undefined ? content.trim() : null}, content),
        status = COALESCE(${status ?? null}, status),
        tags = COALESCE(${tags ?? null}, tags),
        pinned = COALESCE(${pinned ?? null}, pinned),
        background_color = ${background_color !== undefined ? background_color : sql`background_color`},
        deleted_at = ${deletedAtClause},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `
    
    if (result.length === 0) {
      return NextResponse.json(
        { error: "Idea not found" },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ idea: result[0] })
  } catch (error) {
    console.error("Failed to update idea:", error)
    return NextResponse.json(
      { error: "Failed to update idea" },
      { status: 500 }
    )
  }
}

// DELETE - Permanently delete idea from database
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const result = await sql`
      DELETE FROM ideas WHERE id = ${id} RETURNING id
    `
    
    if (result.length === 0) {
      return NextResponse.json(
        { error: "Idea not found" },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true, id: result[0].id })
  } catch (error) {
    console.error("Failed to delete idea:", error)
    return NextResponse.json(
      { error: "Failed to delete idea" },
      { status: 500 }
    )
  }
}
