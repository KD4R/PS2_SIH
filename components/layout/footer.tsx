"use client";

import Link from "next/link";
import { Gavel, ArrowUpRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative mt-auto">
      <div className="relative z-10 container">
        {/* Bottom Bar */}
        <div className="py-6 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} GovProcure AI. All rights reserved.
          </p>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/public" className="transition-colors hover:text-foreground">
              Public Portal
            </Link>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
