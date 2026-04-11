import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  const timestamp = new Date().toISOString()

  try {
    await sql`SELECT 1`

    return NextResponse.json({
      status: "ok",
      timestamp,
      db: "connected",
    })
  } catch {
    return NextResponse.json(
      {
        status: "degraded",
        timestamp,
        db: "disconnected",
      },
      { status: 503 }
    )
  }
}
