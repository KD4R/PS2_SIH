import { AppShell } from "@/components/layout/app-shell";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";
import { cookies } from "next/headers";

import { getUserRole } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export default async function AppGroupLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const cookieStore = await cookies();
  const demoRole = cookieStore.get("demo_role")?.value;
  const role = demoRole || await getUserRole(user.id);

  return (
    <AppShell 
      user={{ name: user.user_metadata.full_name ?? user.user_metadata.name ?? user.email ?? "Board member", avatarUrl: user.user_metadata.avatar_url }}
      role={role}
    >
      {children}
    </AppShell>
  );
}
