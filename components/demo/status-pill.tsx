import { cn } from "@/lib/utils";

export type PillStatus =
  | "Pending"
  | "Evidence Submitted"
  | "Verified"
  | "Payment Released"
  | "Rejected"
  | "Submitted"
  | "Evaluating"
  | "Evaluated"
  | "Approved"
  | "Active Pilot"
  | "Contract Signed"
  | "In Progress"
  | "Pilot Completed"
  | "In Validation"
  | "Validated"
  | "Scaled"
  | "Closed"
  | "Open"
  | "Queued"
  | "Assigned"
  | "Completed";

const STYLES: Record<PillStatus, string> = {
  // Consistent workflow colors (Phase 4): grey pending, amber evidence, blue verified, green released, red rejected.
  "Pending": "bg-muted text-muted-foreground border-border",
  "Evidence Submitted": "bg-amber-100 text-amber-800 border-amber-200",
  "Verified": "bg-blue-100 text-blue-800 border-blue-200",
  "Payment Released": "bg-green-100 text-green-800 border-green-200",
  "Rejected": "bg-red-100 text-red-700 border-red-200",
  "Submitted": "bg-slate-100 text-slate-700 border-slate-200",
  "Evaluating": "bg-violet-100 text-violet-700 border-violet-200",
  "Evaluated": "bg-indigo-100 text-indigo-700 border-indigo-200",
  "Approved": "bg-green-100 text-green-800 border-green-200",
  "Active Pilot": "bg-indigo-100 text-indigo-700 border-indigo-200",
  "Contract Signed": "bg-blue-100 text-blue-800 border-blue-200",
  "In Progress": "bg-indigo-100 text-indigo-700 border-indigo-200",
  "Pilot Completed": "bg-green-100 text-green-800 border-green-200",
  "In Validation": "bg-amber-100 text-amber-800 border-amber-200",
  "Validated": "bg-green-100 text-green-800 border-green-200",
  "Scaled": "bg-emerald-100 text-emerald-800 border-emerald-200",
  "Closed": "bg-muted text-muted-foreground border-border",
  "Open": "bg-blue-100 text-blue-700 border-blue-200",
  "Queued": "bg-muted text-muted-foreground border-border",
  "Assigned": "bg-blue-100 text-blue-800 border-blue-200",
  "Completed": "bg-green-100 text-green-800 border-green-200",
};

export function StatusPill({ status, className }: { status: PillStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium",
        STYLES[status],
        className,
      )}
    >
      {status}
    </span>
  );
}
