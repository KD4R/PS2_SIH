import { NextResponse } from "next/server";
import { requireRole } from "@/lib/server/auth";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireRole("department_officer");
  if (response) return response;

  const { id } = await params;

  try {
    const supabase = await createClient();
    // Due to RLS, it will only delete if department_id matches user.id
    const { error } = await supabase
      .from("challenges")
      .delete()
      .eq("id", id)
      .eq("department_id", user!.id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
