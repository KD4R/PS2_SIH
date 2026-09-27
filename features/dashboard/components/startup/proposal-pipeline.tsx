"use client";

import { CheckCircle2, Clock, XCircle, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const proposals = [
  {
    id: "p1",
    title: "AI-Based Traffic Violation Detection",
    department: "Traffic Police Department",
    status: "Selected for Pilot",
    date: "Oct 24, 2026",
  },
  {
    id: "p2",
    title: "Smart Waste Management Optimization",
    department: "Municipal Corporation",
    status: "Expert Evaluation",
    date: "Oct 20, 2026",
  },
  {
    id: "p3",
    title: "Blockchain Land Registry System",
    department: "Revenue Department",
    status: "Screening",
    date: "Oct 18, 2026",
  }
];

const statusConfig = {
  "Selected for Pilot": { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20" },
  "Expert Evaluation": { icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  "Screening": { icon: AlertCircle, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  "Rejected": { icon: XCircle, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" }
};

export function ProposalPipeline() {
  return (
    <div className="flex flex-col h-full bg-surface/50 border border-border rounded-xl overflow-hidden">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-medium text-foreground">Proposal & Pilot Pipeline</h3>
        <p className="text-sm text-muted-foreground mt-1">Track the exact status of your submissions.</p>
      </div>
      <div className="flex-1 p-6 flex flex-col gap-4">
        {proposals.map((proposal) => {
          const config = statusConfig[proposal.status as keyof typeof statusConfig];
          const Icon = config.icon;
          return (
            <div key={proposal.id} className="p-4 rounded-lg bg-surface border border-border flex items-center justify-between gap-4 transition-all hover:border-border-strong group">
              <div>
                <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">{proposal.title}</h4>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <span>{proposal.department}</span>
                  <span>•</span>
                  <span>Submitted {proposal.date}</span>
                </div>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${config.bg} ${config.border} ${config.color}`}>
                <Icon className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">{proposal.status}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="p-4 border-t border-border bg-surface-overlay/50">
        <Button variant="ghost" className="w-full justify-between group transition-all duration-300 hover:bg-surface-elevated active:scale-[0.98]" asChild>
          <Link href="/my-proposals">
            View all proposals
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
