"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Globe, Menu, X } from "lucide-react";
import { NotificationBell } from "./notification-bell";
import { useDemoStore } from "@/lib/demo/store";
import { useT } from "@/lib/demo/i18n";
import { DEMO_MODE } from "@/lib/demo/config";
import type { Role } from "@/lib/demo/types";

export interface ShellNavItem {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
}

export interface DashboardShellProps {
  role: Role;
  /** Label shown in the header; varies per role. */
  userName: string;
  userSubtitle: string;
  nav: ShellNavItem[];
  activeKey: string;
  title?: string;
  /** Called when a tab-style (no href) nav item is clicked. */
  onTabSelect?: (key: string) => void;
  children: React.ReactNode;
}

const ROLE_TAG: Record<Role, string> = {
  startup: "Startup",
  gov: "Department",
  evaluator: "Evaluator",
  admin: "Administrator",
};

/**
 * Shared dashboard chrome: sidebar + header + content area. Extracted from
 * the four role dashboards so every page keeps identical visuals. Tab items
 * (no href) render as buttons; the page decides what they switch to.
 */
export function DashboardShell({ role, userName, userSubtitle, nav, activeKey, title, onTabSelect, children }: DashboardShellProps) {
  const t = useT();
  const lang = useDemoStore((s) => s.lang);
  const setLang = useDemoStore((s) => s.setLang);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => setMobileOpen(false), [activeKey]);

  const initials = userName
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const cycleLang = () => setLang(lang === "en" ? "hi" : lang === "hi" ? "mr" : "en");
  const langLabel = lang === "en" ? "EN" : lang === "hi" ? "हि" : "मर";

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-card transition-transform duration-200 lg:static lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-5">
          <Link href="/" className="text-lg font-bold text-primary hover:opacity-80">
            GovProcure
          </Link>
          <button type="button" className="lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = item.key === activeKey;
            const cls = `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`;
            return item.href ? (
              <Link key={item.key} href={item.href} className={cls}>
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{t(item.label)}</span>
              </Link>
            ) : (
              <button
                key={item.key}
                type="button"
                className={cls}
                data-tab={item.key}
                onClick={() => onTabSelect?.(item.key)}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{t(item.label)}</span>
              </button>
            );
          })}
        </nav>
        <div className="border-t border-border p-3 text-xs text-muted-foreground">
          {DEMO_MODE ? "Sample data — no live backend" : ""}
        </div>
      </aside>

      {mobileOpen && <div className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />}

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-border bg-card px-4 shadow-sm sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button type="button" className="lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="truncate text-lg font-semibold">{title ?? t(`nav.${activeKey}`)}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={cycleLang}
              className="flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              title="English / हिन्दी / मराठी"
            >
              <Globe className="h-3.5 w-3.5" />
              {langLabel}
            </button>
            <NotificationBell role={role} />
            <div className="flex items-center gap-2.5 rounded-full border border-border py-1 pl-1 pr-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {initials}
              </span>
              <span className="hidden leading-tight sm:block">
                <span className="block text-xs font-semibold">{userName}</span>
                <span className="block text-[11px] text-muted-foreground">
                  {ROLE_TAG[role]} · {userSubtitle}
                </span>
              </span>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
