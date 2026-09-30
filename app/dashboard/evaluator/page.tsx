"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BarChart3, CheckCircle2, ClipboardList, FileText, LayoutGrid, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardShell, type ShellNavItem } from "@/components/demo/dashboard-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { useDemoStore } from "@/lib/demo/store";
import { seed } from "@/lib/demo/store";
import { useToast } from "@/lib/demo/toast";
import { fmtINR } from "@/lib/demo/format";

const NAV: ShellNavItem[] = [
  { key: "pending", label: "nav.pending", icon: ClipboardList },
  { key: "completed", label: "nav.completed", icon: CheckCircle2 },
  { key: "templates", label: "nav.templates", icon: FileText, href: "/dashboard/templates" },
  { key: "settings", label: "nav.settings", icon: Settings },
];

const RUBRICS = [
  { key: "tech", label: "Technical feasibility", desc: "Is the technology mature and viable for the outcome statement?" },
  { key: "scale", label: "Scalability", desc: "Can it be deployed across districts after the pilot?" },
  { key: "cost", label: "Cost effectiveness", desc: "Value for money against the budget window." },
  { key: "risk", label: "Risk & compliance", desc: "Data security, IP and operational risks." },
] as const;

type TabKey = "pending" | "completed" | "settings";

export default function EvaluatorDashboard() {
  const { toast } = useToast();
  const [tab, setTab] = useState<TabKey>("pending");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const hydrated = useDemoStore((s) => s.hydrated);
  const proposals = useDemoStore((s) => s.proposals);
  const challenges = useDemoStore((s) => s.challenges);
  const startups = useDemoStore((s) => s.startups);
  const evaluatorScores = useDemoStore((s) => s.evaluatorScores);
  const submitScores = useDemoStore((s) => s.submitEvaluatorScores);

  const pending = useMemo(() => proposals.filter((p) => p.status === "Evaluating" || p.status === "Submitted"), [proposals]);
  const active = pending.find((p) => p.id === selectedId) ?? pending[0];
  const activeChallenge = challenges.find((c) => c.id === active?.challengeId);
  const activeStartup = startups.find((s) => s.id === active?.startupId);
  const scores = (active && evaluatorScores[active.id]) || { tech: 50, scale: 50, cost: 50, risk: 50 };
  const alreadyScored = active ? !!evaluatorScores[active.id] : false;

  const completed = useMemo(
    () => Object.keys(evaluatorScores).map((pid) => ({ pid, scores: evaluatorScores[pid] })).filter((e) => proposals.some((p) => p.id === e.pid)),
    [evaluatorScores, proposals],
  );

  const [saving, setSaving] = useState(false);

  const setScore = (key: string, value: number) => {
    if (!active || alreadyScored) return;
    submitScoresLocal({ ...scores, [key]: value });
  };

  // Local mirror so sliders feel live without persisting every drag.
  const [localScores, setLocalScores] = useState<Record<string, number> | null>(null);
  const submitScoresLocal = (next: Record<string, number>) => setLocalScores(next);
  const effectiveScores = localScores ?? scores;

  const lock = () => {
    if (!active) return;
    setSaving(true);
    setTimeout(() => {
      submitScores(active.id, effectiveScores);
      setSaving(false);
      setLocalScores(null);
      toast(`Scores locked for ${activeStartup?.name ?? "proposal"}`, "success");
    }, 800);
  };

  const total = Math.round(((effectiveScores.tech ?? 0) + (effectiveScores.scale ?? 0) + (effectiveScores.cost ?? 0) + (effectiveScores.risk ?? 0)) / 4);

  return (
    <DashboardShell
      role="evaluator"
      userName={seed.CURRENT_USER.evaluator.name}
      userSubtitle={seed.CURRENT_USER.evaluator.title}
      nav={NAV}
      activeKey={tab}
      onTabSelect={(k) => setTab(k as TabKey)}
      title="Independent evaluation"
    >
      <div className="mx-auto max-w-6xl space-y-6">
        {!hydrated ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="h-96 animate-pulse rounded-xl bg-muted" />
            <div className="h-96 animate-pulse rounded-xl bg-muted lg:col-span-2" />
          </div>
        ) : (
          <>
            {tab === "pending" && (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Queue */}
                <section className="rounded-xl border border-border bg-card">
                  <div className="border-b border-border px-5 py-3.5">
                    <h3 className="font-semibold">Evaluation queue</h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">Proposals awaiting independent scores</p>
                  </div>
                  <div className="space-y-2 p-3">
                    {pending.length === 0 && (
                      <div className="p-4"><EmptyState compact icon={CheckCircle2} title="Queue clear" description="New proposals arrive as departments forward them." /></div>
                    )}
                    {pending.map((p) => {
                      const st = startups.find((s) => s.id === p.startupId);
                      const done = !!evaluatorScores[p.id];
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => { setSelectedId(p.id); setLocalScores(null); }}
                          className={`w-full rounded-lg border p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-sm ${
                            active?.id === p.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-semibold">{st?.name}</span>
                            {done ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">
                                <CheckCircle2 className="h-3 w-3" /> Scored
                              </span>
                            ) : (
                              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">Pending</span>
                            )}
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {challenges.find((c) => c.id === p.challengeId)?.title} · {fmtINR(p.costEstimate)}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </section>

                {/* Scoring panel */}
                <section className="rounded-xl border border-border bg-card lg:col-span-2">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-4">
                    <div>
                      <h3 className="text-lg font-semibold">{activeStartup?.name ?? "Select a proposal"}</h3>
                      <p className="text-sm text-muted-foreground">
                        {activeChallenge?.title} · {activeChallenge?.department}
                      </p>
                    </div>
                    {alreadyScored && (
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">✓ Scores locked</span>
                    )}
                  </div>

                  {active ? (
                    <>
                      <div className="space-y-6 px-6 py-6">
                        <div className="rounded-lg border border-border bg-muted/20 p-4 text-sm text-muted-foreground">
                          {active.summary}
                        </div>
                        {RUBRICS.map((r) => (
                          <div key={r.key} className="space-y-2">
                            <div className="flex items-end justify-between">
                              <div>
                                <label className="text-sm font-medium">{r.label}</label>
                                <p className="text-xs text-muted-foreground">{r.desc}</p>
                              </div>
                              <span className="font-mono text-lg font-bold text-primary tabular-nums">{effectiveScores[r.key]}/100</span>
                            </div>
                            <input
                              type="range"
                              min={0}
                              max={100}
                              value={effectiveScores[r.key]}
                              disabled={alreadyScored}
                              onChange={(e) => setScore(r.key, parseInt(e.target.value))}
                              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-muted accent-[hsl(var(--primary))] disabled:opacity-50"
                            />
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-between border-t border-border bg-muted/10 px-6 py-4">
                        <div className="text-sm font-medium">
                          Average: <span className="ml-1 text-2xl font-bold text-primary">{total}</span>
                        </div>
                        <Button size="lg" onClick={lock} disabled={saving || alreadyScored}>
                          {saving ? "Locking…" : alreadyScored ? "Scores locked" : "Submit & lock scores"}
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="p-10"><EmptyState icon={ClipboardList} title="Nothing to score" description="Select a proposal from the queue." /></div>
                  )}
                </section>
              </div>
            )}

            {tab === "completed" && (
              <section className="rounded-xl border border-border bg-card">
                <div className="border-b border-border px-5 py-3.5">
                  <h3 className="font-semibold">Completed evaluations</h3>
                </div>
                <div className="divide-y divide-border">
                  {completed.length === 0 && (
                    <div className="p-10"><EmptyState icon={CheckCircle2} title="No evaluations completed yet" description="Score proposals in the pending queue to see them here." /></div>
                  )}
                  {completed.map((e) => {
                    const p = proposals.find((x) => x.id === e.pid);
                    const st = startups.find((s) => s.id === p?.startupId);
                    const avg = Math.round(Object.values(e.scores ?? {}).reduce((a, b) => a + b, 0) / Math.max(1, Object.values(e.scores ?? {}).length));
                    return (
                      <div key={e.pid} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                          <div>
                            <p className="font-semibold">{st?.name}</p>
                            <p className="text-xs text-muted-foreground">{challenges.find((c) => c.id === p?.challengeId)?.title}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-bold text-primary">{avg}/100</span>
                          <Link href={`/dashboard/gov/proposals/${p?.id}`} className="text-xs font-medium text-primary hover:underline">
                            View scorecard →
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {tab === "settings" && (
              <section className="rounded-xl border border-border bg-card p-8">
                <h3 className="text-xl font-semibold">Evaluator settings</h3>
                <div className="mt-6 max-w-xl space-y-6">
                  <div className="rounded-lg border border-border bg-muted/20 p-4">
                    <h4 className="font-medium">Domain expertise</h4>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {["Artificial Intelligence", "IoT & Sensors", "Water Technology", "Urban Mobility", "Cybersecurity"].map((d, i) => (
                        <span key={d} className={`rounded-full px-3 py-1 text-xs ${i < 2 ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground"}`}>{d}</span>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Notification preferences</h4>
                    {["Email when a new evaluation is assigned", "Reminder 24h before deadline"].map((p) => (
                      <label key={p} className="flex items-center gap-3 text-sm">
                        <input type="checkbox" defaultChecked className="h-4 w-4 accent-[hsl(var(--primary))]" /> {p}
                      </label>
                    ))}
                  </div>
                  <Button onClick={() => toast("Preferences saved", "success")}>Save preferences</Button>
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </DashboardShell>
  );
}
