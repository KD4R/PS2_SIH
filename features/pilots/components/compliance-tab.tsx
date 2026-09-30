"use client";

import { useEffect, useState } from "react";
import { MapPin, ShieldCheck, FileSignature, Phone } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { Pilot } from "@/lib/demo/types";

/** F10 compliance panel — each row is a checklist toggle; the score recalculates. */
export function ComplianceTab({ pilot, onToggle }: { pilot: Pilot; onToggle?: (patch: { vaptDone: boolean; dsaSigned: boolean }) => void }) {
  const [vapt, setVapt] = useState(pilot.compliance.vaptDone);
  const [dsa, setDsa] = useState(pilot.compliance.dsaSigned);

  useEffect(() => {
    setVapt(pilot.compliance.vaptDone);
    setDsa(pilot.compliance.dsaSigned);
  }, [pilot.compliance.vaptDone, pilot.compliance.dsaSigned]);

  // Score model: residency 30 + DSA 30 + VAPT 40.
  const score = 30 + (dsa ? 30 : 0) + (vapt ? 40 : 0);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_260px]">
      <div className="divide-y divide-border rounded-xl border border-border bg-card">
        <Row
          icon={<MapPin className="h-4 w-4 text-blue-600" />}
          title="Data residency"
          detail="All pilot data is hosted within India (Mumbai region). Cross-border transfer is disabled."
          checked
          locked
        />
        <Row
          icon={<FileSignature className="h-4 w-4 text-violet-600" />}
          title="Intellectual property clause"
          detail={pilot.compliance.ipClause}
          checked
          locked
        />
        <Row
          icon={<FileSignature className="h-4 w-4 text-emerald-600" />}
          title="Data-sharing agreement signed"
          detail="Bilateral DSA executed between the department and the startup."
          checked={dsa}
          onChange={(v) => {
            setDsa(v);
            onToggle?.({ vaptDone: vapt, dsaSigned: v });
          }}
        />
        <Row
          icon={<ShieldCheck className="h-4 w-4 text-amber-600" />}
          title="VAPT completed"
          detail="Independent vulnerability assessment and penetration test on the pilot stack."
          checked={vapt}
          onChange={(v) => {
            setVapt(v);
            onToggle?.({ vaptDone: v, dsaSigned: dsa });
          }}
        />
        <Row
          icon={<Phone className="h-4 w-4 text-slate-600" />}
          title="Incident-response contact"
          detail={pilot.compliance.incidentContact}
          checked
          locked
        />
      </div>

      <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card p-6">
        <ScoreRing score={score} />
        <p className="mt-3 text-sm font-medium">Compliance score</p>
        <p className="mt-1 text-center text-xs text-muted-foreground">Residency 30 · DSA 30 · VAPT 40</p>
      </div>
    </div>
  );
}

function Row({
  icon,
  title,
  detail,
  checked,
  locked = false,
  onChange,
}: {
  icon: React.ReactNode;
  title: string;
  detail: string;
  checked: boolean;
  locked?: boolean;
  onChange?: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 px-5 py-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5">{icon}</span>
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{detail}</p>
        </div>
      </div>
      {locked ? (
        <span className="shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">SET</span>
      ) : (
        <Switch checked={checked} onCheckedChange={(v) => onChange?.(v)} />
      )}
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const color = score >= 90 ? "#16a34a" : score >= 60 ? "#d97706" : "#dc2626";
  const r = 30;
  const circ = 2 * Math.PI * r;
  return (
    <div className="relative h-20 w-20">
      <svg className="-rotate-90" width="80" height="80" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={r} fill="none" strokeWidth="6" className="stroke-muted" />
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          strokeWidth="6"
          stroke={color}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - score / 100)}
          style={{ transition: "stroke-dashoffset 300ms ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold tabular-nums">{score}</span>
      </div>
    </div>
  );
}
