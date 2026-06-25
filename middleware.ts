import { type NextRequest, NextResponse } from "next/server";
import { handleAdminAuth } from "@/lib/auth/admin-middleware";

export function middleware(request: NextRequest) {
  const response = handleAdminAuth(request);
  return response ?? NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
