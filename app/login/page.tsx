"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DEMO_MODE } from "@/lib/demo/config";
import { ROLE_LABELS, roleHome, writeRoleCookie, type Role } from "@/lib/demo/roles";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

const ROLE_OPTIONS: Role[] = ["startup", "gov", "evaluator", "admin"];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role | "">("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function enterAs(selected: Role) {
    writeRoleCookie(selected);
    router.push(roleHome(selected));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!role) {
      setError("Please select a user role.");
      return;
    }

    if (DEMO_MODE) {
      enterAs(role);
      return;
    }

    if (!isSupabaseConfigured()) {
      setError("Authentication is not configured. Contact the administrator.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }
      router.push(roleHome(role));
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <section className="glass w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-2xl">
        <div className="mb-4">
          <Link href="/" className="flex w-fit items-center gap-2 text-sm text-primary hover:underline">
            &larr; Back to Home
          </Link>
        </div>
        <div className="mb-8 text-center">
          <h1 className="font-display text-2xl font-semibold">Sign In</h1>
          <p className="mt-2 text-sm text-muted-foreground">Welcome back to GovProcure</p>
        </div>

        {DEMO_MODE && (
          <div className="mb-6 rounded-xl border border-primary/30 bg-primary/5 p-4">
            <p className="mb-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Quick access — continue as
            </p>
            <div className="grid grid-cols-2 gap-2">
              {ROLE_OPTIONS.map((r) => (
                <Button key={r} type="button" variant="outline" size="sm" onClick={() => enterAs(r)}>
                  {ROLE_LABELS[r]}
                </Button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="h-12 border-input bg-background"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="h-12 border-input bg-background"
              required
            />
          </div>

          <div className="space-y-1.5">
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as Role | "")}
              className="flex h-12 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
            >
              <option value="" disabled>
                Please Select User Role
              </option>
              <option value="startup">Startup / Innovator</option>
              <option value="gov">Government Officer / Department</option>
              <option value="evaluator">Evaluator / Domain Expert</option>
              <option value="admin">Program Administrator / Validator</option>
            </select>
          </div>

          {!DEMO_MODE && (
            <div className="pt-2">
              <Link href="/auth/forgot-password" className="text-sm text-blue-600 hover:underline">
                Forgot Your Password?
              </Link>
            </div>
          )}

          {error && (
            <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </p>
          )}

          <Button type="submit" size="lg" className="h-12 w-full bg-[#449e48] text-base text-white hover:bg-[#3a863d]" disabled={loading}>
            {loading ? "Signing in…" : "Submit"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-muted-foreground">Don&apos;t have an account? </span>
          <Link href="/signup" className="text-blue-500 hover:underline">
            Register Now
          </Link>
        </div>
      </section>
    </main>
  );
}
