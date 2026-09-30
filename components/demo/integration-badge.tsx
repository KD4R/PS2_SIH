"use client";

import { useState } from "react";
import { Check, CloudCog, Landmark, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export type IntegrationKind = "dpiit" | "gem" | "cppp";

const CONFIG: Record<IntegrationKind, { label: string; icon: typeof ShieldCheck }> = {
  dpiit: { label: "Verified via Startup India / DPIIT", icon: ShieldCheck },
  gem: { label: "Synced with GeM", icon: Landmark },
  cppp: { label: "Linked to CPPP", icon: CloudCog },
};

/**
 * F12 integration badge. `verified=false` renders a sync action that spins
 * for 1.5s and then ticks — used for "Verify DPIIT" and "Import from GeM".
 */
export function IntegrationBadge({
  kind,
  verified = true,
  onSync,
  className,
}: {
  kind: IntegrationKind;
  verified?: boolean;
  onSync?: () => void;
  className?: string;
}) {
  const [syncing, setSyncing] = useState(false);
  const [done, setDone] = useState(verified);
  const { label, icon: Icon } = CONFIG[kind];

  const run = () => {
    if (done || syncing) return;
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      setDone(true);
      onSync?.();
    }, 1500);
  };

  return (
    <button
      type="button"
      onClick={run}
      disabled={done || syncing}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        done
          ? "border-green-200 bg-green-50 text-green-700"
          : "border-border bg-card text-muted-foreground hover:bg-muted cursor-pointer",
        className,
      )}
    >
      {done ? (
        <Check className="h-3.5 w-3.5 text-green-600" />
      ) : syncing ? (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      ) : (
        <Icon className="h-3.5 w-3.5" />
      )}
      {done ? label : syncing ? "Syncing…" : label.replace("Verified via ", "Verify ").replace("Synced with ", "Import from ").replace("Linked to ", "Link to ")}
    </button>
  );
}
