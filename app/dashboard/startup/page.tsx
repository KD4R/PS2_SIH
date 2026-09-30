"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import {
  BadgeCheck,
  BarChart3,
  FileStack,
  Gauge,
  IndianRupee,
  Radar,
  Search,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardShell, type ShellNavItem } from "@/components/demo/dashboard-shell";
import { StatusPill } from "@/components/demo/status-pill";
import { EmptyState } from "@/components/shared/empty-state";
import { IntegrationBadge } from "@/components/demo/integration-badge";
import { useDemoStore } from "@/lib/demo/store";
import { seed } from "@/lib/demo/store";
import { fmtDate, fmtINR } from "@/lib/demo/format";

const NAV: ShellNavItem[] = [
  { key: "demand", label: "nav.demand", icon: Radar },
  { key: "applications", label: "nav.applications", icon: FileStack },
  { key: "pilots", label: "nav.payments", icon: Gauge },
  { key: "payments", label: "Payments", icon: IndianRupee },
  { key: "profile", label: "nav.profile", icon: UserRound },
  { key: "templates", label: "nav.templates", icon: BarChart3, href: "/dashboard/templates" },
];

type TabKey = "demand" | "applications" | "pilots" | "payments" | "profile";

export default function StartupDashboard() {
  const [tab, setTab] = useState<TabKey>("demand");

  const hydrated = useDemoStore((s) => s.hydrated);
  const challenges = useDemoStore((s) => s.challenges);
  const proposals = useDemoStore((s) => s.proposals);
  const pilots = useDemoStore((s) => s.pilots);
  const me = seed.CURRENT_STARTUP;

  const myProposals = useMemo(() => proposals.filter((p) => p.startupId === me.id), [proposals, me.id]);
  const myPilots = useMemo(() => pilots.filter((p) => p.startupId === me.id), [pilots, me.id]);
  const openChallenges = useMemo(() => challenges.filter((c) => c.status === "Open"), [challenges]);

  // F14 filters
  const [fDomain, setFDomain] = useState("All");
  const [fDept, setFDept] = useState("All");
  const [fBand, setFBand] = useState("All");
  const domains = useMemo(() => ["All", ...Array.from(new Set(challenges.map((c) => c.domain)))], [challenges]);
  const depts = useMemo(() => ["All", ...Array.from(new Set(challenges.map((c) => c.department)))], [challenges]);

  const filtered = useMemo(
    () =>
      openChallenges.filter((c) => {
        if (fDomain !== "All" && c.domain !== fDomain) return false;
        if (fDept !== "All" && c.department !== fDept) return false;
        if (fBand !== "≤10L" && c.budgetMax > 1_000_000 && fBand === "≤10L") return false;
        if (fBand === "10–20L" && (c.budgetMax < 1_000_000 || c.budgetMin > 2_000_000)) return false;
        if (fBand === "20L+" && c.budgetMax < 2_000_000) return false;
        return true;
      }),
    [openChallenges, fDomain, fDept, fBand],
  );

  const demandByDept = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of openChallenges) {
      map.set(c.department, (map.get(c.department) ?? 0) + c.budgetMax);
    }
    return Array.from(map.entries()).map(([dept, value]) => ({ dept, lakh: Math.round(value / 100_000) }));
  }, [openChallenges]);

  const myPayments = myPilots.flatMap((p) =>
    p.milestones.map((m) => ({ ...m, pilotId: p.id, pilotTitle: challenges.find((c) => c.id === p.challengeId)?.title ?? "Pilot" })),
  );
  const totalReceived = myPayments.filter((m) => m.status === "Payment Released").reduce((s, m) => s + m.amount, 0);

  return (
    <DashboardShell
      role="startup"
      userName={me.name}
      userSubtitle={me.founder}
      nav={NAV}
      activeKey={tab}
      onTabSelect={(k) => setTab(k as TabKey)}
      title="Innovator dashboard"
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
                { label: "My applications", value: String(myProposals.length) },
                { label: "Active pilots", value: String(myPilots.length) },
                { label: "Payments received", value: fmtINR(totalReceived) },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-md">
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="mt-1.5 text-2xl font-bold">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              <div className="space-y-6 xl:col-span-2">
                {tab === "demand" && (
                  <>
                    {/* F14 filters + chart */}
                    <section className="rounded-xl border border-border bg-card p-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <Filter label="Domain" value={fDomain} onChange={setFDomain} options={domains} />
                        <Filter label="Department" value={fDept} onChange={setFDept} options={depts} />
                        <Filter label="Budget" value={fBand} onChange={setFBand} options={["All", "≤10L", "10–20L", "20L+"]} />
                        <div className="relative ml-auto">
                          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                          <input placeholder="Search…" className="h-8 w-40 rounded-md border border-border bg-background pl-8 pr-2 text-xs outline-none focus:ring-2 focus:ring-primary/40" />
                        </div>
                      </div>
                      {demandByDept.length > 0 && (
                        <div className="mt-4 h-40">
                          <p className="mb-2 text-xs font-medium text-muted-foreground">Open demand by department (₹ lakh)</p>
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={demandByDept} margin={{ top: 0, right: 8, bottom: 0, left: -22 }}>
                              <defs>
                                {/* Brass gradient — same recipe as the landing glow:
                                   bright metal at the top falling into deep brass. */}
                                <linearGradient id="brassBar" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="hsl(38 55% 66%)" />
                                  <stop offset="55%" stopColor="hsl(var(--brass))" />
                                  <stop offset="100%" stopColor="hsl(32 42% 42%)" />
                                </linearGradient>
                              </defs>
                              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                              <XAxis dataKey="dept" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} interval={0} angle={-14} dy={6} />
                              <Tooltip
                                content={<DemandTooltip />}
                                position={{ y: 2 }}
                                offset={10}
                                cursor={{ fill: "hsl(var(--brass) / 0.12)" }}
                              />
                              <Bar
                                dataKey="lakh"
                                radius={[6, 6, 0, 0]}
                                fill="url(#brassBar)"
                                activeBar={{
                                  fill: "url(#brassBar)",
                                  stroke: "hsl(var(--brass) / 0.7)",
                                  strokeWidth: 1,
                                  filter: "drop-shadow(0 0 6px hsl(var(--brass) / 0.45))",
                                }}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </section>

                    {/* Radar cards */}
                    <section className="space-y-4">
                      <h3 className="font-semibold">Live demand radar</h3>
                      {filtered.length === 0 ? (
                        <EmptyState icon={Radar} title="No challenges match" description="Try clearing a filter — new challenges publish every week." />
                      ) : (
                        filtered.map((c) => {
                          const applied = myProposals.some((p) => p.challengeId === c.id);
                          return (
                            <Link
                              key={c.id}
                              href={`/dashboard/startup/challenges/${c.id}`}
                              className="block rounded-xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                            >
                              <div className="flex flex-wrap items-start justify-between gap-2">
                                <div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">{c.domain}</span>
                                    <span className="text-xs text-muted-foreground">{c.department}</span>
                                  </div>
                                  <h4 className="mt-1.5 text-lg font-bold">{c.title}</h4>
                                </div>
                                <StatusPill status={c.status} />
                              </div>
                              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{c.outcomeStatement}</p>
                              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                                <span className="text-sm font-semibold">
                                  {fmtINR(c.budgetMin)} – {fmtINR(c.budgetMax)} · {c.durationMonths} months
                                </span>
                                <span className="text-xs font-medium text-primary">
                                  {applied ? "Applied — view status →" : "View & apply →"}
                                </span>
                              </div>
                            </Link>
                          );
                        })
                      )}
                    </section>
                  </>
                )}

                {tab === "applications" && (
                  <section className="overflow-hidden rounded-xl border border-border bg-card">
                    <div className="border-b border-border px-5 py-3.5">
                      <h3 className="font-semibold">My applications</h3>
                    </div>
                    <table className="w-full text-sm">
                      <thead className="bg-muted/30 text-left text-xs text-muted-foreground">
                        <tr>
                          <th className="px-5 py-3 font-medium">Challenge</th>
                          <th className="px-5 py-3 font-medium">Cost</th>
                          <th className="px-5 py-3 font-medium">Status</th>
                          <th className="px-5 py-3 font-medium">Next action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {myProposals.map((p) => {
                          const challenge = challenges.find((c) => c.id === p.challengeId);
                          const next =
                            p.status === "Submitted" ? "Awaiting triage"
                            : p.status === "Evaluating" ? "AI evaluation in progress"
                            : p.status === "Evaluated" ? "Department decision pending"
                            : p.status === "Active Pilot" ? "Pilot underway"
                            : p.status === "Rejected" ? "None — reason recorded"
                            : "None";
                          return (
                            <tr key={p.id} className="transition-colors hover:bg-muted/30">
                              <td className="px-5 py-3.5 font-medium">{challenge?.title}</td>
                              <td className="px-5 py-3.5 tabular-nums">{fmtINR(p.costEstimate)}</td>
                              <td className="px-5 py-3.5"><StatusPill status={p.status} /></td>
                              <td className="px-5 py-3.5 text-muted-foreground">{next}</td>
                            </tr>
                          );
                        })}
                        {myProposals.length === 0 && (
                          <tr><td colSpan={4} className="px-5 py-10 text-center text-muted-foreground">No applications yet — explore the Demand Radar.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </section>
                )}

                {tab === "pilots" && (
                  <section className="space-y-4">
                    {myPilots.map((p) => (
                      <Link key={p.id} href={`/dashboard/startup/pilots/${p.id}`} className="block rounded-xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-md">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold">{challenges.find((c) => c.id === p.challengeId)?.title}</p>
                          <StatusPill status={p.status} />
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{fmtINR(p.contractValue)} · {challenges.find((c) => c.id === p.challengeId)?.department}</p>
                        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${(p.milestones.filter((m) => m.status === "Payment Released").length / Math.max(1, p.milestones.length)) * 100}%` }} />
                        </div>
                        <p className="mt-1.5 text-xs text-muted-foreground">
                          {p.milestones.filter((m) => m.status === "Payment Released").length}/{p.milestones.length} milestones paid
                        </p>
                      </Link>
                    ))}
                    {myPilots.length === 0 && (
                      <EmptyState icon={Gauge} title="No active pilots" description="Once a proposal is approved, the pilot and its payment schedule appear here." />
                    )}
                  </section>
                )}

                {tab === "payments" && (
                  <section className="overflow-hidden rounded-xl border border-border bg-card">
                    <div className="border-b border-border px-5 py-3.5">
                      <h3 className="font-semibold">Payments & invoices</h3>
                    </div>
                    <div className="divide-y divide-border">
                      {myPayments.map((m) => (
                        <Link key={m.id} href={`/dashboard/startup/pilots/${m.pilotId}`} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-muted/40">
                          <div>
                            <p className="text-sm font-medium">{m.title}</p>
                            <p className="text-xs text-muted-foreground">{m.pilotTitle}{m.releasedOn ? ` · released ${fmtDate(m.releasedOn)}` : ""}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold tabular-nums">{fmtINR(m.amount)}</span>
                            <StatusPill status={m.status} />
                          </div>
                        </Link>
                      ))}
                      {myPayments.length === 0 && (
                        <div className="p-6"><EmptyState compact title="No payments yet" description="Milestone payments appear as the pilot progresses." /></div>
                      )}
                    </div>
                  </section>
                )}

                {tab === "profile" && (
                  <section className="rounded-xl border border-border bg-card p-6">
                    <div className="flex items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">TN</div>
                      <div>
                        <h3 className="text-xl font-bold">{me.name}</h3>
                        <p className="text-sm text-muted-foreground">Founded {me.incorporatedYear} · {me.stage} · {me.turnoverBand} turnover</p>
                      </div>
                    </div>
                    <div className="mt-5">
                      <IntegrationBadge kind="dpiit" verified={me.dpiitVerified} />
                    </div>
                    <div className="mt-5 grid grid-cols-2 gap-4">
                      {[
                        ["Sector", me.sector],
                        ["Past pilots", String(me.pastPilots)],
                        ["DPIIT number", me.dpiitNo],
                        ["Founder", me.founder],
                      ].map(([k, v]) => (
                        <div key={k} className="rounded-lg border border-border bg-muted/20 p-4">
                          <p className="text-xs text-muted-foreground">{k}</p>
                          <p className="mt-0.5 font-medium">{v}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>

              {/* Side rail */}
              <div className="space-y-6">
                {/* Credibility */}
                <div className="rounded-xl bg-gradient-to-br from-indigo-900 to-primary p-6 text-white shadow-lg">
                  <div className="flex items-center gap-2">
                    <BadgeCheck className="h-4 w-4 text-indigo-200" />
                    <h3 className="font-semibold text-indigo-100">Credibility score</h3>
                  </div>
                  <div className="mt-4 flex items-end gap-3">
                    <span className="text-5xl font-bold tracking-tighter">{me.credibility}</span>
                    <span className="mb-1 text-indigo-200">/ 100</span>
                  </div>
                  <div className="mt-5 space-y-2.5 text-sm">
                    <div className="flex justify-between"><span className="text-indigo-100">Past pilots</span><span className="font-medium">{me.pastPilots}</span></div>
                    <div className="flex justify-between"><span className="text-indigo-100">DPIIT status</span><span className="font-medium">{me.dpiitVerified ? "Verified" : "Pending"}</span></div>
                    <div className="flex justify-between"><span className="text-indigo-100">Turnover band</span><span className="font-medium">{me.turnoverBand}</span></div>
                  </div>
                  <div className="mt-5 rounded bg-white/10 p-3 text-xs text-indigo-100">
                    Your score is portable across all government departments.
                  </div>
                </div>

                {/* Milestone tracker */}
                <div className="rounded-xl border border-border bg-card">
                  <div className="border-b border-border px-5 py-3.5">
                    <h3 className="font-semibold">Milestone tracker</h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">{myPilots[0] ? challenges.find((c) => c.id === myPilots[0]?.challengeId)?.title : "No active pilot"}</p>
                  </div>
                  <div className="p-5">
                    {myPilots[0] ? (
                      <ol className="relative space-y-5 border-l-2 border-primary/30 pl-5">
                        {myPilots[0].milestones.map((m) => (
                          <li key={m.id} className="relative">
                            <span
                              className={`absolute -left-[27px] top-1 h-3.5 w-3.5 rounded-full ring-4 ${
                                m.status === "Payment Released"
                                  ? "bg-green-500 ring-green-500/20"
                                  : m.status === "Evidence Submitted"
                                    ? "bg-amber-500 ring-amber-500/20"
                                    : "bg-muted ring-muted/40"
                              }`}
                            />
                            <p className="text-sm font-medium">{m.title}</p>
                            <p className={`mt-0.5 text-xs font-medium ${m.status === "Payment Released" ? "text-green-600" : m.status === "Evidence Submitted" ? "text-amber-600" : "text-muted-foreground"}`}>
                              {fmtINR(m.amount)} · {m.status}
                            </p>
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <p className="text-sm text-muted-foreground">Milestones appear after your first pilot.</p>
                    )}
                    <Link href={myPilots[0] ? `/dashboard/startup/pilots/${myPilots[0].id}` : "/dashboard/startup"} className="mt-4 inline-block text-xs font-medium text-primary hover:underline">
                      Open pilot page →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardShell>
  );
}

/** Gold-branded hover card for the demand chart — pinned above the bars. */
function DemandTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value?: number | string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const value = payload[0]?.value;
  return (
    <div className="pointer-events-none rounded-lg border border-primary/40 bg-card px-3 py-2 shadow-lg">
      <p className="text-xs font-semibold text-foreground">{label}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Max budget <span className="font-semibold text-primary">₹{value}L</span>
      </p>
    </div>
  );
}

function Filter({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <label className="flex items-center gap-1.5 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 rounded-md border border-border bg-background px-2 text-xs outline-none focus:ring-2 focus:ring-primary/40"
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}
