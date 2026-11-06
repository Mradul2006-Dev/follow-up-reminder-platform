"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { Icon } from "./Icon";

type Tone = "success" | "error" | "info";
interface ToastItem {
  id: number;
  message: string;
  tone: Tone;
}

interface ToastApi {
  toast: (message: string, tone?: Tone) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

const TONE_STYLES: Record<Tone, { icon: string; cls: string }> = {
  success: { icon: "check_circle", cls: "text-emerald-600" },
  error: { icon: "error", cls: "text-rose-600" },
  info: { icon: "info", cls: "text-blue-600" },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string, tone: Tone = "success") => {
    const id = Date.now() + Math.random();
    setItems((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  const api = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        className="fixed bottom-20 md:bottom-6 right-4 left-4 sm:left-auto z-[70] flex flex-col gap-2 items-end pointer-events-none"
        role="status"
        aria-live="polite"
      >
        {items.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex items-center gap-2 bg-slate-900 text-white text-xs font-medium pl-3 pr-4 py-2.5 rounded-lg shadow-lg max-w-sm"
          >
            <Icon name={TONE_STYLES[t.tone].icon} filled className={`text-lg ${TONE_STYLES[t.tone].cls}`} />
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
