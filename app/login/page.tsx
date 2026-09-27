"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!role) {
      setError("Please select a user role.");
      return;
    }

    if (!isSupabaseConfigured()) {
      setError("Authentication is not configured. Contact the administrator.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      // Set a demo_role cookie so the (app) layout can pick it up
      document.cookie = `demo_role=${role === "startup" ? "startup_founder" : role === "gov" ? "department_officer" : "evaluator"}; path=/; max-age=86400`;

      // Redirect based on selected role
      if (role === "startup") {
        router.push("/dashboard/startup");
      } else if (role === "gov") {
        router.push("/dashboard/gov");
      } else if (role === "evaluator") {
        router.push("/dashboard/evaluator");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <section className="glass w-full max-w-md rounded-2xl border border-border p-8 shadow-2xl bg-card">
        <div className="mb-4">
          <Link href="/" className="text-sm text-primary hover:underline flex items-center gap-2 w-fit">
            &larr; Back to Home
          </Link>
        </div>
        <div className="mb-8 text-center">
          <h1 className="font-display text-2xl font-semibold">Sign In</h1>
          <p className="mt-2 text-sm text-muted-foreground">Welcome back to GovProcure</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="h-12 bg-background border-input"
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
              className="h-12 bg-background border-input"
              required
            />
          </div>

          <div className="space-y-1.5">
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="flex h-12 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
            >
              <option value="" disabled>Please Select User Role</option>
              <option value="startup">Startup / Innovator</option>
              <option value="gov">Government Officer / Department</option>
              <option value="evaluator">Evaluator / Domain Expert</option>
            </select>
          </div>

          <div className="pt-2">
            <Link href="/auth/forgot-password" className="text-sm text-blue-600 hover:underline">
              Forgot Your Password?
            </Link>
          </div>

          {error && (
            <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </p>
          )}

          <Button type="submit" size="lg" className="w-full h-12 bg-[#449e48] hover:bg-[#3a863d] text-white text-base" disabled={loading}>
            {loading ? "Signing in…" : "Submit"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-muted-foreground">Don't Have Account? </span>
          <Link href="/signup" className="text-blue-500 hover:underline">
            Register Now
          </Link>
        </div>
      </section>
    </main>
  );
}
