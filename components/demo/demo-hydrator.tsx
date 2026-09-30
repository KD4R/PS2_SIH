"use client";

import { useEffect } from "react";
import { useDemoStore } from "@/lib/demo/store";
import { DEMO_MODE } from "@/lib/demo/config";

/**
 * Rehydrates the persisted demo store after mount (skipHydration: true keeps
 * SSR output and the first client render identical). Also honours `?reset=1`.
 */
export function DemoHydrator() {
  useEffect(() => {
    if (!DEMO_MODE) return;
    const url = new URL(window.location.href);
    if (url.searchParams.get("reset") === "1") {
      useDemoStore.persist.clearStorage();
      url.searchParams.delete("reset");
      window.history.replaceState(null, "", url.toString());
    }
    useDemoStore.persist.rehydrate();
    useDemoStore.getState().setHydrated(true);
  }, []);

  return null;
}
