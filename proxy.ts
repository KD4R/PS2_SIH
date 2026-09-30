import { NextResponse, type NextRequest } from "next/server";
import { DEMO_MODE } from "@/lib/demo/config";
import { getSessionUser } from "@/lib/supabase/proxy";

const protectedPrefixes = [
  "/dashboard",
  "/challenges",
  "/proposals",
  "/pilot",
  "/settings",
];

export async function proxy(request: NextRequest) {
  // Demo mode needs no backend: let every request through untouched.
  if (DEMO_MODE) return NextResponse.next();

  const isProtected = protectedPrefixes.some(
    (prefix) => request.nextUrl.pathname === prefix || request.nextUrl.pathname.startsWith(`${prefix}/`),
  );

  const { response, user } = await getSessionUser(request);
  if (!isProtected) return response;
  if (user) return response;

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"] };
