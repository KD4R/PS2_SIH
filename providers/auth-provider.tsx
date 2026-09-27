"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { ensureProfile } from "@/lib/supabase/profile";

const AUTH_PAGES = ["/auth/forgot-password"];

function AuthRedirectListener() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const redirected = useRef(false);

  useEffect(() => {
    if (!isSupabaseConfigured() || !AUTH_PAGES.includes(pathname)) return;

    redirected.current = false;
    const supabase = createClient();
    const nextParam = searchParams.get("next");

    function getDashboardUrl(user: any) {
      const role = user?.user_metadata?.role;
      if (role === "startup" || role === "startup_founder") return "/dashboard/startup";
      if (role === "gov" || role === "department_officer") return "/dashboard/gov";
      if (role === "evaluator") return "/dashboard/evaluator";
      if (role === "admin") return "/dashboard/admin";
      
      const match = typeof document !== 'undefined' ? document.cookie.match(/(?:^|; )demo_role=([^;]*)/) : null;
      if (match) {
        const demoRole = decodeURIComponent(match[1]);
        if (demoRole === "startup" || demoRole === "startup_founder") return "/dashboard/startup";
        if (demoRole === "gov" || demoRole === "department_officer") return "/dashboard/gov";
        if (demoRole === "evaluator") return "/dashboard/evaluator";
        if (demoRole === "admin") return "/dashboard/admin";
      }
      return "/dashboard";
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
