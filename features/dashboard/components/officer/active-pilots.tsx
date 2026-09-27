"use client";

import { Activity, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const pilots = [
  {
    id: "pl1",
    name: "AI Water Leakage Detector",
    startup: "HydroSense Tech",
    phase: "Phase 2 (Field Testing)",
    health: 92,
    compliance: "Verified"
  },
  {
    id: "pl2",
    name: "Automated Toll Compliance",
    startup: "VisionAI Solutions",
    phase: "Phase 1 (Integration)",
    health: 78,
    compliance: "Pending Review"
  }
];

export function ActivePilots() {
  return (
    <div className="flex flex-col h-full bg-surface/50 border border-border rounded-xl overflow-hidden md:col-span-2">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-medium text-foreground">Active Pilots & Performance Tracker</h3>
        <p className="text-sm text-muted-foreground mt-1">Live snapshot of ongoing sandbox and pilot projects.</p>
      </div>
      
      <div className="flex-1 p-6 grid md:grid-cols-2 gap-6">
        {pilots.map((pilot) => (
          <div key={pilot.id} className="p-5 rounded-lg bg-surface border border-border hover:border-primary/30 transition-all">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-medium text-foreground text-base">{pilot.name}</h4>
                <p className="text-sm text-muted-foreground mt-0.5">{pilot.startup}</p>
              </div>
              <div className="flex items-center gap-1 bg-green-500/10 text-green-500 px-2 py-1 rounded text-xs font-medium border border-green-500/20">
                <Activity className="w-3 h-3" /> {pilot.health}/100
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">Current Phase</span>
                  <span className="font-medium text-foreground">{pilot.phase}</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: pilot.phase.includes('2') ? '66%' : '33%' }} />
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-3 border-t border-border text-xs">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <ShieldCheck className={`w-3.5 h-3.5 ${pilot.compliance === 'Verified' ? 'text-green-500' : 'text-amber-500'}`} />
                  Compliance Status
                </span>
                <span className={`font-medium ${pilot.compliance === 'Verified' ? 'text-green-500' : 'text-amber-500'}`}>
                  {pilot.compliance}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-4 border-t border-border bg-surface-overlay/50 flex justify-end">
        <Button variant="ghost" className="group transition-all hover:bg-surface-elevated active:scale-95">
          View all pilot metrics
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
}
