import crypto from "crypto"
import { sql } from "@/lib/db"

export function generateApiKey(): string {
  return `bb_${crypto.randomBytes(24).toString("hex")}`
}

export function hashApiKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex")
}

export async function ensureApiKeysTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS api_keys (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      key_hash TEXT NOT NULL UNIQUE,
      key_preview TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      last_used_at TIMESTAMPTZ
    );
  `

  await sql`CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);`
  await sql`CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys(key_hash);`
}

export async function getUserIdFromApiKey(apiKey: string): Promise<string | null> {
  await ensureApiKeysTable()
  const keyHash = hashApiKey(apiKey)

  const result = await sql`
    SELECT user_id FROM api_keys
    WHERE key_hash = ${keyHash}
    LIMIT 1
  `

  if (result.length === 0) {
    return null
  }

  await sql`
    UPDATE api_keys
    SET last_used_at = NOW()
    WHERE key_hash = ${keyHash}
  `

  return result[0].user_id
}
