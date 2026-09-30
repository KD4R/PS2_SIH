"use client";

import { useState } from "react";
import { PowerOff, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KillSwitchDialog } from "@/features/pilots/components/kill-switch-dialog";
import { useDemoStore } from "@/lib/demo/store";
import { useToast } from "@/lib/demo/toast";
import type { Pilot } from "@/lib/demo/types";

const LIKELIHOOD_ROW: Record<string, string> = { Low: "row-span-1", Medium: "row-span-1", High: "row-span-1" };

/** F11 Risk register + sandbox scope + kill switch. */
export function RiskSandboxTab({ pilot, canAct = true }: { pilot: Pilot; canAct?: boolean }) {
  const { toast } = useToast();
  const toggleKillSwitch = useDemoStore((s) => s.toggleKillSwitch);
  const frozen = pilot.sandbox.killSwitchActive;

  return (
    <div className="space-y-6">
      {frozen && (
        <div className="flex items-center gap-3 rounded-xl border border-red-300 bg-red-50 px-5 py-4">
          <ShieldAlert className="h-5 w-5 shrink-0 text-red-600" />
          <div>
            <p className="text-sm font-bold text-red-800">Kill switch active — pilot frozen</p>
            <p className="text-xs text-red-700">All milestone actions and payments are suspended pending department review.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        {/* Risk register */}
        <div className="overflow-hidden rounded-xl border border-border">
          <div className="border-b border-border bg-muted/30 px-4 py-3">
            <p className="text-sm font-semibold">Risk register</p>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-muted/20 text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 font-medium">Risk</th>
                <th className="px-4 py-2.5 font-medium">Likelihood</th>
                <th className="px-4 py-2.5 font-medium">Impact</th>
                <th className="px-4 py-2.5 font-medium">Mitigation</th>
                <th className="px-4 py-2.5 font-medium">Owner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {pilot.risks.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    No risks logged yet.
                  </td>
                </tr>
              )}
              {pilot.risks.map((r) => (
                <tr key={r.id} className="transition-colors hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{r.title}</td>
                  <td className="px-4 py-3">
                    <RiskChip label={r.likelihood} />
                  </td>
                  <td className="px-4 py-3">
                    <RiskChip label={r.impact} />
                  </td>
                  <td className="max-w-64 px-4 py-3 text-xs text-muted-foreground">{r.mitigation}</td>
                  <td className="px-4 py-3 text-xs">{r.owner}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Sandbox scope */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm font-semibold">Sandbox scope</p>
            <dl className="mt-3 space-y-2.5 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Area</dt>
                <dd className="font-medium">{pilot.sandbox.area}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Duration</dt>
                <dd className="font-medium">{pilot.sandbox.durationWeeks} weeks</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Budget cap</dt>
                <dd className="font-medium">₹{pilot.sandbox.budgetCap.toLocaleString("en-IN")}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Exit criteria</dt>
                <dd className="mt-1">
                  <ul className="list-inside list-disc space-y-1 text-xs text-muted-foreground">
                    {pilot.sandbox.exitCriteria.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                </dd>
              </div>
            </dl>
          </div>

          {canAct && (
            <KillSwitchButton pilotId={pilot.id} frozen={frozen} onToggle={toggleKillSwitch} onToast={toast} />
          )}
        </div>
      </div>
    </div>
  );
}

function KillSwitchButton({
  pilotId,
  frozen,
  onToggle,
  onToast,
}: {
  pilotId: string;
  frozen: boolean;
  onToggle: (id: string) => void;
  onToast: (text: string, tone?: "success" | "info" | "warning" | "error") => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        className={frozen ? "w-full border-green-200 text-green-700 hover:bg-green-50" : "w-full border-red-200 text-red-700 hover:bg-red-50"}
        onClick={() => setOpen(true)}
      >
        <PowerOff className="h-4 w-4" /> {frozen ? "Deactivate kill switch" : "Kill switch"}
      </Button>
      {open && (
        <KillSwitchDialog
          onClose={() => setOpen(false)}
          onSubmit={(reason) => {
            onToggle(pilotId);
            setOpen(false);
            onToast(frozen ? "Kill switch deactivated — pilot resumed" : `Kill switch activated: ${reason}`, frozen ? "success" : "warning");
          }}
        />
      )}
    </>
  );
}

function RiskChip({ label }: { label: string }) {
  const tone =
    label === "High"
      ? "bg-red-100 text-red-700"
      : label === "Medium"
        ? "bg-amber-100 text-amber-700"
        : "bg-green-100 text-green-700";
  return <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${tone}`}>{label}</span>;
}
