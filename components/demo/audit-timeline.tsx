"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { AuditEvent, Role } from "@/lib/demo/types";
import { cn } from "@/lib/utils";

const ROLE_CHIP: Record<Role, string> = {
  startup: "bg-indigo-100 text-indigo-700",
  gov: "bg-blue-100 text-blue-700",
  evaluator: "bg-violet-100 text-violet-700",
  admin: "bg-slate-200 text-slate-700",
};

const ROLE_LABEL: Record<Role, string> = {
  startup: "Startup",
  gov: "Department",
  evaluator: "Evaluator",
  admin: "Admin",
};

function fmt(at: string) {
  return new Date(at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

/**
 * F8 audit trail. Vertical timeline of actor + role chip + action + timestamp.
 * `searchable` adds a text filter and role select for the admin audit page.
 */
export function AuditTimeline({
  events,
  searchable = false,
  limit,
  className,
}: {
  events: AuditEvent[];
  searchable?: boolean;
  limit?: number;
  className?: string;
}) {
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "all">("all");

  const filtered = useMemo(() => {
    let list = events;
    if (roleFilter !== "all") list = list.filter((e) => e.role === roleFilter);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (e) =>
          e.action.toLowerCase().includes(q) ||
          e.actor.toLowerCase().includes(q) ||
          e.entity.toLowerCase().includes(q),
      );
    }
    return limit ? list.slice(0, limit) : list;
  }, [events, query, roleFilter, limit]);

  return (
    <div className={cn("space-y-4", className)}>
      {searchable && (
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-52">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search actions, actors…"
              className="h-9 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as Role | "all")}
            className="h-9 rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="all">All roles</option>
            <option value="gov">Department</option>
            <option value="startup">Startup</option>
            <option value="evaluator">Evaluator</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">No matching activity.</p>
      ) : (
        <ol className="relative space-y-5 border-l border-border pl-6">
          {filtered.map((e) => (
            <li key={e.id} className="relative">
              <span className="absolute -left-[30px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-primary/10" />
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium leading-snug">{e.action}</p>
                <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", ROLE_CHIP[e.role])}>
                  {ROLE_LABEL[e.role]}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {e.actor} · {e.entity} · {fmt(e.at)}
              </p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
