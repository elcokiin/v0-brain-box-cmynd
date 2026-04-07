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

// PATCH - Update idea (content, status, tags)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { content, status, tags } = body
    
    // Build dynamic update query
    const updates: string[] = []
    const values: Record<string, unknown> = { id }
    
    if (content !== undefined) {
      values.content = content.trim()
    }
    if (status !== undefined) {
      values.status = status
    }
    if (tags !== undefined) {
      values.tags = tags
    }
    
    const result = await sql`
      UPDATE ideas 
      SET 
        content = COALESCE(${values.content ?? null}, content),
        status = COALESCE(${values.status ?? null}, status),
        tags = COALESCE(${values.tags ?? null}, tags),
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

// DELETE - Soft delete (move to deleted status)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const result = await sql`
      UPDATE ideas 
      SET status = 'deleted', updated_at = NOW()
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
    console.error("Failed to delete idea:", error)
    return NextResponse.json(
      { error: "Failed to delete idea" },
      { status: 500 }
    )
  }
}
