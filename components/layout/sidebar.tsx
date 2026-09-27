"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gavel, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { secondaryNav } from "@/constants/nav";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export interface SidebarProps {
  /** Live counts keyed by NavItem.badgeKey — supplied by the caller, never fetched here. */
  badgeCounts?: Partial<Record<"activeMeetings" | "pendingReports", number>>;
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
  className?: string;
  primaryNav?: any[];
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

/**
 * Primary app-shell navigation. Pure presentation: route structure comes
 * from `constants/nav.ts`, active state comes from `usePathname`, and
 * live badge counts are passed in by whichever layout mounts this — the
 * component itself never fetches data.
 */
export function Sidebar({ badgeCounts, collapsed = false, onToggleCollapsed, className, primaryNav = [], isMobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-border bg-surface transition-transform duration-300 ease-in-out fixed inset-y-0 left-0 z-50 md:static md:translate-x-0",
        collapsed ? "md:w-[68px]" : "w-64",
        isMobileOpen ? "translate-x-0" : "-translate-x-full",
        className,
      )}
    >
      <div className="flex items-center justify-between px-4 h-16">
        <Link href="/" className={cn("flex items-center gap-2 hover:opacity-80 transition-opacity", collapsed && "md:justify-center px-0")}>
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Gavel className="size-4" />
          </span>
          {(!collapsed || isMobileOpen) && <span className="font-display text-lg font-medium tracking-tight">GovProcure AI</span>}
        </Link>
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onMobileClose}>
          <X className="size-4" />
        </Button>
      </div>

      <Separator />

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
        {primaryNav.map((section: any) => (
          <div key={section.label} className="space-y-1">
            {(!collapsed || isMobileOpen) && (
              <p className="px-2 text-[0.7rem] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                {section.label}
              </p>
            )}
            {section.items.map((item: any) => {
              const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
              const badgeCount = item.badgeKey ? badgeCounts?.[item.badgeKey as keyof typeof badgeCounts] : undefined;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                    collapsed && "justify-center px-0",
                    isActive
                      ? "bg-primary/12 text-primary"
                      : "text-muted-foreground hover:bg-surface-elevated hover:text-foreground",
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  {(!collapsed || isMobileOpen) && <span className="flex-1 truncate">{item.label}</span>}
                  {(!collapsed || isMobileOpen) && Boolean(badgeCount) && (
                    <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[0.65rem] font-semibold text-primary">
                      {badgeCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <Separator />

      <div className="space-y-1 px-3 py-3">
        {secondaryNav.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                collapsed && "justify-center px-0",
                isActive ? "bg-primary/12 text-primary" : "text-muted-foreground hover:bg-surface-elevated hover:text-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" />
              {(!collapsed || isMobileOpen) && <span>{item.label}</span>}
            </Link>
          );
        })}

        {onToggleCollapsed && (
          <Button
            variant="ghost"
            size={collapsed ? "icon" : "sm"}
            className="w-full justify-center text-muted-foreground hidden md:flex"
            onClick={onToggleCollapsed}
          >
            {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
            {!collapsed && <span>Collapse</span>}
          </Button>
        )}
      </div>
    </aside>
  );
}
