"use client";

import { useState } from "react";
import { FileDown, FileSignature } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StatusPill } from "@/components/demo/status-pill";
import { Badge } from "@/components/ui/badge";
import { downloadContractPdf } from "@/lib/demo/pdf";
import { fmtINR } from "@/lib/demo/format";
import { useToast } from "@/lib/demo/toast";
import type { Challenge, Milestone, Pilot, Startup } from "@/lib/demo/types";

/** F3 Agreement & Payments tab content (also used read-only on the startup mirror). */
export function AgreementTab({
  pilot,
  startup,
  challenge,
  department,
  avgPaymentDays,
  readOnly = false,
}: {
  pilot: Pilot;
  startup: Startup;
  challenge: Challenge;
  department: string;
  avgPaymentDays: number;
  readOnly?: boolean;
}) {
  const { toast } = useToast();
  const [contractOpen, setContractOpen] = useState(false);
  const [generating, setGenerating] = useState(false);

  const generate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setContractOpen(true);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Badge tone="brass">Average payment time: {avgPaymentDays} days</Badge>
        <div className="ml-auto flex gap-2">
          <Button size="sm" onClick={generate}>
            <FileSignature className="h-3.5 w-3.5" /> Generate contract
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              downloadContractPdf(pilot, { challengeTitle: challenge.title, startupName: startup.name, department })
            }
          >
            <FileDown className="h-3.5 w-3.5" /> Download PDF
          </Button>
        </div>
      </div>

      {/* Parties + scope */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-border bg-muted/20 p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Department</p>
          <p className="mt-1 font-semibold">{department}</p>
        </div>
        <div className="rounded-xl border border-border bg-muted/20 p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Startup</p>
          <p className="mt-1 font-semibold">{startup.name}</p>
          <p className="text-xs text-muted-foreground">DPIIT {startup.dpiitNo}</p>
        </div>
        <div className="rounded-xl border border-border bg-muted/20 p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Contract value</p>
          <p className="mt-1 text-lg font-bold text-primary">{fmtINR(pilot.contractValue)}</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <p className="text-sm font-semibold">Scope</p>
        <p className="mt-1 text-sm text-muted-foreground">{challenge.outcomeStatement}</p>
        <p className="mt-3 text-sm font-semibold">Duration</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {new Date(pilot.startDate).toLocaleDateString("en-IN")} – {new Date(pilot.endDate).toLocaleDateString("en-IN")} · Sandbox: {pilot.sandbox.area}
        </p>
      </div>

      {/* Milestone table */}
      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Milestone</th>
              <th className="px-4 py-3 font-medium">KPI</th>
              <th className="px-4 py-3 font-medium">Share</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Due</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card">
            {pilot.milestones.map((m: Milestone) => (
              <tr key={m.id} className="transition-colors hover:bg-muted/30">
                <td className="px-4 py-3.5 font-medium">{m.title}</td>
                <td className="max-w-72 px-4 py-3.5 text-muted-foreground">{m.kpi}</td>
                <td className="px-4 py-3.5 tabular-nums">{m.paymentPct}%</td>
                <td className="px-4 py-3.5 font-semibold tabular-nums">{fmtINR(m.amount)}</td>
                <td className="px-4 py-3.5 text-muted-foreground">{new Date(m.dueDate).toLocaleDateString("en-IN")}</td>
                <td className="px-4 py-3.5">
                  <StatusPill status={m.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Contract preview dialog */}
      <Dialog open={contractOpen} onOpenChange={setContractOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Pilot agreement — ready for signature</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 rounded-lg border border-border bg-muted/20 p-5 text-sm leading-relaxed">
            <p>
              This pilot agreement is entered into by <strong>{department}</strong> (“Department”) and{" "}
              <strong>{startup.name}</strong> (“Startup”), DPIIT {startup.dpiitNo}.
            </p>
            <p>
              <strong>Scope.</strong> {challenge.outcomeStatement}
            </p>
            <p>
              <strong>Value.</strong> {fmtINR(pilot.contractValue)} released across {pilot.milestones.length} outcome-linked
              milestones:
            </p>
            <ul className="list-inside list-disc space-y-1 text-muted-foreground">
              {pilot.milestones.map((m) => (
                <li key={m.id}>
                  {m.title} — {m.paymentPct}% ({fmtINR(m.amount)}) on “{m.kpi}”.
                </li>
              ))}
            </ul>
            <p>
              <strong>Data & IP.</strong> {pilot.compliance.ipClause}
            </p>
            <p>
              <strong>Exit.</strong> The department may halt the pilot at any time through the sandbox kill switch; only
              verified milestones are payable.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setContractOpen(false)}>Close</Button>
            <Button
              onClick={() => {
                downloadContractPdf(pilot, { challengeTitle: challenge.title, startupName: startup.name, department });
                setContractOpen(false);
              }}
            >
              <FileDown className="h-4 w-4" /> Download PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {readOnly && (
        <p className="text-[11px] text-muted-foreground">
          Illustrative data. Verify rule wording against current GFR/DPIIT guidelines before real use.
        </p>
      )}
    </div>
  );
}
