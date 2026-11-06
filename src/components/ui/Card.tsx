import type { ReactNode } from "react";
import { Icon } from "./Icon";

interface CardProps {
  title: string;
  icon?: string;
  /** Right-aligned header content (a count, a button). */
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** Titled white card, same look as the "Upcoming Follow-ups" card on the dashboard. */
export function Card({ title, icon, action, children, className = "" }: CardProps) {
  return (
    <section className={`bg-white rounded-xl border border-slate-200/80 ${className}`}>
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2 min-w-0">
          {icon && <Icon name={icon} className="text-teal-600 text-xl" />}
          <h2 className="font-display text-sm font-bold text-slate-900 tracking-tight">{title}</h2>
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

/** Label / value row inside a <dl>. */
export function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 text-xs">
      <dt className="text-slate-500 flex-shrink-0">{label}</dt>
      <dd className="text-slate-900 font-medium text-right break-words min-w-0">{children}</dd>
    </div>
  );
}

export function SectionSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="animate-pulse flex flex-col gap-3" role="status" aria-label="Loading">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`h-3 rounded bg-slate-100 ${i % 2 ? "w-2/3" : "w-full"}`} />
      ))}
    </div>
  );
}
