"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, BarChart3, FileSignature, Gauge, ScrollText, ShieldCheck, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DashboardShell } from "@/components/demo/dashboard-shell";
import { StatusPill } from "@/components/demo/status-pill";
import { AuditTimeline } from "@/components/demo/audit-timeline";
import { AgreementTab } from "@/features/pilots/components/agreement-tab";
import { KpiTab } from "@/features/pilots/components/kpi-tab";
import { RiskSandboxTab } from "@/features/pilots/components/risk-sandbox-tab";
import { ComplianceTab } from "@/features/pilots/components/compliance-tab";
import { useDemoStore, usePublicStats } from "@/lib/demo/store";
import { seed } from "@/lib/demo/store";
import { useToast } from "@/lib/demo/toast";
import { fmtDate, fmtINR } from "@/lib/demo/format";
import { cn } from "@/lib/utils";

const NAV = [
  { key: "overview", label: "nav.overview", icon: BarChart3, href: "/dashboard/gov" },
  { key: "pilots", label: "nav.pilots", icon: Gauge, href: "/dashboard/gov" },
];

const TABS = [
  { key: "overview", label: "Overview", icon: BarChart3 },
  { key: "agreement", label: "Agreement & Payments", icon: FileSignature },
  { key: "kpis", label: "KPIs", icon: Gauge },
  { key: "risk", label: "Risk & Sandbox", icon: TriangleAlert },
  { key: "compliance", label: "Compliance", icon: ShieldCheck },
  { key: "audit", label: "Audit", icon: ScrollText },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function GovPilotDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const id = params.id;

  const hydrated = useDemoStore((s) => s.hydrated);
  const pilot = useDemoStore((s) => s.pilots.find((p) => p.id === id));
  const startup = useDemoStore((s) => s.startups.find((st) => st.id === pilot?.startupId));
  const challenge = useDemoStore((s) => s.challenges.find((c) => c.id === pilot?.challengeId));
  const auditLog = useDemoStore((s) => s.auditLog);
  const approveMilestone = useDemoStore((s) => s.approveMilestone);
  const rejectMilestone = useDemoStore((s) => s.rejectMilestone);
  const markPilotCompleted = useDemoStore((s) => s.markPilotCompleted);
  const sendForValidation = useDemoStore((s) => s.sendForValidation);
  const setCompliance = useDemoStore((s) => s.setCompliance);
  const stats = usePublicStats();

  const [tab, setTab] = useState<TabKey>("overview");
  const [rejectMs, setRejectMs] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <div className="h-8 w-64 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  if (!pilot || !startup || !challenge) {
    return (
      <DashboardShell role="gov" userName={seed.CURRENT_USER.gov.name} userSubtitle={seed.CURRENT_USER.gov.title} nav={NAV} activeKey="pilots" title="Pilot">
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <p className="font-medium">Pilot not found.</p>
          <Link href="/dashboard/gov" className="mt-3 inline-block text-sm text-primary hover:underline">Back to overview</Link>
        </div>
      </DashboardShell>
    );
  }

  const evidencePending = pilot.milestones.filter((m) => m.status === "Evidence Submitted");
  const frozen = pilot.sandbox.killSwitchActive;

  return (
    <DashboardShell role="gov" userName={seed.CURRENT_USER.gov.name} userSubtitle={seed.CURRENT_USER.gov.title} nav={NAV} activeKey="pilots" title={`${challenge.title} — pilot`}>
      <div className="mx-auto max-w-5xl space-y-6">
        <Link href="/dashboard/gov" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Overview
        </Link>

        {/* Header card */}
        <section className="rounded-xl border border-border bg-card p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill status={pilot.status} />
                {pilot.validation?.status === "Completed" && !pilot.scale && (
                  <Button size="sm" variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50" onClick={() => router.push(`/dashboard/gov/pilots/${pilot.id}/scale`)}>
                    Scale-up decision ready →
                  </Button>
                )}
              </div>
              <h2 className="mt-2 text-xl font-bold">{challenge.title}</h2>
              <p className="text-sm text-muted-foreground">
                {startup.name} · {fmtINR(pilot.contractValue)} · {challenge.department}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {pilot.status === "In Progress" && (
                <Button
                  size="sm"
                  onClick={() => {
                    markPilotCompleted(pilot.id);
                    toast("Pilot marked completed — validation queue notified", "success");
                  }}
                >
                  Mark pilot completed
                </Button>
              )}
              {pilot.status === "Pilot Completed" && (
                <Button
                  size="sm"
                  onClick={() => {
                    sendForValidation(pilot.id);
                    toast("Sent for independent validation", "info");
                  }}
                >
                  Send for validation
                </Button>
              )}
            </div>
          </div>

          {/* Progress strip */}
          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border pt-4 text-xs text-muted-foreground">
            <span>Started {fmtDate(pilot.startDate)}</span>
            <span>Ends {fmtDate(pilot.endDate)}</span>
            <span>
              Payments released: {fmtINR(pilot.milestones.filter((m) => m.status === "Payment Released").reduce((s, m) => s + m.amount, 0))} of {fmtINR(pilot.contractValue)}
            </span>
            <span>Avg payment time: {stats.avgDaysToPayment} days</span>
          </div>
        </section>

        {/* Officer action: verify evidence */}
        {evidencePending.length > 0 && !frozen && (
          <section className="rounded-xl border border-amber-200 bg-amber-50/60 p-5">
            <p className="text-sm font-bold text-amber-900">Evidence awaiting verification ({evidencePending.length})</p>
            {evidencePending.map((m) => (
              <div key={m.id} className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-card px-4 py-3">
                <div>
                  <p className="text-sm font-semibold">{m.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {fmtINR(m.amount)} · evidence: {m.evidenceName ?? "uploaded"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => { approveMilestone(m.id); toast(`Payment of ${fmtINR(m.amount)} released to ${startup.name}`, "success"); }}>
                    Approve & release payment
                  </Button>
                  <Button size="sm" variant="outline" className="border-red-200 text-red-700 hover:bg-red-50" onClick={() => setRejectMs(m.id)}>
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </section>
        )}

        {frozen && (
          <div className="rounded-xl border border-red-300 bg-red-50 px-5 py-4 text-sm font-bold text-red-800">
            Kill switch active — milestone actions are frozen.
          </div>
        )}

        {/* Tabs */}
        <div className="flex flex-wrap gap-1.5 rounded-xl border border-border bg-card p-1.5">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
                  tab === t.key ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="h-3.5 w-3.5" /> {t.label}
              </button>
            );
          })}
        </div>

        <section className="rounded-xl border border-border bg-card p-6">
          {tab === "overview" && (
            <div className="space-y-4 text-sm">
              <p className="font-semibold">Pilot summary</p>
              <p className="leading-relaxed text-muted-foreground">
                {startup.name} is delivering “{challenge.title}” for {challenge.department} under a milestone-based pilot
                agreement of {fmtINR(pilot.contractValue)}. The sandbox covers {pilot.sandbox.area} for{" "}
                {pilot.sandbox.durationWeeks} weeks with a budget cap of {fmtINR(pilot.sandbox.budgetCap)}.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-2 md:grid-cols-4">
                {[
                  ["Contract", fmtINR(pilot.contractValue)],
                  ["Milestones", `${pilot.milestones.filter((m) => m.status === "Payment Released").length}/${pilot.milestones.length} paid`],
                  ["KPIs on target", `${pilot.kpis.filter((k) => (k.lowerIsBetter ? k.actual <= k.target : k.actual >= k.target)).length}/${pilot.kpis.length}`],
                  ["Validation", pilot.validation?.status ?? "Not started"],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-lg border border-border bg-muted/20 p-3">
                    <p className="text-xs text-muted-foreground">{k}</p>
                    <p className="mt-0.5 font-semibold">{v}</p>
                  </div>
                ))}
              </div>
              {pilot.scale && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                  Scale-up decision: <strong>{pilot.scale.outcome}</strong> — {pilot.scale.districts.join(", ")} · {pilot.scale.pathway}
                </div>
              )}
            </div>
          )}

          {tab === "agreement" && (
            <AgreementTab
              pilot={pilot}
              startup={startup}
              challenge={challenge}
              department={challenge.department}
              avgPaymentDays={stats.avgDaysToPayment}
            />
          )}

          {tab === "kpis" && <KpiTab pilot={pilot} />}

          {tab === "risk" && (
            <RiskSandboxTab
              pilot={pilot}
              canAct={pilot.status === "In Progress" || pilot.status === "Contract Signed"}
            />
          )}

          {tab === "compliance" && <ComplianceTab pilot={pilot} onToggle={setCompliance ? (patch) => setCompliance(pilot.id, patch) : undefined} />}
          {tab === "audit" && (
            <AuditTimeline events={auditLog.filter((e) => e.entityId === pilot.id || e.entity === "Pilot" || e.entity === "Milestone")} />
          )}
        </section>
      </div>

      {/* Reject milestone dialog */}
      <Dialog open={rejectMs !== null} onOpenChange={(v) => !v && setRejectMs(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject evidence</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">The startup will be asked to revise and resubmit.</p>
          <Textarea rows={3} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="What needs to be fixed?" className="resize-none" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectMs(null)}>Cancel</Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={!rejectReason.trim()}
              onClick={() => {
                if (rejectMs) {
                  rejectMilestone(rejectMs, rejectReason.trim());
                  toast("Evidence rejected — startup notified", "warning");
                  setRejectMs(null);
                  setRejectReason("");
                }
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
