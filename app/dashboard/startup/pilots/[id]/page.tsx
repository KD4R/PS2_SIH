"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Gauge, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DashboardShell } from "@/components/demo/dashboard-shell";
import { StatusPill } from "@/components/demo/status-pill";
import { AgreementTab } from "@/features/pilots/components/agreement-tab";
import { KpiTab } from "@/features/pilots/components/kpi-tab";
import { ComplianceTab } from "@/features/pilots/components/compliance-tab";
import { useDemoStore, usePublicStats } from "@/lib/demo/store";
import { seed } from "@/lib/demo/store";
import { useToast } from "@/lib/demo/toast";
import { fmtDate, fmtINR } from "@/lib/demo/format";
import { cn } from "@/lib/utils";
import type { Milestone } from "@/lib/demo/types";

const NAV = [
  { key: "demand", label: "nav.demand", icon: Gauge, href: "/dashboard/startup" },
  { key: "pilots", label: "nav.payments", icon: Gauge, href: "/dashboard/startup" },
];

export default function StartupPilotPage() {
  const params = useParams<{ id: string }>();
  const { toast } = useToast();
  const id = params.id;

  const hydrated = useDemoStore((s) => s.hydrated);
  const pilot = useDemoStore((s) => s.pilots.find((p) => p.id === id));
  const startup = useDemoStore((s) => s.startups.find((st) => st.id === pilot?.startupId));
  const challenge = useDemoStore((s) => s.challenges.find((c) => c.id === pilot?.challengeId));
  const submitEvidence = useDemoStore((s) => s.submitEvidence);
  const stats = usePublicStats();

  const [uploadFor, setUploadFor] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <div className="h-8 w-64 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  if (!pilot || !startup || !challenge) {
    return (
      <DashboardShell role="startup" userName={seed.CURRENT_STARTUP.name} userSubtitle={seed.CURRENT_STARTUP.sector} nav={NAV} activeKey="pilots" title="Pilot">
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <p className="font-medium">Pilot not found.</p>
          <Link href="/dashboard/startup" className="mt-3 inline-block text-sm text-primary hover:underline">Back to dashboard</Link>
        </div>
      </DashboardShell>
    );
  }

  const uploadable = pilot.milestones.filter((m) => m.status === "Pending" || m.status === "Rejected");

  const runUpload = (milestone: Milestone) => {
    setUploading(true);
    setProgress(0);
    const timer = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(timer);
          setUploading(false);
          submitEvidence(milestone.id, `${milestone.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-evidence.pdf`);
          toast(`Evidence submitted for ${milestone.title} — the department has been notified`, "success");
          setUploadFor(null);
          return 100;
        }
        return p + 20;
      });
    }, 180);
  };

  return (
    <DashboardShell role="startup" userName={startup.name} userSubtitle={startup.founder} nav={NAV} activeKey="pilots" title={`${challenge.title} — pilot`}>
      <div className="mx-auto max-w-5xl space-y-6">
        <Link href="/dashboard/startup" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Dashboard
        </Link>

        <section className="rounded-xl border border-border bg-card p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill status={pilot.status} />
                {pilot.sandbox.killSwitchActive && (
                  <span className="rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700">Frozen</span>
                )}
              </div>
              <h2 className="mt-2 text-xl font-bold">{challenge.title}</h2>
              <p className="text-sm text-muted-foreground">
                {challenge.department} · {fmtINR(pilot.contractValue)} · {fmtDate(pilot.startDate)} → {fmtDate(pilot.endDate)}
              </p>
            </div>
            {pilot.scale && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
                Outcome: <strong>{pilot.scale.outcome}</strong>
              </div>
            )}
          </div>
        </section>

        {/* Milestones with upload */}
        <section className="rounded-xl border border-border bg-card p-6">
          <h3 className="font-semibold">Milestones & payments</h3>
          <p className="mt-1 text-xs text-muted-foreground">Upload evidence when a milestone is delivered; the department verifies and releases payment.</p>
          <div className="mt-4 space-y-3">
            {pilot.milestones.map((m) => (
              <div key={m.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/20 px-4 py-3.5">
                <div>
                  <p className="text-sm font-semibold">{m.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {m.kpi} · due {fmtDate(m.dueDate)}
                    {m.evidenceName ? ` · evidence: ${m.evidenceName}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold tabular-nums">{fmtINR(m.amount)}</span>
                  <StatusPill status={m.status} />
                  {(m.status === "Pending" || m.status === "Rejected") && !pilot.sandbox.killSwitchActive && (
                    <Button size="sm" variant="outline" onClick={() => setUploadFor(m.id)}>
                      <Upload className="h-3.5 w-3.5" /> Upload evidence
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-6">
          <AgreementTab
            pilot={pilot}
            startup={startup}
            challenge={challenge}
            department={challenge.department}
            avgPaymentDays={stats.avgDaysToPayment}
            readOnly
          />
        </section>

        <section className="rounded-xl border border-border bg-card p-6">
          <h3 className="mb-4 font-semibold">KPI performance</h3>
          <KpiTab pilot={pilot} />
        </section>

        <section className="rounded-xl border border-border bg-card p-6">
          <h3 className="mb-4 font-semibold">Compliance</h3>
          <ComplianceTab pilot={pilot} />
        </section>
      </div>

      {/* Upload dialog with fake progress */}
      <Dialog open={uploadFor !== null} onOpenChange={(v) => !v && !uploading && setUploadFor(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload milestone evidence</DialogTitle>
          </DialogHeader>
          {uploading ? (
            <div className="space-y-3 py-4">
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary transition-all duration-150" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-center text-sm text-muted-foreground">Uploading… {progress}%</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Attach the verification pack for <strong>{pilot.milestones.find((m) => m.id === uploadFor)?.title}</strong>. The department reviews within 3 working days.
              </p>
              <div className="rounded-lg border-2 border-dashed border-border bg-muted/10 p-6 text-center">
                <Upload className="mx-auto h-6 w-6 text-muted-foreground" />
                <p className="mt-2 text-sm font-medium text-primary">evidence-pack.pdf</p>
                <p className="text-xs text-muted-foreground">PDF or ZIP, up to 25 MB</p>
              </div>
            </>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadFor(null)} disabled={uploading}>Cancel</Button>
            <Button onClick={() => { const m = pilot.milestones.find((x) => x.id === uploadFor); if (m) runUpload(m); }} disabled={uploading || !uploadFor}>
              {uploading ? "Uploading…" : "Submit evidence"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
