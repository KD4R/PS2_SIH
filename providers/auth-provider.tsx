"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DEMO_MODE } from "@/lib/demo/config";
import { roleHome, isRole } from "@/lib/demo/roles";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { ensureProfile } from "@/lib/supabase/profile";

const AUTH_PAGES = ["/auth/forgot-password"];

function AuthRedirectListener() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const redirected = useRef(false);

  useEffect(() => {
    if (DEMO_MODE || !isSupabaseConfigured() || !AUTH_PAGES.includes(pathname)) return;

    redirected.current = false;
    const supabase = createClient();
    const nextParam = searchParams.get("next");

    function getDashboardUrl(user: { user_metadata?: { role?: string } }) {
      const role = user?.user_metadata?.role;
      if (isRole(role)) return roleHome(role);

      const match = typeof document !== "undefined" ? document.cookie.match(/(?:^|; )demo_role=([^;]*)/) : null;
      if (match) {
        const demoRole = decodeURIComponent(match[1] ?? "");
        if (isRole(demoRole)) return roleHome(demoRole);
      }
      return "/login";
    }

    async function handleSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user || redirected.current) return;
      await ensureProfile(session.user);
      redirected.current = true;
      const nextUrl = nextParam?.startsWith("/") ? nextParam : getDashboardUrl(session.user);
      router.replace(nextUrl);
    }

    void handleSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!session?.user) return;
      await ensureProfile(session.user);
      if (AUTH_PAGES.includes(pathname) && !redirected.current && (event === "SIGNED_IN" || event === "TOKEN_REFRESHED")) {
        redirected.current = true;
        const nextUrl = nextParam?.startsWith("/") ? nextParam : getDashboardUrl(session.user);
        router.replace(nextUrl);
      }
    });

    return () => subscription.unsubscribe();
  }, [pathname, router, searchParams]);

  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AuthRedirectListener />
      {children}
    </>
  );
}
