import Link from "next/link";
import { Gavel, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-6 bg-muted/30 px-6 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Gavel className="size-6" />
      </span>
      <div className="space-y-2">
        <p className="font-mono text-sm text-muted-foreground">404</p>
        <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">This page could not be found</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          The link may be outdated, or the page has moved within the procurement workspace.
        </p>
      </div>
      <Button asChild>
        <Link href="/dashboard">
          <ArrowLeft className="size-4" />
          Back to dashboard
        </Link>
      </Button>
    </div>
  );
}
