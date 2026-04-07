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
    
    let result
    
    // Handle different status changes with separate queries
    if (status === 'deleted') {
      // Moving to trash - set deleted_at if not already set
      result = await sql`
        UPDATE ideas 
        SET 
          content = COALESCE(${content !== undefined ? content.trim() : null}, content),
          status = 'deleted',
          tags = COALESCE(${tags ?? null}, tags),
          pinned = COALESCE(${pinned ?? null}, pinned),
          background_color = COALESCE(${background_color ?? null}, background_color),
          deleted_at = COALESCE(deleted_at, NOW()),
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `
    } else if (status === 'inbox' || status === 'archived') {
      // Restoring from trash - clear deleted_at
      result = await sql`
        UPDATE ideas 
        SET 
          content = COALESCE(${content !== undefined ? content.trim() : null}, content),
          status = ${status},
          tags = COALESCE(${tags ?? null}, tags),
          pinned = COALESCE(${pinned ?? null}, pinned),
          background_color = COALESCE(${background_color ?? null}, background_color),
          deleted_at = NULL,
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `
    } else {
      // No status change - just update other fields
      result = await sql`
        UPDATE ideas 
        SET 
          content = COALESCE(${content !== undefined ? content.trim() : null}, content),
          status = COALESCE(${status ?? null}, status),
          tags = COALESCE(${tags ?? null}, tags),
          pinned = COALESCE(${pinned ?? null}, pinned),
          background_color = COALESCE(${background_color ?? null}, background_color),
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `
    }
    
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
