"use client";

import { Sparkles, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const recommendations = [
  {
    id: "r1",
    title: "Predictive Maintenance for Water Pumps",
    department: "Public Health Engineering",
    match: "94%",
    budget: "₹10L - ₹15L"
  },
  {
    id: "r2",
    title: "Drones for Crop Yield Estimation",
    department: "Agriculture Department",
    match: "88%",
    budget: "₹25L Pilot"
  }
];

export function RecommendedChallenges() {
  return (
    <div className="flex flex-col h-full bg-surface/50 border border-border rounded-xl overflow-hidden relative group/card">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      <div className="p-6 border-b border-border flex items-start justify-between">
        <div>
          <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            AI Matched Challenges
          </h3>
          <p className="text-sm text-muted-foreground mt-1">Curated problems matching your tech stack.</p>
        </div>
      </div>
      
      <div className="flex-1 p-6 flex flex-col gap-4">
        {recommendations.map((rec) => (
          <div key={rec.id} className="group p-4 rounded-lg bg-surface border border-border hover:border-primary/50 transition-colors cursor-pointer">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">{rec.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">{rec.department}</p>
              </div>
              <div className="shrink-0 text-right">
                <span className="inline-flex items-center px-2 py-1 rounded bg-primary/10 text-primary text-xs font-medium">
                  {rec.match} Match
                </span>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs">
              <span className="font-mono text-muted-foreground">{rec.budget}</span>
              <span className="text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                View brief <ArrowUpRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-4 border-t border-border bg-surface-overlay/50">
        <Button variant="secondary" className="w-full transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]" asChild>
          <Link href="/marketplace">Browse all 145 challenges</Link>
        </Button>
      </div>
    </div>
  );
}
