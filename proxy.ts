import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function proxy(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const isLoggedIn = !!token
  const isLoginPage = req.nextUrl.pathname === "/login"
  const isAuthRoute = req.nextUrl.pathname.startsWith("/api/auth")
  const isApiRoute = req.nextUrl.pathname.startsWith("/api/ideas")
  const isApiKeysRoute = req.nextUrl.pathname.startsWith("/api/api-keys")
  const isHealthRoute = req.nextUrl.pathname.startsWith("/api/health")

  if (isAuthRoute || isApiRoute || isApiKeysRoute || isHealthRoute) {
    return NextResponse.next()
  }

  if (isLoginPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/", req.url))
  }

  if (!isLoggedIn && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
}
