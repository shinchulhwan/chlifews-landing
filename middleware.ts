import { type NextRequest, NextResponse } from "next/server";
import { handleAdminAuth } from "@/lib/auth/admin-middleware";

export function middleware(request: NextRequest) {
  // Server Actions / RSC 요청은 리다이렉트하지 않음
  if (
    request.headers.has("next-action") ||
    request.headers.has("rsc") ||
    request.nextUrl.pathname.startsWith("/api/")
  ) {
    return NextResponse.next();
  }

  const response = handleAdminAuth(request);
  return response ?? NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
