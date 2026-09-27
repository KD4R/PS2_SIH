"use client";

import { CheckCircle2, Clock, Circle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const milestones = [
  {
    id: "m1",
    project: "AI Traffic Pilot",
    title: "Phase 1: Sensor Deployment",
    status: "paid",
    amount: "₹2,50,000",
    date: "Completed Oct 10"
  },
  {
    id: "m2",
    project: "AI Traffic Pilot",
    title: "Phase 2: Analytics Dashboard",
    status: "pending_validation",
    amount: "₹5,00,000",
    date: "Awaiting approval"
  },
  {
    id: "m3",
    project: "AI Traffic Pilot",
    title: "Phase 3: Final Handover",
    status: "upcoming",
    amount: "₹2,50,000",
    date: "Due Dec 01"
  }
];

export function MilestoneTracker() {
  return (
    <div className="flex flex-col h-full bg-surface/50 border border-border rounded-xl overflow-hidden">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-medium text-foreground">Milestone & Payment Tracker</h3>
        <p className="text-sm text-muted-foreground mt-1">Visibility into deliverables and invoice status.</p>
      </div>
      <div className="flex-1 p-6">
        <div className="relative border-l border-border ml-3 space-y-8">
          {milestones.map((m, i) => (
            <div key={m.id} className="relative pl-6">
              {/* Timeline dot */}
              <div className={`absolute -left-[9px] top-1 p-1 rounded-full bg-background border ${
                m.status === "paid" ? "border-green-500 text-green-500" :
                m.status === "pending_validation" ? "border-amber-500 text-amber-500 bg-amber-500/10" :
                "border-muted text-muted-foreground"
              }`}>
                {m.status === "paid" ? <CheckCircle2 className="w-3 h-3" /> :
                 m.status === "pending_validation" ? <Clock className="w-3 h-3" /> :
                 <Circle className="w-3 h-3" />}
              </div>
              
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs text-muted-foreground font-mono mb-1">{m.project}</div>
                  <h4 className={`font-medium ${m.status === 'upcoming' ? 'text-muted-foreground' : 'text-foreground'}`}>{m.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{m.date}</p>
                </div>
                <div className="text-right">
                  <div className={`font-mono font-medium ${m.status === 'paid' ? 'text-green-500' : 'text-foreground'}`}>
                    {m.amount}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">
                    {m.status === 'paid' ? 'Paid' : m.status === 'pending_validation' ? 'Validating' : 'Upcoming'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="p-4 border-t border-border bg-surface-overlay/50">
        <Button className="w-full group transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
          View detailed ledger
        </Button>
      </div>
    </div>
  );
}
