import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { roleHome } from "@/lib/demo/roles";

export const dynamic = "force-dynamic";

/** Role-aware entry: sends the user to their role's home or back to login. */
export default async function DashboardRedirect() {
  const store = await cookies();
  const role = store.get("demo_role")?.value;
  redirect(roleHome(role));
}
