import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
    const headers = new Headers(request.headers)
    headers.set("X-Pathname", request.nextUrl.pathname)
    headers.set("X-Search-Params", request.nextUrl.search)
    return NextResponse.next({ headers })
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
