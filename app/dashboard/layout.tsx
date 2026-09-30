import { redirect } from "next/navigation";
import { DEMO_MODE } from "@/lib/demo/config";
import { getCurrentUser } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  if (!DEMO_MODE) {
    const user = await getCurrentUser();
    if (!user) redirect("/login");
  }

  return <>{children}</>;
}
