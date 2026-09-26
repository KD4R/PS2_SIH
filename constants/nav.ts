import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  Gavel,
  FileBarChart,
  LineChart,
  Presentation,
  FileText,
  HeartPulse,
  History,
  KanbanSquare,
  Settings,
  Compass,
  ScrollText,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Short badge, e.g. a live meeting count — populated from data later. */
  badgeKey?: "activeMeetings" | "pendingReports";
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

/**
 * Primary sidebar structure, grouped to match the PRD's information
 * architecture. Hrefs are declared now so `Sidebar`/`Navbar` can render
 * active states even before every route has a page behind it.
 */
export const primaryNavFounder: NavSection[] = [
  {
    label: "Pilot Procurement",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Marketplace", href: "/marketplace", icon: Compass },
      { label: "My Proposals", href: "/my-proposals", icon: FileText, badgeKey: "activeMeetings" },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { label: "Boardroom", href: "/boardroom", icon: Gavel },
      { label: "Reports", href: "/reports", icon: FileBarChart, badgeKey: "pendingReports" },
      { label: "Market research", href: "/market-research", icon: LineChart },
    ],
  },
  {
    label: "Studio",
    items: [
      { label: "Executives", href: "/executives", icon: Users },
      { label: "Pitch deck", href: "/pitch-deck", icon: Presentation },
    ],
  },
];

export const primaryNavOfficer: NavSection[] = [
  {
    label: "Procurement Management",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "My Challenges", href: "/challenges", icon: Compass },
    ],
  },
  {
    label: "Evaluation",
    items: [
      { label: "Boardroom", href: "/boardroom", icon: Gavel, badgeKey: "activeMeetings" },
      { label: "Reports", href: "/reports", icon: FileBarChart, badgeKey: "pendingReports" },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Evaluators", href: "/executives", icon: Users },
    ],
  },
];


export const secondaryNav: NavItem[] = [{ label: "Settings", href: "/settings", icon: Settings }];
