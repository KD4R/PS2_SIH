import React from "react";
import { getCurrentUser } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/server/auth";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PilotDashboardClient } from "@/features/pilot-dashboard/components/pilot-dashboard-client";

export const metadata = { title: "Pilot Dashboard" };

export default async function PilotDashboardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const role = await getUserRole(user.id);
  const supabase = await createClient();

  const { data: proposal } = await supabase
    .from("procurement_proposals")
    .select(`
      id, status, startup_id, challenge_id, 
      profiles!procurement_proposals_startup_id_fkey(startup_name),
      challenges(title, department_id)
    `)
    .eq("id", id)
    .single();

  if (!proposal) {
    return <div className="p-8 text-center text-muted-foreground">Proposal not found or pilot inactive.</div>;
  }

  const { data: kpis } = await supabase.from("pilot_kpis").select("*").eq("proposal_id", id);
  const { data: evidence } = await supabase.from("pilot_evidence").select("*").eq("proposal_id", id);
  const { data: observations } = await supabase.from("kpi_observations").select("*").in("kpi_id", (kpis || []).map(k => k.id));
  const { data: validations } = await supabase.from("validation_results").select("*").eq("proposal_id", id);

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-display font-semibold tracking-tight text-foreground">Pilot Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Challenge: {(proposal.challenges as any)?.title} <br/>
          Startup: {(proposal.profiles as any)?.startup_name} <br/>
          Status: <span className="uppercase font-bold text-primary">{proposal.status.replace("_", " ")}</span>
        </p>
      </div>
      
      <PilotDashboardClient 
        proposalId={id} 
        role={role} 
        status={proposal.status}
        initialKpis={kpis || []} 
        initialEvidence={evidence || []} 
        initialObservations={observations || []}
        initialValidations={validations || []}
      />
    </div>
  );
}
