"use client";

import { FileText, LayoutGrid } from "lucide-react";
import { DashboardShell } from "@/components/demo/dashboard-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { TemplateActions } from "@/features/templates/components/template-actions";
import { useDemoStore } from "@/lib/demo/store";
import { seed } from "@/lib/demo/store";
import { readRoleCookie } from "@/lib/demo/roles";
import type { Role } from "@/lib/demo/types";

function readRole(): Role {
  return readRoleCookie() ?? "gov";
}

function userNameFor(role: Role): string {
  if (role === "gov") return seed.CURRENT_USER.gov.name;
  if (role === "startup") return seed.CURRENT_STARTUP.name;
  if (role === "evaluator") return seed.CURRENT_USER.evaluator.name;
  return seed.CURRENT_USER.admin.name;
}

function subtitleFor(role: Role): string {
  if (role === "gov") return `${seed.CURRENT_USER.gov.title}, ${seed.CURRENT_USER.gov.department}`;
  if (role === "startup") return seed.CURRENT_STARTUP.founder;
  if (role === "evaluator") return seed.CURRENT_USER.evaluator.title;
  return seed.CURRENT_USER.admin.title;
}

const NAV = (role: Role) => [
  { key: "overview", label: "nav.overview", icon: LayoutGrid, href: role === "gov" ? "/dashboard/gov" : role === "startup" ? "/dashboard/startup" : role === "evaluator" ? "/dashboard/evaluator" : "/dashboard/admin" },
  { key: "templates", label: "nav.templates", icon: FileText },
];

const KIND_CHIP: Record<string, string> = {
  problem: "bg-blue-100 text-blue-700",
  evaluation: "bg-violet-100 text-violet-700",
  pilot: "bg-indigo-100 text-indigo-700",
  dataip: "bg-emerald-100 text-emerald-700",
  cyber: "bg-red-100 text-red-700",
  risk: "bg-amber-100 text-amber-700",
  pathway: "bg-slate-100 text-slate-700",
};

export default function TemplatesPage() {
  const hydrated = useDemoStore((s) => s.hydrated);
  const templates = useDemoStore((s) => s.templates);
  const role = readRole();

  return (
    <DashboardShell role={role} userName={userNameFor(role)} userSubtitle={subtitleFor(role)} nav={NAV(role)} activeKey="templates" title="Template library">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h2 className="text-xl font-bold">Standard document templates</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Pre-cleared formats for challenges, evaluation, pilot agreements, data & IP, cybersecurity, risk and procurement
            pathways. Attach them to a challenge or download for offline review.
          </p>
        </div>

        {!hydrated ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-44 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : templates.length === 0 ? (
          <EmptyState icon={FileText} title="No templates available" description="Templates will appear here once published by the programme office." />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {templates.map((t) => (
              <div key={t.id} className="flex flex-col rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${KIND_CHIP[t.kind] ?? "bg-muted text-muted-foreground"}`}>
                    {t.kind}
                  </span>
                  <span className="text-xs text-muted-foreground">{t.sections.length} sections</span>
                </div>
                <h3 className="mt-3 font-semibold">{t.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{t.description}</p>
                <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                  {t.sections.slice(0, 3).map((s) => (
                    <li key={s.heading} className="flex items-center gap-1.5">
                      <span className="h-1 w-1 rounded-full bg-primary" /> {s.heading}
                    </li>
                  ))}
                  {t.sections.length > 3 && <li className="pl-3">+{t.sections.length - 3} more</li>}
                </ul>
                <div className="mt-4 border-t border-border pt-4">
                  <TemplateActions template={t} />
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-[11px] text-muted-foreground">
          Illustrative data. Verify rule wording against current GFR/DPIIT guidelines before real use.
        </p>
      </div>
    </DashboardShell>
  );
}
