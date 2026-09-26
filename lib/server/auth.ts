import { NextResponse } from "next/server";
import { getCurrentUser, isSupabaseConfigured, createClient } from "@/lib/supabase/server";

/** Route handlers use this before reading or mutating user-owned data. */
export async function requireUser() {
  if (!isSupabaseConfigured()) return { user: null, response: NextResponse.json({ error: "Supabase is not configured.", code: "SUPABASE_NOT_CONFIGURED" }, { status: 503 }) };
  const user = await getCurrentUser();
  if (!user) return { user: null, response: NextResponse.json({ error: "Sign in is required.", code: "UNAUTHORIZED" }, { status: 401 }) };
  return { user, response: null };
}

/** 
 * Gets the authoritative role from the database. 
 * Falls back to user_metadata only if DB fetch fails (e.g., race condition on signup).
 */
export async function getUserRole(userId: string, fallbackMetadataRole: string = "startup_founder"): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle();
  
  if (!error && data?.role) {
    return data.role;
  }
  return fallbackMetadataRole;
}

/** Route handlers use this to restrict access by role. */
export async function requireRole(allowedRoles: string | string[]) {
  const { user, response } = await requireUser();
  if (response) return { user, role: "", response };
  
  const fallbackRole = user?.user_metadata?.role || "startup_founder";
  const role = await getUserRole(user!.id, fallbackRole);
  
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  if (!roles.includes(role)) {
    return { user, role, response: NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 }) };
  }
  return { user, role, response: null };
}

/** Route handlers use this to allow access to any of the specified roles. Alias for requireRole(array) for better readability. */
export async function requireAnyRole(allowedRoles: string[]) {
  return requireRole(allowedRoles);
}
