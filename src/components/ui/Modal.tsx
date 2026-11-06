"use client";

import { useEffect, type ReactNode } from "react";
import { Icon } from "./Icon";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  /** Tailwind max-width class. */
  widthClass?: string;
}

export function Modal({ open, onClose, title, description, children, footer, widthClass = "sm:max-w-lg" }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-slate-900/45 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative w-full ${widthClass} max-h-[92vh] flex flex-col bg-white rounded-t-2xl sm:rounded-2xl border border-slate-200 shadow-xl`}
      >
        <div className="flex items-start justify-between gap-4 p-5 border-b border-slate-100">
          <div>
            <h2 className="font-display text-base font-bold text-slate-900 tracking-tight">{title}</h2>
            {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="h-8 w-8 -mr-2 -mt-1 rounded-md hover:bg-slate-100 text-slate-500 flex items-center justify-center"
          >
            <Icon name="close" className="text-lg" />
          </button>
        </div>
        <div className="p-5 overflow-y-auto">{children}</div>
        {footer && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/60 rounded-b-2xl flex items-center justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
