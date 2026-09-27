"use client";

import { AlertTriangle, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const alerts = [
  {
    id: "a1",
    title: "3 New Proposals require evaluation",
    context: "Smart City Traffic Management Challenge",
    type: "action",
    time: "2 hours ago"
  },
  {
    id: "a2",
    title: "AI Fraud Risk Alert: High severity",
    context: "Proposal ID #892 (Anomaly detected in financials)",
    type: "critical",
    time: "5 hours ago"
  },
  {
    id: "a3",
    title: "Milestone 1 Validation Pending",
    context: "AI Water Leakage Detector Pilot",
    type: "pending",
    time: "1 day ago"
  }
];

export function ActionableInbox() {
  return (
    <div className="flex flex-col h-full bg-surface/50 border border-border rounded-xl overflow-hidden relative">
      {/* Decorative gradient for urgency */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-amber-500 to-blue-500 opacity-50" />
      
      <div className="p-6 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-foreground">Actionable Inbox</h3>
          <p className="text-sm text-muted-foreground mt-1">Alerts requiring your immediate attention.</p>
        </div>
        <div className="flex items-center justify-center size-8 rounded-full bg-red-500/10 text-red-500 font-bold text-sm">
          {alerts.length}
        </div>
      </div>
      
      <div className="flex-1 p-6 flex flex-col gap-4">
        {alerts.map((alert) => (
          <div key={alert.id} className="p-4 rounded-lg bg-surface border border-border flex items-start gap-4 transition-all hover:border-foreground/20 group">
            <div className={`mt-0.5 flex size-8 rounded-full items-center justify-center shrink-0 ${
              alert.type === 'critical' ? 'bg-red-500/10 text-red-500' :
              alert.type === 'action' ? 'bg-blue-500/10 text-blue-500' :
              'bg-amber-500/10 text-amber-500'
            }`}>
              {alert.type === 'critical' ? <AlertTriangle className="w-4 h-4" /> :
               alert.type === 'action' ? <CheckCircle2 className="w-4 h-4" /> :
               <Clock className="w-4 h-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-foreground text-sm group-hover:text-primary transition-colors">{alert.title}</h4>
              <p className="text-xs text-muted-foreground mt-1 truncate">{alert.context}</p>
              <p className="text-[10px] text-muted-foreground/60 mt-2 font-mono">{alert.time}</p>
            </div>
            <Button size="sm" variant={alert.type === 'critical' ? 'destructive' : 'secondary'} className="shrink-0 transition-transform active:scale-95">
              Resolve
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
