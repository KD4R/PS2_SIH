import { NextResponse } from "next/server";
import { getCurrentUser, isSupabaseConfigured } from "@/lib/supabase/server";

/** Route handlers use this before reading or mutating user-owned data. */
export async function requireUser() {
  if (!isSupabaseConfigured()) return { user: null, response: NextResponse.json({ error: "Supabase is not configured.", code: "SUPABASE_NOT_CONFIGURED" }, { status: 503 }) };
  const user = await getCurrentUser();
  if (!user) return { user: null, response: NextResponse.json({ error: "Sign in is required.", code: "UNAUTHORIZED" }, { status: 401 }) };
  return { user, response: null };
}

import { cookies } from "next/headers";

/** Route handlers use this to restrict access by role. */
export async function requireRole(allowedRoles: string | string[]) {
  const { user, response } = await requireUser();
  if (response) return { user, role: "", response };
  
  const cookieStore = await cookies();
  const demoRole = cookieStore.get("demo_role")?.value;
  const role = demoRole || user?.user_metadata?.role || "startup_founder";
  
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  if (!roles.includes(role)) {
    return { user, role, response: NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 }) };
  }
  return { user, role, response: null };
}
