import type { ReactNode } from "react";
import { Icon } from "./Icon";

interface StatCardProps {
  label: string;
  value: string;
  /** Tailwind classes for the value text (defaults to slate-900). */
  valueClass?: string;
  icon: string;
  /** Tailwind classes for the icon tile. */
  iconClass: string;
  footer: ReactNode;
}

export function StatCard({ label, value, valueClass = "text-slate-900", icon, iconClass, footer }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200/70 shadow-none flex flex-col justify-between hover:border-slate-300 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <span className="text-xs font-medium text-slate-500">{label}</span>
          <span className={`font-display text-2xl font-bold tracking-tight mt-1.5 tabular-nums ${valueClass}`}>{value}</span>
        </div>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconClass}`}>
          <Icon name={icon} className="text-lg" />
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-500">{footer}</div>
    </div>
  );
}
