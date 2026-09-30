"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

export type ToastTone = "success" | "info" | "warning" | "error";

interface ToastItem {
  id: number;
  text: string;
  tone: ToastTone;
}

interface ToastContextValue {
  toast: (text: string, tone?: ToastTone) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

let nextId = 1;

const TONE_STYLES: Record<ToastTone, string> = {
  success: "border-success/40 bg-card text-success",
  info: "border-primary/40 bg-card text-primary",
  warning: "border-warning/40 bg-card text-warning",
  error: "border-destructive/40 bg-card text-destructive",
};

const TONE_DOT: Record<ToastTone, string> = {
  success: "bg-success",
  info: "bg-primary",
  warning: "bg-warning",
  error: "bg-destructive",
};

/** Portal-free toaster mounted once in app/layout.tsx; auto-dismiss after 3s. */
export function DemoToaster({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const toast = useCallback((text: string, tone: ToastTone = "success") => {
    const id = nextId++;
    setItems((prev) => [...prev.slice(-3), { id, text, tone }]);
    setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 3000);
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-6 right-6 z-[100] flex w-80 flex-col gap-2">
        {items.map((item) => (
          <div
            key={item.id}
            className={`pointer-events-auto flex items-center gap-2.5 rounded-lg border px-4 py-3 text-sm font-medium shadow-lg animate-in fade-in slide-in-from-bottom-2 ${TONE_STYLES[item.tone]}`}
            role="status"
          >
            <span className={`h-2 w-2 shrink-0 rounded-full ${TONE_DOT[item.tone]}`} />
            <span className="text-foreground">{item.text}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/** Fire a toast from any component under DemoToaster. */
export function useToast() {
  return useContext(ToastContext);
}
