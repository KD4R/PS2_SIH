"use client";

import { ShieldCheck, Lock, FileCheck2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ComplianceHealth() {
  return (
    <div className="flex flex-col h-full bg-surface/50 border border-border rounded-xl overflow-hidden">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-medium text-foreground">Compliance Health</h3>
        <p className="text-sm text-muted-foreground mt-1">Readiness for government procurement.</p>
      </div>
      
      <div className="flex-1 p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex size-10 rounded-full bg-green-500/10 border border-green-500/20 items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-green-500" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-sm text-foreground">DPIIT Verification</span>
              <span className="text-xs font-medium text-green-500 bg-green-500/10 px-2 py-0.5 rounded">Verified</span>
            </div>
            <p className="text-xs text-muted-foreground">Exempt from prior-turnover requirements.</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex size-10 rounded-full bg-green-500/10 border border-green-500/20 items-center justify-center shrink-0">
            <Lock className="w-5 h-5 text-green-500" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-sm text-foreground">Cybersecurity (VAPT)</span>
              <span className="text-xs font-medium text-green-500 bg-green-500/10 px-2 py-0.5 rounded">Cleared</span>
            </div>
            <p className="text-xs text-muted-foreground">CERT-In empanelled audit passed.</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex size-10 rounded-full bg-amber-500/10 border border-amber-500/20 items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-sm text-foreground">Data Privacy Clause</span>
              <span className="text-xs font-medium text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">Pending</span>
            </div>
            <p className="text-xs text-muted-foreground">Requires signature for Health Dept pilot.</p>
          </div>
        </div>
      </div>
      
      <div className="p-4 border-t border-border bg-surface-overlay/50">
        <Button variant="outline" className="w-full transition-all duration-300 hover:bg-surface-elevated active:scale-[0.98]">
          Manage Compliance
        </Button>
      </div>
    </div>
  );
}
