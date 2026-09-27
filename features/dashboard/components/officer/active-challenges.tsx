"use client";

import { PieChart, Clock, PlayCircle, FileEdit } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const stats = [
  { label: "Drafts", value: 2, icon: FileEdit, color: "text-muted-foreground", bg: "bg-muted/10" },
  { label: "Open for Bids", value: 5, icon: PieChart, color: "text-blue-500", bg: "bg-blue-500/10" },
  { label: "Evaluating", value: 3, icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
  { label: "Pilot Active", value: 4, icon: PlayCircle, color: "text-green-500", bg: "bg-green-500/10" },
];

export function ActiveChallenges() {
  return (
    <div className="flex flex-col h-full bg-surface/50 border border-border rounded-xl overflow-hidden">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-medium text-foreground">Active Challenges Overview</h3>
        <p className="text-sm text-muted-foreground mt-1">High-level summary of your posted problem statements.</p>
      </div>
      
      <div className="flex-1 p-6 grid grid-cols-2 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="p-4 rounded-lg bg-surface border border-border flex flex-col justify-center items-center text-center hover:border-primary/50 transition-colors">
            <div className={`flex size-10 rounded-full ${stat.bg} ${stat.color} items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div className="text-3xl font-display text-foreground">{stat.value}</div>
            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-1">{stat.label}</div>
          </div>
        ))}
      </div>
      
      <div className="p-4 border-t border-border bg-surface-overlay/50">
        <Button variant="ghost" className="w-full justify-center transition-all duration-300 hover:bg-surface-elevated active:scale-[0.98]" asChild>
          <Link href="/challenges">View all challenges</Link>
        </Button>
      </div>
    </div>
  );
}
