import { NextResponse } from "next/server";
import { requireRole } from "@/lib/server/auth";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireRole("department_officer");
  if (response) return response;

  try {
    const { id } = await params;
    const supabase = await createClient();

    // Just reset the status to submitted and wipe the meeting ID
    const { error } = await supabase
      .from("procurement_proposals")
      .update({ status: "submitted", meeting_id: null })
      .eq("id", id);

    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
