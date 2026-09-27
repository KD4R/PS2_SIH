import Link from "next/link";
import { Compass, FileBarChart, Users, Presentation, Gavel, FileText, FileEdit, Search } from "lucide-react";
import { Card } from "@/components/ui/card";

const startupActions = [
  { label: "Marketplace", description: "Browse open government challenges", href: "/marketplace", icon: Compass },
  { label: "My Proposals", description: "Track your active pilot proposals", href: "/my-proposals", icon: FileText },
];

const officerActions = [
  { label: "Draft New Challenge", description: "Post outcome-based problem statements", href: "/challenges/new", icon: FileEdit },
  { label: "Browse Startups", description: "Discover DPIIT verified startups", href: "/marketplace", icon: Search },
  { label: "Standard Templates", description: "IP/Data & sandbox agreements", href: "/templates", icon: FileText },
];

export function QuickActions({ role = "startup_founder" }: { role?: string }) {
  const actions = role === "department_officer" ? officerActions : startupActions;
  
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {actions.map((action) => (
        <Link key={action.href} href={action.href}>
          <Card interactive className="flex h-full flex-col gap-3 p-5">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary/12 text-primary">
              <action.icon className="size-4" />
            </span>
            <div>
              <p className="text-sm font-medium text-foreground">{action.label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{action.description}</p>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
