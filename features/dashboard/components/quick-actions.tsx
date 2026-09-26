import Link from "next/link";
import { Compass, FileBarChart, Users, Presentation, Gavel, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";

const startupActions = [
  { label: "Marketplace", description: "Browse open government challenges", href: "/marketplace", icon: Compass },
  { label: "My Proposals", description: "Track your active pilot proposals", href: "/my-proposals", icon: FileText },
  { label: "Reports", description: "Browse past AI boardroom reports", href: "/reports", icon: FileBarChart },
  { label: "Pitch deck", description: "Generate a founder-ready deck", href: "/pitch-deck", icon: Presentation },
];

const officerActions = [
  { label: "My Challenges", description: "Manage procurement challenges", href: "/challenges", icon: Compass },
  { label: "Boardroom", description: "Queue AI evaluation sessions", href: "/boardroom", icon: Gavel },
  { label: "Evaluators", description: "Manage your AI persona mix", href: "/executives", icon: Users },
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
