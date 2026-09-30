"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEMO_MODE } from "@/lib/demo/config";
import { writeRoleCookie, type Role } from "@/lib/demo/roles";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("startup");
  const [email, setEmail] = useState("");
  const [fullname, setFullname] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailWarning, setEmailWarning] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);
    if (role === "gov" && val && !val.endsWith(".gov.in") && !val.endsWith(".nic.in")) {
      setEmailWarning("Warning: Government emails usually end in .gov.in or .nic.in");
    } else {
      setEmailWarning("");
    }
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as Role;
    setRole(newRole);
    if (newRole === "gov" && email && !email.endsWith(".gov.in") && !email.endsWith(".nic.in")) {
      setEmailWarning("Warning: Government emails usually end in .gov.in or .nic.in");
    } else {
      setEmailWarning("");
    }
  };

  function destinationFor(selected: Role): string {
    if (selected === "startup") return "/onboarding/startup";
    if (selected === "gov") return "/onboarding/gov";
    if (selected === "evaluator") return "/dashboard/evaluator";
    return "/dashboard/admin";
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    writeRoleCookie(role);

    if (DEMO_MODE) {
      router.push(destinationFor(role));
      return;
    }

    if (!isSupabaseConfigured()) {
      setError("Authentication is not configured. Contact the administrator.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullname,
            role,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      router.push(destinationFor(role));
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
          <h1 className="font-display text-2xl font-semibold">Create an Account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Join the startup-friendly public procurement platform.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="fullname">Full Name</Label>
            <Input
              id="fullname"
              placeholder="Full Name"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="you@example.com"
              required
            />
            {emailWarning && <p className="text-xs text-amber-500">{emailWarning}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="role">Role</Label>
            <select
              id="role"
              value={role}
              onChange={handleRoleChange}
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
            >
              <option value="startup">Startup / Innovator</option>
              <option value="gov">Government Officer / Department</option>
              <option value="evaluator">Evaluator / Domain Expert</option>
              <option value="admin">Program Administrator / Validator</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Repeat your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <input type="checkbox" id="terms" required className="h-4 w-4 rounded border-gray-300" />
            <Label htmlFor="terms" className="text-sm font-normal text-muted-foreground">
              I agree to the Terms &amp; Privacy Policy
            </Label>
          </div>

          {error && (
            <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </p>
          )}

          <Button type="submit" size="lg" className="mt-4 w-full" disabled={loading}>
            {loading ? "Creating account…" : "Create account"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-muted-foreground">Already have an account? </span>
          <Link href="/login" className="font-medium text-primary hover:underline">
            Log in
          </Link>
        </div>
      </section>
    </main>
  );
}
