"use client";

import { useMemo } from "react";
import { ArrowDownRight, ArrowUpRight, Target } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { cn } from "@/lib/utils";
import type { Pilot } from "@/lib/demo/types";

const tooltipStyle = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 10,
  fontSize: 12,
};

/** F4 KPI dashboard: baseline→actual cards with delta chips + charts. */
export function KpiTab({ pilot }: { pilot: Pilot }) {
  const kpis = pilot.kpis;
  const series = pilot.kpiSeries;

  const lineData = useMemo(() => series, [series]);

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {kpis.map((k) => {
          const pct = k.baseline > 0 ? Math.round(((k.actual - k.baseline) / k.baseline) * 100) : null;
          const improved = k.lowerIsBetter ? k.actual <= k.target : k.actual >= k.target;
          return (
            <div key={k.label} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium leading-snug">{k.label}</p>
                {improved && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">
                    <Target className="h-3 w-3" /> Met
                  </span>
                )}
              </div>
              <div className="mt-3 flex items-end gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Baseline</p>
                  <p className="text-lg font-semibold tabular-nums text-muted-foreground">
                    {k.baseline}
                    {k.unit === "%" ? "%" : ""} <span className="text-xs font-normal">{k.unit === "%" ? "" : k.unit}</span>
                  </p>
                </div>
                <ArrowDownRight className="mb-1 h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Target</p>
                  <p className="text-lg font-semibold tabular-nums">{k.target}{k.unit === "%" ? "%" : ""}</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Actual</p>
                  <p className={cn("text-2xl font-bold tabular-nums", improved ? "text-green-600" : "text-amber-600")}>
                    {k.actual}{k.unit === "%" ? "%" : ""}
                  </p>
                </div>
              </div>
              {pct !== null && (
                <span
                  className={cn(
                    "mt-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                    k.lowerIsBetter ? "bg-green-100 text-green-700" : "bg-primary/15 text-primary"
                  )}
                >
                  {k.lowerIsBetter ? <ArrowDownRight className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                  {k.lowerIsBetter ? "-" : "+"}
                  {Math.abs(pct)}% vs baseline
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Charts */}
      {lineData.length > 0 && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm font-semibold">Detection time: actual vs target (hours)</p>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData} margin={{ top: 4, right: 8, bottom: 0, left: -18 }}>
                  <defs>
                    {/* Brand brass for the actual series — same metal ramp as
                        the landing glow and the demand-radar bars. */}
                    <linearGradient id="brassLine" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="hsl(32 42% 50%)" />
                      <stop offset="100%" stopColor="hsl(38 55% 62%)" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke="url(#brassLine)"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: "hsl(var(--brass))", strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: "hsl(var(--brass))", stroke: "hsl(var(--brass) / 0.4)", strokeWidth: 4 }}
                    name="Actual"
                  />
                  <Line type="monotone" dataKey="target" stroke="hsl(var(--muted-foreground))" strokeWidth={2} strokeDasharray="5 4" dot={false} name="Target" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm font-semibold">Baseline vs target vs actual (detection hours)</p>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { name: "Baseline", value: kpis[0]?.baseline ?? 0 },
                    { name: "Target", value: kpis[0]?.target ?? 0 },
                    { name: "Actual", value: kpis[0]?.actual ?? 0 },
                  ]}
                  margin={{ top: 4, right: 8, bottom: 0, left: -18 }}
                >
                  <defs>
                    <linearGradient id="brassKpiBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(38 55% 66%)" />
                      <stop offset="55%" stopColor="hsl(var(--brass))" />
                      <stop offset="100%" stopColor="hsl(32 42% 42%)" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar
                    dataKey="value"
                    radius={[6, 6, 0, 0]}
                    fill="url(#brassKpiBar)"
                    name="Hours"
                    activeBar={{
                      fill: "url(#brassKpiBar)",
                      stroke: "hsl(var(--brass) / 0.7)",
                      strokeWidth: 1,
                      filter: "drop-shadow(0 0 6px hsl(var(--brass) / 0.45))",
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
