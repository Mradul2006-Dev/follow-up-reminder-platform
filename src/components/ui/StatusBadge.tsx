import { STATUS_META } from "@/lib/constants";
import type { FollowUpStatus } from "@/lib/types";
import { Icon } from "./Icon";

const DOT: Record<FollowUpStatus, string> = {
  confirmed: "bg-emerald-500",
  scheduled: "bg-blue-500",
  missed: "bg-rose-500",
  visited: "",
};

export function StatusBadge({ status }: { status: FollowUpStatus }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${meta.pill}`}
    >
      {status === "visited" ? (
        <Icon name="done" className="text-xs" />
      ) : (
        <span className={`w-1.5 h-1.5 rounded-full ${DOT[status]}`} />
      )}
      {meta.label}
    </span>
  );
}

/** Generic pill for non-status labels (consent, counts). */
export function Pill({
  tone,
  children,
  className = "",
}: {
  tone: "emerald" | "slate" | "amber" | "rose";
  children: React.ReactNode;
  className?: string;
}) {
  const tones = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
    slate: "bg-slate-100 text-slate-600 border-slate-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200/60",
    rose: "bg-rose-50 text-rose-700 border-rose-200/60",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
