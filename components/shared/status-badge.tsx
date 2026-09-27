"use client";

import { cn } from "@/lib/utils";

type StatusType = "Draft" | "Open" | "Under review" | "Piloting" | "Scale-ready" | "Closed";

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const styles: Record<StatusType, string> = {
    "Draft": "bg-slate-100 text-slate-700 border-slate-200",
    "Open": "bg-blue-100 text-blue-700 border-blue-200",
    "Under review": "bg-amber-100 text-amber-700 border-amber-200",
    "Piloting": "bg-indigo-100 text-indigo-700 border-indigo-200",
    "Scale-ready": "bg-green-100 text-green-700 border-green-200",
    "Closed": "bg-muted text-muted-foreground border-border",
  };

  return (
    <span 
      className={cn(
        "px-2.5 py-1 rounded-full text-xs font-medium border",
        styles[status],
        className
      )}
    >
      {status}
    </span>
  );
}
