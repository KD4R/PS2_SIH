"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useDemoStore } from "@/lib/demo/store";
import { DEMO_MODE } from "@/lib/demo/config";
import { ROLE_LABELS, roleHome, readRoleCookie, writeRoleCookie, type Role } from "@/lib/demo/roles";

const ROLES: Role[] = ["gov", "startup", "evaluator", "admin"];

/**
 * Floating pill for switching role, resetting data, and toggling language.
 * Mounted on /dashboard/* and /public only. Hidden with Shift+D.
 */
export function DemoBar() {
  const router = useRouter();
  const pathname = usePathname();
  const lang = useDemoStore((s) => s.lang);
  const setLang = useDemoStore((s) => s.setLang);
  const resetDemo = useDemoStore((s) => s.resetDemo);
  const [visible, setVisible] = useState(true);
  const [current, setCurrent] = useState<Role | null>(null);

  useEffect(() => {
    if (!DEMO_MODE) return;
    setVisible(sessionStorage.getItem("demo-bar-hidden") !== "1");
    setCurrent(readRoleCookie());

    const onKey = (e: KeyboardEvent) => {
      if (e.shiftKey && (e.key === "D" || e.key === "d")) {
        setVisible((v) => {
          sessionStorage.setItem("demo-bar-hidden", v ? "1" : "0");
          return !v;
        });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!DEMO_MODE || !visible) return null;
  if (!pathname.startsWith("/dashboard") && !pathname.startsWith("/public")) return null;

  function switchRole(role: Role) {
    writeRoleCookie(role);
    setCurrent(role);
    router.push(roleHome(role));
  }

  return (
    <div className="fixed bottom-4 left-1/2 z-[70] -translate-x-1/2 rounded-full border border-border bg-card/95 px-2 py-1.5 shadow-lg backdrop-blur print:hidden">
      <div className="flex items-center gap-1">
        <span className="px-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">View as</span>
        {ROLES.map((role) => (
          <button
            key={role}
            type="button"
            onClick={() => switchRole(role)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              current === role ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {ROLE_LABELS[role]}
          </button>
        ))}
        <span className="mx-1 h-4 w-px bg-border" />
        <button
          type="button"
          onClick={() => setLang(lang === "en" ? "hi" : lang === "hi" ? "mr" : "en")}
          className="rounded-full px-3 py-1 text-xs font-medium uppercase text-muted-foreground hover:bg-muted hover:text-foreground"
          title="Switch language (English / हिन्दी / मराठी)"
        >
          {lang}
        </button>
        <button
          type="button"
          onClick={() => {
            resetDemo();
            router.refresh();
          }}
          className="rounded-full px-3 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          title="Restore original data"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
