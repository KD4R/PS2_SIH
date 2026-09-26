import { NextResponse } from "next/server";
import { requireRole } from "@/lib/server/auth";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  // OWASP: Broken Access Control - Enforce strict RBAC for scaling decisions
  const { user, response } = await requireRole("department_officer");
  if (response) return response;

  try {
    const { id } = await params;
    const supabase = await createClient();

    // Fetch the proposal to build the GeM export
    const { data: proposal, error } = await supabase
      .from("procurement_proposals")
      .select(`
        id, 
        startup_id,
        challenges(title),
        status,
        gem_exported
      `)
      .eq("id", id)
      .single();

    if (error || !proposal) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }

    if (proposal.status !== "decided") {
      return NextResponse.json({ error: "Only 'decided' (completed) pilots can be exported to GeM." }, { status: 400 });
    }

    if (proposal.gem_exported) {
      return NextResponse.json({ error: "Already exported to GeM." }, { status: 400 });
    }

    const { data: startupProfile } = await supabase
      .from("profiles")
      .select("startup_name, dpiit_number")
      .eq("id", proposal.startup_id)
      .single();

    const gemExportId = `GEM-INNO-${Date.now()}`;

    // 1. Mark as exported in our DB
    const { error: updateError } = await supabase
      .from("procurement_proposals")
      .update({ 
        gem_exported: true,
        gem_export_id: gemExportId 
      })
      .eq("id", id);

    if (updateError) throw updateError;

    // 2. Generate the mock GeM JSON Schema
    const gemSchema = {
      action: "CREATE_CUSTOM_CATALOG",
      export_id: gemExportId,
      department_buyer_id: user!.id,
      category: "Innovative Software Solutions (Startups)",
      product_name: `${startupProfile?.startup_name} - ${(proposal.challenges as any)?.title} Solution`,
      vendor_details: {
        vendor_id: proposal.startup_id,
        company_name: startupProfile?.startup_name,
        dpiit_registration: startupProfile?.dpiit_number || "PENDING",
        msme_status: "REGISTERED",
      },
      specifications: [
        { key: "Deployment Type", value: "Cloud / On-Premise" },
        { key: "Pilot Success Verified", value: "Yes (via HackAgent State Portal)" },
        { key: "Security Audited", value: "Yes" }
      ],
      pricing_model: "Subscription / License based on Pilot finalization",
      status: "PENDING_GEM_APPROVAL",
      timestamp: new Date().toISOString()
    };

    return NextResponse.json({ 
      success: true, 
      message: "Successfully exported to Government e-Marketplace (GeM) Sandbox.",
      gemExportId,
      schema: gemSchema 
    });

  } catch (error: any) {
    console.error("[GeM Export Error]", error.message);
    return NextResponse.json({ error: "Failed to export to GeM." }, { status: 500 });
  }
}
