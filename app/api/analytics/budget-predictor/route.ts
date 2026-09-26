import { NextResponse } from "next/server";
import { requireRole } from "@/lib/server/auth";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  // OWASP: Access Control
  const { response } = await requireRole("department_officer");
  if (response) return response;

  try {
    const supabase = await createClient();

    // Fetch all active proposals and their pending milestones
    const { data: activePilots, error } = await supabase
      .from("procurement_proposals")
      .select(`
        id, status, challenges(title), profiles(startup_name),
        procurement_milestones(id, title, payment_inr, status, due_date)
      `)
      .eq("status", "pilot_active");

    if (error) throw error;

    const currentYear = new Date().getFullYear();
    // India Financial Year ends March 31st
    const march31st = new Date(`${currentYear + 1}-03-31T23:59:59Z`);

    let totalPendingFunds = 0;
    let fundsAtRiskOfLapse = 0;
    const riskyPilots: any[] = [];

    activePilots.forEach((pilot) => {
      let pilotPending = 0;
      let pilotLapseRisk = 0;
      let hasRiskyMilestones = false;

      pilot.procurement_milestones.forEach((ms: any) => {
        if (ms.status === "pending" || ms.status === "evidence_submitted") {
          pilotPending += ms.payment_inr || 0;
          
          if (ms.due_date) {
            const dueDate = new Date(ms.due_date);
            // If the milestone is due within 30 days of March 31st, it's highly risky
            const daysToDeadline = (march31st.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24);
            
            if (daysToDeadline < 30) {
              pilotLapseRisk += ms.payment_inr || 0;
              hasRiskyMilestones = true;
            }
          } else {
            // No due date set? Extreme risk of lapse.
            pilotLapseRisk += ms.payment_inr || 0;
            hasRiskyMilestones = true;
          }
        }
      });

      totalPendingFunds += pilotPending;
      fundsAtRiskOfLapse += pilotLapseRisk;

      if (hasRiskyMilestones) {
        riskyPilots.push({
          proposalId: pilot.id,
          startupName: (pilot.profiles as any)?.startup_name,
          project: (pilot.challenges as any)?.title,
          fundsAtRisk: pilotLapseRisk,
          warning: "Milestones are projected to finish too close to March 31st. High risk of budget lapse."
        });
      }
    });

    const report = {
      financialYearEnd: march31st.toISOString().split("T")[0],
      totalActivePilots: activePilots.length,
      totalPendingEscrowInr: totalPendingFunds,
      fundsAtRiskOfLapseInr: fundsAtRiskOfLapse,
      riskyPilots
    };

    return NextResponse.json({ success: true, report });

  } catch (error: any) {
    console.error("[Budget Predictor Error]", error.message);
    return NextResponse.json({ error: "Failed to generate March 31st fund predictor." }, { status: 500 });
  }
}
