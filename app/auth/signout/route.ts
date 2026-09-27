import { NextResponse } from "next/server";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export async function POST(request: Request) {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  
  const response = NextResponse.redirect(new URL("/", request.url), { status: 303 });
  
  // Clear the demo_role cookie so automatic role-based routing is reset
  response.cookies.delete("demo_role");
  
  return response;
}
