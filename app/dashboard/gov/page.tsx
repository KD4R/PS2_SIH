"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Building,
  FileStack,
  FileText,
  Gauge,
  Inbox,
  LayoutGrid,
  Megaphone,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardShell, type ShellNavItem } from "@/components/demo/dashboard-shell";
import { StatusPill } from "@/components/demo/status-pill";
import { EmptyState } from "@/components/shared/empty-state";
import { useDemoStore } from "@/lib/demo/store";
import { seed } from "@/lib/demo/store";
import { useToast } from "@/lib/demo/toast";
import { fmtDate, fmtINR } from "@/lib/demo/format";

const NAV: ShellNavItem[] = [
  { key: "overview", label: "nav.overview", icon: LayoutGrid },
  { key: "challenges", label: "nav.challenges", icon: FileStack },
  { key: "post", label: "Post a challenge", icon: Megaphone, href: "/dashboard/gov/new-challenge" },
  { key: "proposals", label: "nav.proposals", icon: Inbox },
  { key: "pilots", label: "nav.pilots", icon: Gauge },
  { key: "discovery", label: "nav.startups", icon: Users },
  { key: "templates", label: "nav.templates", icon: FileText, href: "/dashboard/templates" },
  { key: "analytics", label: "nav.analytics", icon: BarChart3 },
];

type TabKey = "overview" | "challenges" | "proposals" | "pilots" | "discovery" | "analytics";

export default function GovDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const [tab, setTab] = useState<TabKey>("overview");

  const hydrated = useDemoStore((s) => s.hydrated);
  const challenges = useDemoStore((s) => s.challenges);
  const proposals = useDemoStore((s) => s.proposals);
  const pilots = useDemoStore((s) => s.pilots);
  const startups = useDemoStore((s) => s.startups);

  const myChallenges = useMemo(() => challenges.filter((c) => c.department === seed.CURRENT_USER.gov.department || c.id === "ch-water-quality"), [challenges]);
  const inbox = useMemo(() => proposals.filter((p) => p.status === "Submitted" || p.status === "Evaluating" || p.status === "Evaluated"), [proposals]);
  const openChallenges = challenges.filter((c) => c.status === "Open");
  const activePilots = pilots.filter((p) => ["Contract Signed", "In Progress", "Pilot Completed", "In Validation", "Validated"].includes(p.status));

  // Startup directory filters (F13)
  const [fDomain, setFDomain] = useState("All");
  const [fStage, setFStage] = useState("All");
  const [fDpiit, setFDpiit] = useState("All");
  const [fPilots, setFPilots] = useState("All");
  const domains = useMemo(() => ["All", ...Array.from(new Set(startups.map((s) => s.sector)))], [startups]);

  const filteredStartups = useMemo(
    () =>
      startups.filter((s) => {
        if (fDomain !== "All" && s.sector !== fDomain) return false;
        if (fStage !== "All" && s.stage !== fStage) return false;
        if (fDpiit === "Verified" && !s.dpiitVerified) return false;
        if (fDpiit === "Pending" && s.dpiitVerified) return false;
        if (fPilots === "1+" && s.pastPilots < 1) return false;
        if (fPilots === "2+" && s.pastPilots < 2) return false;
        return true;
      }),
    [startups, fDomain, fStage, fDpiit, fPilots],
  );

  const whyMatched = (sector: string): string[] => [
    `Sector ${sector} aligns with active department demand.`,
    `Credibility score derived from delivery history and DPIIT status.`,
    `Eligible under startup relaxations (EMD exempt, turnover waived).`,
  ];

  return (
    <DashboardShell
      role="gov"
      userName={seed.CURRENT_USER.gov.name}
      userSubtitle={`${seed.CURRENT_USER.gov.title}, ${seed.CURRENT_USER.gov.department}`}
      nav={NAV}
      activeKey={tab}
      onTabSelect={(k) => setTab(k as TabKey)}
      title="Delhi Jal Board — Department dashboard"
    >
      <div className="mx-auto max-w-6xl space-y-6">
        {!hydrated ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Open challenges", value: String(openChallenges.length) },
                { label: "Proposals in pipeline", value: String(inbox.length) },
                { label: "Active pilots", value: String(activePilots.length) },
                { label: "Value in pilots", value: fmtINR(pilots.reduce((s, p) => s + p.contractValue, 0)) },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-md">
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="mt-1.5 text-2xl font-bold">{stat.value}</p>
                </div>
              ))}
            </div>

            {tab === "overview" && (
              <>
                {/* Actionable inbox */}
                <section className="rounded-xl border border-border bg-card">
                  <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
                    <h3 className="font-semibold">Actionable inbox</h3>
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">{inbox.length} pending</span>
                  </div>
                  <div className="divide-y divide-border">
                    {inbox.length === 0 && (
                      <div className="p-6">
                        <EmptyState compact title="Inbox clear" description="New proposals and evaluations will land here." />
                      </div>
                    )}
                    {inbox.map((p) => {
                      const startup = startups.find((s) => s.id === p.startupId);
                      const challenge = challenges.find((c) => c.id === p.challengeId);
                      return (
                        <Link key={p.id} href={`/dashboard/gov/proposals/${p.id}`} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-muted/40">
                          <div>
                            <p className="text-sm font-medium">
                              {startup?.name ?? "Startup"} <span className="font-normal text-muted-foreground">applied to</span> {challenge?.title}
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {fmtINR(p.costEstimate)} · submitted {fmtDate(p.submittedAt)}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <StatusPill status={p.status} />
                            <span className="text-xs font-medium text-primary">Review →</span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </section>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  {/* Risk flags */}
                  <section className="rounded-xl border border-border bg-card">
                    <div className="border-b border-border px-5 py-3.5">
                      <h3 className="font-semibold">Pilot risk flags</h3>
                    </div>
                    <div className="divide-y divide-border">
                      {pilots.flatMap((p) =>
                        p.risks
                          .filter((r) => r.impact === "High" || r.likelihood === "High")
                          .map((r) => (
                            <div key={r.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                              <div>
                                <p className="text-sm font-medium">{r.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  {challenges.find((c) => c.id === p.challengeId)?.title} · {r.likelihood}/{r.impact}
                                </p>
                              </div>
                              <Link href={`/dashboard/gov/pilots/${p.id}`} className="text-xs font-medium text-primary hover:underline">
                                Review
                              </Link>
                            </div>
                          )),
                      )}
                      {pilots.every((p) => !p.risks.some((r) => r.impact === "High" || r.likelihood === "High")) && (
                        <div className="p-6">
                          <EmptyState compact title="No high risks" description="All tracked risks are currently low or medium." />
                        </div>
                      )}
                    </div>
                  </section>

                  {/* Pilot progress */}
                  <section className="rounded-xl border border-border bg-card">
                    <div className="border-b border-border px-5 py-3.5">
                      <h3 className="font-semibold">Pilot progress</h3>
                    </div>
                    <div className="divide-y divide-border">
                      {activePilots.map((p) => {
                        const paid = p.milestones.filter((m) => m.status === "Payment Released").length;
                        return (
                          <Link key={p.id} href={`/dashboard/gov/pilots/${p.id}`} className="block px-5 py-3.5 transition-colors hover:bg-muted/40">
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-sm font-medium">{challenges.find((c) => c.id === p.challengeId)?.title}</p>
                              <StatusPill status={p.status} />
                            </div>
                            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(paid / Math.max(1, p.milestones.length)) * 100}%` }} />
                            </div>
                            <p className="mt-1.5 text-xs text-muted-foreground">
                              {paid}/{p.milestones.length} milestones paid · {startups.find((s) => s.id === p.startupId)?.name}
                            </p>
                          </Link>
                        );
                      })}
                      {activePilots.length === 0 && (
                        <div className="p-6">
                          <EmptyState compact title="No active pilots" description="Approve a proposal to start a pilot." />
                        </div>
                      )}
                    </div>
                  </section>
                </div>
              </>
            )}

            {tab === "challenges" && (
              <section className="overflow-hidden rounded-xl border border-border bg-card">
                <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
                  <h3 className="font-semibold">My challenges</h3>
                  <Button size="sm" onClick={() => router.push("/dashboard/gov/new-challenge")}>Post a new challenge</Button>
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-muted/30 text-left text-xs text-muted-foreground">
                    <tr>
                      <th className="px-5 py-3 font-medium">Title</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                      <th className="px-5 py-3 font-medium">Proposals</th>
                      <th className="px-5 py-3 font-medium">Deadline</th>
                      <th className="px-5 py-3 font-medium" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {myChallenges.map((c) => {
                      const count = proposals.filter((p) => p.challengeId === c.id).length;
                      return (
                        <tr key={c.id} className="transition-colors hover:bg-muted/30">
                          <td className="px-5 py-3.5 font-medium">{c.title}</td>
                          <td className="px-5 py-3.5"><StatusPill status={c.status} /></td>
                          <td className="px-5 py-3.5 tabular-nums">{count}</td>
                          <td className="px-5 py-3.5 text-muted-foreground">{fmtDate(c.deadline)}</td>
                          <td className="px-5 py-3.5 text-right">
                            <Link href="/dashboard/gov" className="text-xs font-medium text-primary hover:underline" onClick={(e) => { e.preventDefault(); setTab("proposals"); }}>
                              View proposals
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </section>
            )}

            {tab === "proposals" && (
              <section className="overflow-hidden rounded-xl border border-border bg-card">
                <div className="border-b border-border px-5 py-3.5">
                  <h3 className="font-semibold">All proposals</h3>
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-muted/30 text-left text-xs text-muted-foreground">
                    <tr>
                      <th className="px-5 py-3 font-medium">Startup</th>
                      <th className="px-5 py-3 font-medium">Challenge</th>
                      <th className="px-5 py-3 font-medium">Cost</th>
                      <th className="px-5 py-3 font-medium">Fit</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                      <th className="px-5 py-3 font-medium" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {proposals.map((p) => {
                      const startup = startups.find((s) => s.id === p.startupId);
                      const challenge = challenges.find((c) => c.id === p.challengeId);
                      return (
                        <tr key={p.id} className="transition-colors hover:bg-muted/30">
                          <td className="px-5 py-3.5 font-medium">{startup?.name}</td>
                          <td className="px-5 py-3.5 text-muted-foreground">{challenge?.title}</td>
                          <td className="px-5 py-3.5 tabular-nums">{fmtINR(p.costEstimate)}</td>
                          <td className="px-5 py-3.5 tabular-nums">{p.fitScore}</td>
                          <td className="px-5 py-3.5"><StatusPill status={p.status} /></td>
                          <td className="px-5 py-3.5 text-right">
                            <Link href={`/dashboard/gov/proposals/${p.id}`} className="text-xs font-medium text-primary hover:underline">
                              Open
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </section>
            )}

            {tab === "pilots" && (
              <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {pilots.map((p) => (
                  <Link key={p.id} href={`/dashboard/gov/pilots/${p.id}`} className="rounded-xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-md">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold">{challenges.find((c) => c.id === p.challengeId)?.title}</p>
                      <StatusPill status={p.status} />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {startups.find((s) => s.id === p.startupId)?.name} · {fmtINR(p.contractValue)}
                    </p>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${(p.milestones.filter((m) => m.status === "Payment Released").length / Math.max(1, p.milestones.length)) * 100}%` }}
                      />
                    </div>
                  </Link>
                ))}
                {pilots.length === 0 && (
                  <div className="md:col-span-2">
                    <EmptyState icon={Building} title="No pilots yet" description="Approve an evaluated proposal to create the first pilot." />
                  </div>
                )}
              </section>
            )}

            {tab === "discovery" && (
              <section className="space-y-4">
                {/* F13 filter bar */}
                <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-4">
                  <FilterSelect label="Domain" value={fDomain} onChange={setFDomain} options={domains} />
                  <FilterSelect label="Stage" value={fStage} onChange={setFStage} options={["All", "Ideation", "Prototype", "Early Revenue", "Scaling"]} />
                  <FilterSelect label="DPIIT" value={fDpiit} onChange={setFDpiit} options={["All", "Verified", "Pending"]} />
                  <FilterSelect label="Past pilots" value={fPilots} onChange={setFPilots} options={["All", "1+", "2+"]} />
                  <span className="ml-auto text-xs text-muted-foreground">{filteredStartups.length} of {startups.length} startups</span>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {filteredStartups.map((s) => (
                    <div key={s.id} className="rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-md">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold">{s.name}</p>
                          <p className="text-xs text-muted-foreground">{s.founder} · {s.incorporatedYear}</p>
                        </div>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${s.dpiitVerified ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                          {s.dpiitVerified ? "DPIIT ✓" : "DPIIT ⏳"}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className="rounded bg-muted px-1.5 py-0.5">{s.sector}</span>
                        <span className="rounded bg-muted px-1.5 py-0.5">{s.stage}</span>
                        <span className="rounded bg-muted px-1.5 py-0.5">{s.pastPilots} pilots</span>
                      </div>
                      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                        <span className="text-xs font-semibold text-primary">Fit {Math.min(99, 40 + s.credibility / 2 | 0)}/100</span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="text-xs font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                            onClick={() => toast(whyMatched(s.sector).join(" "), "info")}
                            title={whyMatched(s.sector).join("\n")}
                          >
                            Why matched
                          </button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toast(`Invitation sent to ${s.name}`, "success")}
                          >
                            Invite to challenge
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {tab === "analytics" && (
              <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {[
                  { label: "Avg time-to-pilot", value: "42 days", delta: "-8 days vs last year" },
                  { label: "Pilot success rate", value: "68%", delta: "+12% vs last year" },
                  { label: "Est. procurement savings", value: "₹4.2 Cr", delta: "across all departments" },
                ].map((m) => (
                  <div key={m.label} className="rounded-xl border border-border bg-card p-6">
                    <p className="text-sm font-medium text-muted-foreground">{m.label}</p>
                    <p className="mt-2 text-3xl font-bold">{m.value}</p>
                    <p className="mt-1 text-xs font-medium text-green-600">{m.delta}</p>
                  </div>
                ))}
                <div className="rounded-xl border border-border bg-card p-6 md:col-span-3">
                  <h3 className="font-semibold">Department engagement</h3>
                  <div className="mt-4 space-y-3">
                    {[
                      ["Delhi Jal Board", 62],
                      ["Department of Transport", 48],
                      ["Urban Affairs", 31],
                      ["Agriculture", 24],
                      ["Health", 18],
                    ].map(([dept, pct]) => (
                      <div key={dept as string}>
                        <div className="flex justify-between text-xs">
                          <span className="font-medium">{dept}</span>
                          <span className="text-muted-foreground">{pct}%</span>
                        </div>
                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </DashboardShell>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <label className="flex items-center gap-1.5 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 rounded-md border border-border bg-background px-2 text-xs outline-none focus:ring-2 focus:ring-primary/40"
      >
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}
