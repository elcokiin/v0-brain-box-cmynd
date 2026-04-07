import { neon } from "@neondatabase/serverless"
import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"

const sql = neon(process.env.DATABASE_URL!)

// Debug: Log auth configuration on startup
if (typeof window === "undefined") {
  console.log("[v0] Auth config - NEXTAUTH_URL:", process.env.NEXTAUTH_URL)
  console.log("[v0] Auth config - GOOGLE_CLIENT_ID set:", !!process.env.GOOGLE_CLIENT_ID)
  console.log("[v0] Auth config - NEXTAUTH_SECRET set:", !!process.env.NEXTAUTH_SECRET)
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false

      try {
        // Check if user exists
        const existingUser = await sql`
          SELECT id FROM users WHERE email = ${user.email}
        `

        let userId: string

        if (existingUser.length === 0) {
          // Create new user
          const newUser = await sql`
            INSERT INTO users (name, email, image)
            VALUES (${user.name}, ${user.email}, ${user.image})
            RETURNING id
          `
          userId = newUser[0].id
        } else {
          userId = existingUser[0].id
          // Update user info
          await sql`
            UPDATE users 
            SET name = ${user.name}, image = ${user.image}, updated_at = NOW()
            WHERE id = ${existingUser[0].id}
          `
        }

        // Store user id for session
        user.id = userId

        // Store or update account
        if (account) {
          const existingAccount = await sql`
            SELECT id FROM accounts 
            WHERE provider = ${account.provider} AND provider_account_id = ${account.providerAccountId}
          `

          if (existingAccount.length === 0) {
            await sql`
              INSERT INTO accounts (user_id, type, provider, provider_account_id, access_token, refresh_token, expires_at, token_type, scope, id_token)
              VALUES (${userId}, ${account.type}, ${account.provider}, ${account.providerAccountId}, ${account.access_token ?? null}, ${account.refresh_token ?? null}, ${account.expires_at ?? null}, ${account.token_type ?? null}, ${account.scope ?? null}, ${account.id_token ?? null})
            `
          }
        }

        return true
      } catch (error) {
        console.error("Error in signIn callback:", error)
        return false
      }
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        // Get user ID from database
        const user = await sql`
          SELECT id FROM users WHERE email = ${session.user.email}
        `
        if (user.length > 0) {
          session.user.id = user[0].id
        }
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
}
