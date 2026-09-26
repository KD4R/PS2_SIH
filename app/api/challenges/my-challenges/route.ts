import { NextResponse } from "next/server";
import { requireRole } from "@/lib/server/auth";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const { user, response } = await requireRole("department_officer");
  if (response) return response;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("challenges")
      .select("*")
      .eq("department_id", user!.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ challenges: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
