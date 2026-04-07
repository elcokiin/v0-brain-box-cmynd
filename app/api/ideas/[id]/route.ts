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
    
    // First, get the current idea to merge with updates
    const current = await sql`SELECT * FROM ideas WHERE id = ${id}`
    
    if (current.length === 0) {
      return NextResponse.json(
        { error: "Idea not found" },
        { status: 404 }
      )
    }
    
    const idea = current[0]
    
    // Determine new values
    const newContent = content !== undefined ? content.trim() : idea.content
    const newStatus = status !== undefined ? status : idea.status
    const newTags = tags !== undefined ? tags : idea.tags
    const newPinned = pinned !== undefined ? pinned : idea.pinned
    const newBackgroundColor = background_color !== undefined ? background_color : idea.background_color
    
    // Handle deleted_at based on status transitions
    let newDeletedAt = idea.deleted_at
    if (status === 'deleted' && !idea.deleted_at) {
      // Moving to trash - set deleted_at
      newDeletedAt = new Date().toISOString()
    } else if ((status === 'inbox' || status === 'archived') && idea.status === 'deleted') {
      // Restoring from trash - clear deleted_at
      newDeletedAt = null
    }
    
    const result = await sql`
      UPDATE ideas 
      SET 
        content = ${newContent},
        status = ${newStatus},
        tags = ${newTags},
        pinned = ${newPinned},
        background_color = ${newBackgroundColor},
        deleted_at = ${newDeletedAt},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `
    
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
