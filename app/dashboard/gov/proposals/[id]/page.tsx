"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Gavel, ShieldCheck, ThumbsDown, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DashboardShell } from "@/components/demo/dashboard-shell";
import { StatusPill } from "@/components/demo/status-pill";
import { EligibilityChecker } from "@/components/demo/eligibility-checker";
import { IntegrationBadge } from "@/components/demo/integration-badge";
import { AiEvaluationBoard } from "@/features/proposals/components/ai-evaluation-board";
import { useDemoStore } from "@/lib/demo/store";
import { seed } from "@/lib/demo/store";
import { useToast } from "@/lib/demo/toast";
import { downloadEvaluationPdf } from "@/lib/demo/pdf";
import { fmtDate } from "@/lib/demo/format";
import type { Role } from "@/lib/demo/types";
const NAV = [
  { key: "overview", label: "nav.overview", icon: Undo2, href: "/dashboard/gov" },
  { key: "proposals", label: "nav.proposals", icon: Gavel, href: "/dashboard/gov" },
  { key: "pilots", label: "nav.pilots", icon: ShieldCheck, href: "/dashboard/gov" },
];

export default function GovProposalDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const id = params.id;

  const hydrated = useDemoStore((s) => s.hydrated);
  const proposal = useDemoStore((s) => s.proposals.find((p) => p.id === id));
  const challenge = useDemoStore((s) => s.challenges.find((c) => c.id === proposal?.challengeId));
  const startup = useDemoStore((s) => s.startups.find((st) => st.id === proposal?.startupId));
  const evaluatorScores = useDemoStore((s) => (id ? s.evaluatorScores[id] : undefined));
  const approveProposal = useDemoStore((s) => s.approveProposal);
  const rejectProposal = useDemoStore((s) => s.rejectProposal);

  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");

  const pilot = useDemoStore((s) => s.pilots.find((p) => p.proposalId === id));

  const completedEval = useMemo(() => proposal?.evaluation, [proposal]);

  const handleApprove = () => {
    const created = approveProposal(id);
    if (created) {
      toast(`Pilot created — ${fmtINR(created.contractValue)} contract signed`, "success");
      router.push(`/dashboard/gov/pilots/${created.id}`);
    }
  };

  if (!hydrated) {
    return <ShellSkeleton />;
  }

  if (!proposal || !challenge || !startup) {
    return (
      <DashboardShell role="gov" userName={seed.CURRENT_USER.gov.name} userSubtitle={seed.CURRENT_USER.gov.title} nav={NAV} activeKey="proposals" title="Proposal">
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <p className="font-medium">Proposal not found.</p>
          <Link href="/dashboard/gov" className="mt-3 inline-block text-sm text-primary hover:underline">
            Back to overview
          </Link>
        </div>
      </DashboardShell>
    );
  }

  const decisionTaken = proposal.status === "Active Pilot" || proposal.status === "Approved" || proposal.status === "Rejected" || !!pilot;

  return (
    <DashboardShell role="gov" userName={seed.CURRENT_USER.gov.name} userSubtitle={seed.CURRENT_USER.gov.title} nav={NAV} activeKey="proposals" title="Proposal evaluation">
      <div className="mx-auto max-w-5xl space-y-6">
        <Link href="/dashboard/gov" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Overview
        </Link>

        {/* Summary */}
        <section className="rounded-xl border border-border bg-card p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill status={pilot ? "Active Pilot" : proposal.status === "Rejected" ? "Rejected" : proposal.status === "Evaluated" ? "Evaluated" : proposal.status === "Evaluating" ? "Evaluating" : "Submitted"} />
                <span className="text-xs text-muted-foreground">Fit score {proposal.fitScore}/100 · Submitted {fmtDate(proposal.submittedAt)}</span>
              </div>
              <h2 className="mt-2 text-xl font-bold">{startup.name}</h2>
              <p className="text-sm text-muted-foreground">
                for <span className="font-medium text-foreground">{challenge.title}</span> · {challenge.department}
              </p>
            </div>
            <IntegrationBadge kind="dpiit" verified={startup.dpiitVerified} />
          </div>

          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{proposal.summary}</p>

          <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-border pt-4 sm:grid-cols-4">
            {[
              ["Cost estimate", fmtINR(proposal.costEstimate)],
              ["Timeline", `${proposal.timelineMonths} months`],
              ["Budget window", `${fmtINR(challenge.budgetMin)}–${fmtINR(challenge.budgetMax)}`],
              ["Pilot duration", `${challenge.durationMonths} months`],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs text-muted-foreground">{k}</dt>
                <dd className="mt-0.5 text-sm font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Eligibility */}
        <section className="rounded-xl border border-border bg-card p-6">
          <h3 className="mb-4 font-semibold">Eligibility relaxation check</h3>
          <EligibilityChecker startup={startup} challenge={challenge} />
        </section>

        {/* AI board */}
        <section className="rounded-xl border border-border bg-card p-6">
          <AiEvaluationBoard proposal={proposal} startupName={startup.name} challengeTitle={challenge.title} />
        </section>

        {/* Independent evaluator scores */}
        {evaluatorScores && (
          <section className="rounded-xl border border-border bg-card p-6">
            <h3 className="mb-3 font-semibold">Independent evaluator scores</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {Object.entries(evaluatorScores).map(([k, v]) => (
                <div key={k} className="rounded-lg border border-border bg-muted/20 px-3 py-2.5">
                  <p className="text-xs capitalize text-muted-foreground">{k}</p>
                  <p className="text-lg font-bold tabular-nums">{v}<span className="text-xs font-normal text-muted-foreground">/100</span></p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Decision bar */}
        <section className="sticky bottom-4 rounded-xl border border-border bg-card/95 p-4 shadow-lg backdrop-blur">
          {decisionTaken ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-medium">
                {pilot ? "Decision recorded — pilot created." : proposal.status === "Rejected" ? "Decision recorded — proposal rejected." : "Decision recorded."}
              </p>
              {pilot && (
                <Button size="sm" onClick={() => router.push(`/dashboard/gov/pilots/${pilot.id}`)}>
                  Open pilot
                </Button>
              )}
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">Record the department decision for this proposal.</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    toast("Clarification request sent to the startup", "info");
                  }}
                >
                  Request clarification
                </Button>
                <Button variant="outline" className="border-red-200 text-red-700 hover:bg-red-50" onClick={() => setRejectOpen(true)}>
                  <ThumbsDown className="h-4 w-4" /> Reject
                </Button>
                <Button
                  onClick={handleApprove}
                  disabled={!completedEval}
                  title={completedEval ? undefined : "Run the AI evaluation first"}
                >
                  Approve for pilot
                </Button>
              </div>
            </div>
          )}
        </section>
      </div>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject proposal</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">The startup will be notified with your recorded reason.</p>
          <Textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason for rejection…" className="resize-none" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>Cancel</Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={!reason.trim()}
              onClick={() => {
                rejectProposal(id, reason.trim());
                setRejectOpen(false);
                setReason("");
                toast("Proposal rejected and startup notified", "warning");
              }}
            >
              Confirm rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}

function ShellSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30">
      <div className="h-8 w-64 animate-pulse rounded-lg bg-muted" />
    </div>
  );
}

function fmtINR(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}
