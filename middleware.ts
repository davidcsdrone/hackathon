import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If user is not signed in and the current path is not auth related, redirect to signin
  if (!session && req.nextUrl.pathname.startsWith("/chat")) {
    return NextResponse.redirect(new URL("/auth/signin", req.url))
  }

  // If user is not signed in and the current path is not auth related, redirect to signin
  if (!session && req.nextUrl.pathname.startsWith("/history")) {
    return NextResponse.redirect(new URL("/auth/signin", req.url))
  }

  // If user is signed in and the current path is auth related, redirect to chat
  if (session && req.nextUrl.pathname.startsWith("/auth")) {
    return NextResponse.redirect(new URL("/chat", req.url))
  }

  return res
}

export const config = {
  matcher: ["/chat/:path*", "/history/:path*", "/auth/:path*"],
}
