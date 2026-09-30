"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Landmark, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDemoStore, usePublicStats } from "@/lib/demo/store";
import { fmtINR } from "@/lib/demo/format";

function CountUp({ value, format }: { value: number; format: (n: number) => string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [started, setStarted] = useState(false);
  const [shown, setShown] = useState(0);

  // Start when scrolled into view — with a time fallback so the counter still
  // animates in environments where IntersectionObserver never fires.
  useEffect(() => {
    if (inView) {
      setStarted(true);
      return;
    }
    const t = setTimeout(() => setStarted(true), 2500);
    return () => clearTimeout(t);
  }, [inView]);

  useEffect(() => {
    if (!started) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / 1200);
      setShown(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started, value]);

  return <span ref={ref}>{format(shown)}</span>;
}

export default function PublicPortal() {
  const hydrated = useDemoStore((s) => s.hydrated);
  const pilots = useDemoStore((s) => s.pilots);
  const challenges = useDemoStore((s) => s.challenges);
  const startups = useDemoStore((s) => s.startups);
  const stats = usePublicStats();

  const scaled = pilots.filter((p) => p.scale && p.scale.outcome !== "Close");
  const directory = [
    {
      title: "AI Traffic Signal Optimisation",
      dept: "Department of Transport, Delhi",
      startup: "CityGrid Systems",
      outcome: "Reduced average peak-hour wait times at 15 major intersections by 34%. Fully integrated with central traffic control.",
      status: "Scaled state-wide",
    },
    {
      title: "Drone-based Crop Assessment",
      dept: "Department of Agriculture",
      startup: "SkyYield Drones",
      outcome: "Surveyed 10,000 hectares for pest damage with 95% accuracy against manual inspection.",
      status: "Pilot completed",
    },
    {
      title: "Digital Health Records Kiosk",
      dept: "Health Ministry, Karnataka",
      startup: "MediKits Health",
      outcome: "Deployed across 50 rural PHCs; 25,000 patient check-ins handled with 40% less administrative load.",
      status: "Scaled regionally",
    },
    {
      title: "Smart Waste Bins",
      dept: "Municipal Corporation, Delhi",
      startup: "WasteSense IoT",
      outcome: "Route optimisation cut garbage-truck fuel consumption by 18% during the 3-month pilot.",
      status: "Pilot completed",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary font-bold text-white">G</span>
            <span className="text-lg font-bold tracking-tight">GovProcure</span>
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Public portal</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/login"><Button variant="ghost" size="sm">Log in</Button></Link>
            <Link href="/signup"><Button size="sm">Join as innovator</Button></Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-b from-muted/50 to-background py-16">
        <div className="mx-auto max-w-4xl space-y-5 px-6 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Landmark className="h-3.5 w-3.5" /> Open procurement transparency
          </span>
          <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Every rupee of pilot funding, in the open</h2>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Track published challenges, milestone-based pilot payments, independent validation and scale-up decisions across
            participating government departments.
          </p>
        </div>
      </section>

      {/* Counters */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Challenges published", value: stats.challengesPublished, format: (n: number) => String(n), icon: Sparkles },
            { label: "Pilots completed", value: stats.pilotsCompleted, format: (n: number) => String(n), icon: TrendingUp },
            { label: "Avg days to payment", value: stats.avgDaysToPayment, format: (n: number) => String(n), icon: ArrowRight },
            { label: "Total value awarded", value: stats.totalValueAwarded, format: (n: number) => fmtINR(n), icon: Landmark },
          ].map((m) => {
            const Icon = m.icon;
            return (
              <div key={m.label} className="rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-md">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-4.5 w-4.5" />
                </span>
                <p className="mt-4 text-3xl font-bold tracking-tight">
                  {hydrated ? <CountUp value={m.value} format={m.format} /> : <span className="inline-block h-8 w-24 animate-pulse rounded bg-muted align-middle" />}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{m.label}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Recently scaled */}
      {scaled.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 pb-4">
          <h3 className="text-xl font-bold">Recently scaled solutions</h3>
          <p className="mt-1 text-sm text-muted-foreground">Validated pilots that departments have taken to rollout or regular procurement.</p>
          <div className="mt-5 space-y-3">
            {scaled.map((p) => {
              const challenge = challenges.find((c) => c.id === p.challengeId);
              const startup = startups.find((s) => s.id === p.startupId);
              return (
                <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-5">
                  <div>
                    <p className="font-semibold">{challenge?.title}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {startup?.name} · {challenge?.department} · {fmtINR(p.contractValue)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">{p.scale?.outcome}</span>
                    <p className="mt-1 text-xs text-muted-foreground">{p.scale?.districts.join(", ")}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Innovation directory */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold">Innovation directory</h3>
            <p className="mt-1 text-sm text-muted-foreground">Completed and scaled projects across departments</p>
          </div>
          <select className="h-9 rounded-md border border-border bg-card px-3 text-sm shadow-sm outline-none focus:ring-2 focus:ring-primary/40">
            <option>All sectors</option>
            <option>Healthtech</option>
            <option>Mobility</option>
            <option>Cleantech</option>
          </select>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {directory.map((p) => (
            <div key={p.title} className="flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex items-center justify-between gap-2">
                <span className={`rounded-full px-2 py-1 text-xs font-bold ${p.status.includes("Scaled") ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}`}>
                  {p.status}
                </span>
              </div>
              <h4 className="mt-3 text-lg font-bold">{p.title}</h4>
              <p className="mt-1 text-sm font-medium text-primary">{p.dept}</p>
              <div className="mt-auto pt-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Solution by</p>
                <p className="text-sm font-medium">{p.startup}</p>
                <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Outcome</p>
                <p className="mt-0.5 text-sm text-foreground/80">{p.outcome}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border bg-card py-8 text-center text-xs text-muted-foreground">
        Illustrative transparency data. © {new Date().getFullYear()} GovProcure
      </footer>
    </div>
  );
}
