export type Role = "startup" | "gov" | "evaluator" | "admin";

const ROLES: Role[] = ["startup", "gov", "evaluator", "admin"];

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as string[]).includes(value);
}

/** Home route for each role. Defaults to the login page when unknown. */
export function roleHome(role: unknown): string {
  switch (role) {
    case "startup":
      return "/dashboard/startup";
    case "gov":
      return "/dashboard/gov";
    case "evaluator":
      return "/dashboard/evaluator";
    case "admin":
      return "/dashboard/admin";
    default:
      return "/login";
  }
}

export const ROLE_LABELS: Record<Role, string> = {
  startup: "Startup",
  gov: "Department",
  evaluator: "Evaluator",
  admin: "Administrator",
};

/** Read the role cookie in the browser. Server code should use `cookies()` instead. */
export function readRoleCookie(): Role | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|; )demo_role=([^;]*)/);
  const value = match ? decodeURIComponent(match[1] ?? "") : "";
  return isRole(value) ? value : null;
}

export function writeRoleCookie(role: Role) {
  document.cookie = `demo_role=${role}; path=/; max-age=86400; samesite=lax`;
}
