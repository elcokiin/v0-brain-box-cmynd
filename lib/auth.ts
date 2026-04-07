import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
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

        if (existingUser.length === 0) {
          // Create new user
          const newUser = await sql`
            INSERT INTO users (name, email, image)
            VALUES (${user.name}, ${user.email}, ${user.image})
            RETURNING id
          `
          user.id = newUser[0].id
        } else {
          user.id = existingUser[0].id
          // Update user info
          await sql`
            UPDATE users 
            SET name = ${user.name}, image = ${user.image}, updated_at = NOW()
            WHERE id = ${existingUser[0].id}
          `
        }

        // Store or update account
        if (account) {
          const existingAccount = await sql`
            SELECT id FROM accounts 
            WHERE provider = ${account.provider} AND provider_account_id = ${account.providerAccountId}
          `

          if (existingAccount.length === 0) {
            await sql`
              INSERT INTO accounts (user_id, type, provider, provider_account_id, access_token, refresh_token, expires_at, token_type, scope, id_token)
              VALUES (${user.id}, ${account.type}, ${account.provider}, ${account.providerAccountId}, ${account.access_token}, ${account.refresh_token}, ${account.expires_at}, ${account.token_type}, ${account.scope}, ${account.id_token})
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
})
