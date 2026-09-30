"use client";

import { CheckCircle2, Circle, XCircle } from "lucide-react";
import type { Challenge, Startup } from "@/lib/demo/types";
import { cn } from "@/lib/utils";

type RowState = "pass" | "note" | "fail";

interface Row {
  label: string;
  state: RowState;
  detail: string;
}

function buildRows(startup: Startup, challenge: Challenge): Row[] {
  const ageYears = new Date().getFullYear() - startup.incorporatedYear;
  return [
    {
      label: "DPIIT recognition",
      state: startup.dpiitVerified ? "pass" : "fail",
      detail: startup.dpiitVerified ? `Verified — certificate ${startup.dpiitNo}` : "Not recognised — register at startupindia.gov.in",
    },
    {
      label: "Incorporation age within limit",
      state: ageYears <= 10 ? "pass" : "note",
      detail: `Incorporated ${startup.incorporatedYear} (${ageYears} year${ageYears === 1 ? "" : "s"} old) — within the 10-year startup window.`,
    },
    {
      label: "Prior turnover requirement",
      state: "pass",
      detail: "Waived for DPIIT-recognised startups under the relaxation clause.",
    },
    {
      label: "Prior experience requirement",
      state: "pass",
      detail: "Waived — pilot-based evidence accepted in place of past experience.",
    },
    {
      label: "Earnest money deposit (EMD)",
      state: "pass",
      detail: "Exempt for startups on this challenge.",
    },
    {
      label: "Domain fit",
      state: "pass",
      detail: `${startup.sector} matches the challenge domain ${challenge.domain}.`,
    },
  ];
}

/**
 * F2 eligibility relaxation checker. Six rows with a green check, amber note
 * or red cross, then a bottom line "Eligible to bid" / "Eligible with conditions".
 */
export function EligibilityChecker({
  startup,
  challenge,
  className,
}: {
  startup: Startup;
  challenge: Challenge;
  className?: string;
}) {
  const rows = buildRows(startup, challenge);
  const failed = rows.filter((r) => r.state === "fail").length;
  const noted = rows.filter((r) => r.state === "note").length;

  const bottomLine = failed > 0 ? "Not eligible without clarifications" : noted > 0 ? "Eligible with conditions" : "Eligible to bid";
  const bottomTone = failed > 0 ? "bg-red-50 text-red-800 border-red-200" : noted > 0 ? "bg-amber-50 text-amber-800 border-amber-200" : "bg-green-50 text-green-800 border-green-200";

  return (
    <div className={cn("space-y-3", className)}>
      <div className="divide-y divide-border rounded-xl border border-border bg-card">
        {rows.map((row) => (
          <div key={row.label} className="flex items-start gap-3 px-4 py-3">
            {row.state === "pass" ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
            ) : row.state === "note" ? (
              <Circle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
            ) : (
              <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
            )}
            <div>
              <p className="text-sm font-medium">{row.label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{row.detail}</p>
            </div>
          </div>
        ))}
      </div>

      <div className={cn("rounded-lg border px-4 py-3 text-sm font-semibold", bottomTone)}>{bottomLine}</div>
      <p className="text-[11px] text-muted-foreground">
        Illustrative data. Verify rule wording against current GFR/DPIIT guidelines before real use.
      </p>
    </div>
  );
}
