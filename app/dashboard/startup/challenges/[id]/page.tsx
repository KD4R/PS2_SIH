"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CircleCheck, PartyPopper, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DashboardShell } from "@/components/demo/dashboard-shell";
import { StatusPill } from "@/components/demo/status-pill";
import { EligibilityChecker } from "@/components/demo/eligibility-checker";
import { useDemoStore } from "@/lib/demo/store";
import { seed } from "@/lib/demo/store";
import { useToast } from "@/lib/demo/toast";
import { fmtDate, fmtINR } from "@/lib/demo/format";

const NAV = [
  { key: "demand", label: "nav.demand", icon: ArrowLeft, href: "/dashboard/startup" },
  { key: "applications", label: "nav.applications", icon: ArrowLeft, href: "/dashboard/startup" },
];

export default function StartupChallengePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const id = params.id;

  const hydrated = useDemoStore((s) => s.hydrated);
  const challenge = useDemoStore((s) => s.challenges.find((c) => c.id === id));
  const existing = useDemoStore((s) => s.proposals.find((p) => p.challengeId === id && p.startupId === seed.CURRENT_STARTUP.id));
  const submitProposal = useDemoStore((s) => s.submitProposal);
  const me = seed.CURRENT_STARTUP;

  const [wizard, setWizard] = useState(false);
  const [summary, setSummary] = useState("");
  const [cost, setCost] = useState("");
  const [months, setMonths] = useState("6");
  const [submitted, setSubmitted] = useState(false);

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <div className="h-8 w-64 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  if (!challenge) {
    return (
      <DashboardShell role="startup" userName={me.name} userSubtitle={me.founder} nav={NAV} activeKey="demand" title="Challenge">
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <p className="font-medium">Challenge not found.</p>
          <Link href="/dashboard/startup" className="mt-3 inline-block text-sm text-primary hover:underline">Back to radar</Link>
        </div>
      </DashboardShell>
    );
  }

  const submit = () => {
    submitProposal({
      challengeId: challenge.id,
      startupId: me.id,
      summary: summary.trim(),
      costEstimate: Math.round(Number(cost || "0") * 100_000),
      timelineMonths: Number(months),
    });
    setSubmitted(true);
  };

  return (
    <DashboardShell role="startup" userName={me.name} userSubtitle={me.founder} nav={NAV} activeKey="demand" title={challenge.title}>
      <div className="mx-auto max-w-4xl space-y-6">
        <Link href="/dashboard/startup" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Demand radar
        </Link>

        {submitted ? (
          <section className="rounded-2xl border border-emerald-200 bg-gradient-to-b from-emerald-50 to-card p-10 text-center animate-in fade-in zoom-in-95">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <PartyPopper className="h-8 w-8 text-emerald-600" />
            </div>
            <h2 className="mt-4 text-2xl font-bold">Proposal submitted</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              {challenge.department} has been notified. Track the status under “My applications”.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button onClick={() => router.push("/dashboard/startup")}>Back to dashboard</Button>
            </div>
          </section>
        ) : (
          <>
            {/* Challenge header */}
            <section className="rounded-xl border border-border bg-card p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusPill status={challenge.status} />
                    <span className="text-xs text-muted-foreground">Deadline {fmtDate(challenge.deadline)}</span>
                  </div>
                  <h2 className="mt-2 text-xl font-bold">{challenge.title}</h2>
                  <p className="text-sm text-muted-foreground">{challenge.department} · {challenge.district} · {challenge.domain}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary">{fmtINR(challenge.budgetMin)} – {fmtINR(challenge.budgetMax)}</p>
                  <p className="text-xs text-muted-foreground">{challenge.durationMonths}-month pilot</p>
                </div>
              </div>

              <div className="mt-5 space-y-4 border-t border-border pt-4 text-sm">
                <div>
                  <p className="font-medium">Problem statement</p>
                  <p className="mt-1 leading-relaxed text-muted-foreground">{challenge.problemStatement}</p>
                </div>
                <div>
                  <p className="font-medium">Outcome statement</p>
                  <p className="mt-1 leading-relaxed text-muted-foreground">{challenge.outcomeStatement}</p>
                </div>
                <div>
                  <p className="font-medium">Eligibility</p>
                  <ul className="mt-1 list-inside list-disc space-y-1 text-muted-foreground">
                    {challenge.eligibility.map((e) => <li key={e}>{e}</li>)}
                  </ul>
                </div>
              </div>
            </section>

            {/* Eligibility checker */}
            <section className="rounded-xl border border-border bg-card p-6">
              <h3 className="mb-4 font-semibold">Eligibility relaxation check</h3>
              <EligibilityChecker startup={me} challenge={challenge} />
            </section>

            {/* Apply */}
            <section className="rounded-xl border border-border bg-card p-6">
              {existing ? (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">You already applied to this challenge.</p>
                    <p className="text-sm text-muted-foreground">Status: <StatusPill status={existing.status} className="ml-1" /></p>
                  </div>
                  <Button variant="outline" onClick={() => router.push("/dashboard/startup")}>Track in dashboard</Button>
                </div>
              ) : !wizard ? (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-muted-foreground">Ready with your approach? Submit an outcome-linked proposal.</p>
                  <Button onClick={() => setWizard(true)} disabled={challenge.status === "Closed"}>
                    <Send className="h-4 w-4" /> Submit proposal
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="font-semibold">Proposal wizard</h3>
                  <div className="space-y-1.5">
                    <Label>Technical approach & summary</Label>
                    <Textarea className="min-h-28" value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="How will you deliver the outcome statement? Mention architecture, deployment plan and team." />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Cost estimate (₹ lakh)</Label>
                      <Input type="number" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="e.g. 12" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Timeline (months)</Label>
                      <Input type="number" value={months} onChange={(e) => setMonths(e.target.value)} />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setWizard(false)}>Cancel</Button>
                    <Button onClick={submit} disabled={!summary.trim() || !cost}>
                      <CircleCheck className="h-4 w-4" /> Submit proposal
                    </Button>
                  </div>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </DashboardShell>
  );
}
