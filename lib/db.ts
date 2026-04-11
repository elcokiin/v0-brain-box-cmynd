import { neon } from '@neondatabase/serverless'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set')
}

export const sql = neon(process.env.DATABASE_URL)

export type Idea = {
  id: string
  content: string
  source: 'web' | 'telegram' | 'api'
  status: 'inbox' | 'archived' | 'deleted'
  tags: string[] | null
  pinned: boolean
  background_color: string | null
  deleted_at: string | null
  created_at: string
  updated_at: string
}
