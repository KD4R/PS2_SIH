"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Gavel, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { name: "Features", href: "#features" },
  { name: "How it works", href: "#how-it-works" },
  { name: "Pricing", href: "#pricing" },
  { name: "Metrics", href: "#faq" },
];

/**
 * Top nav for unauthenticated marketing pages. Floats on scroll to become a
 * pill-shaped glass navbar. Full-screen mobile overlay for small screens.
 */
export function MarketingNavbar({ className }: { className?: string }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed z-50 transition-all duration-500",
        isScrolled ? "top-4 left-4 right-4" : "top-0 left-0 right-0",
        className
      )}
    >
      <nav
        className={cn(
          "mx-auto transition-all duration-500",
          isScrolled || isMobileMenuOpen
            ? "glass rounded-2xl shadow-lg max-w-5xl"
            : "bg-transparent max-w-7xl"
        )}
      >
        <div
          className={cn(
            "flex items-center justify-between transition-all duration-500 px-6 lg:px-8",
            isScrolled ? "h-14" : "h-20"
          )}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span
              className={cn(
                "flex items-center justify-center rounded-lg bg-primary text-primary-foreground transition-all duration-500",
                isScrolled ? "size-7" : "size-8"
              )}
            >
              <Gavel className="size-4" />
            </span>
            <span
              className={cn(
                "font-display tracking-tight transition-all duration-500",
                isScrolled ? "text-lg" : "text-xl"
              )}
            >
              GovProcure AI
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-12">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300 relative group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-primary transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/login"
              className={cn(
                "text-muted-foreground hover:text-foreground transition-all duration-500",
                isScrolled ? "text-xs" : "text-sm"
              )}
            >
              Sign in
            </Link>
            <Button
              size="sm"
              className={cn(
                "rounded-xl transition-all duration-500",
                isScrolled ? "px-4 h-8 text-xs" : "px-6"
              )}
              asChild
            >
              <Link href="/login?next=/meeting/new">Get started</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu - Full Screen Overlay */}
      <div
        className={cn(
          "md:hidden fixed inset-0 bg-background z-40 transition-all duration-500",
          isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        style={{ top: 0 }}
      >
        <div className="flex flex-col h-full px-8 pt-28 pb-8">
          {/* Navigation Links */}
          <div className="flex-1 flex flex-col justify-center gap-8">
            {navLinks.map((link, i) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "text-5xl font-display text-foreground hover:text-muted-foreground transition-all duration-500",
                  isMobileMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                )}
                style={{ transitionDelay: isMobileMenuOpen ? `${i * 75}ms` : "0ms" }}
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Bottom CTAs */}
          <div
            className={cn(
              "flex gap-4 pt-8 border-t border-border transition-all duration-500",
              isMobileMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
            style={{ transitionDelay: isMobileMenuOpen ? "300ms" : "0ms" }}
          >
            <Button
              variant="secondary"
              className="flex-1 rounded-xl h-14 text-base"
              onClick={() => setIsMobileMenuOpen(false)}
              asChild
            >
              <Link href="/login">Sign in</Link>
            </Button>
            <Button
              className="flex-1 rounded-xl h-14 text-base"
              onClick={() => setIsMobileMenuOpen(false)}
              asChild
            >
              <Link href="/login?next=/meeting/new">Get started</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
