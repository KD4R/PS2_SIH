import type { Metadata } from "next";
import { fontVariables } from "@/lib/fonts";
import { AppProviders } from "@/providers/app-providers";
import { DemoHydrator } from "@/components/demo/demo-hydrator";
import { DemoBar } from "@/components/demo/demo-bar";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "GovProcure AI",
    template: "%s · GovProcure AI",
  },
  description:
    "Startup-friendly public procurement: discover challenges, get AI-assisted evaluation, run milestone-based pilots, and scale to procurement.",
};

/**
 * Root layout. Intentionally minimal: fonts + providers only. No shell
 * chrome (Sidebar/Navbar) lives here yet, since that composition depends on
 * which route group a page belongs to (marketing vs. app) — that decision
 * is made when pages are built, not here.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${fontVariables}`} suppressHydrationWarning>
      <body>
        <AppProviders>
          <DemoHydrator />
          {children}
          <DemoBar />
        </AppProviders>
      </body>
    </html>
  );
}
