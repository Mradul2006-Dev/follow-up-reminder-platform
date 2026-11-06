import Link from "next/link";
import { formatDateTime, MOCK_TODAY, addDays } from "@/lib/date";
import { reminderLabel, type FollowUpRow } from "@/lib/followups";
import { Icon } from "../ui/Icon";

export function UpcomingList({ rows, total }: { rows: FollowUpRow[]; total: number }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 flex flex-col">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Icon name="event_upcoming" className="text-teal-600 text-xl" />
          <h3 className="font-display text-sm font-bold text-slate-900 tracking-tight">Upcoming Follow-ups</h3>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{total} queued</span>
      </div>

      <div className="divide-y divide-slate-100 flex flex-col">
        {rows.length === 0 && <p className="py-6 text-xs text-slate-500 text-center">Nothing queued for the next 7 days.</p>}
        {rows.map(({ followUp, patient }) => {
          const label = reminderLabel(followUp, patient);
          const soon = followUp.date === addDays(MOCK_TODAY, 1);
          return (
            <div key={followUp.id} className="py-3.5 first:pt-3 flex flex-col gap-1.5 group">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-900 group-hover:text-teal-700 transition-colors truncate">
                  {patient.name}
                </span>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded whitespace-nowrap tabular-nums ${
                    soon
                      ? "font-semibold text-teal-700 bg-teal-50 border border-teal-200/50"
                      : "font-medium text-slate-600 bg-slate-100"
                  }`}
                >
                  {formatDateTime(followUp.date, followUp.time)}
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-snug">
                {followUp.protocol} • {followUp.department}
              </p>
              <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
                {label.kind === "trigger" ? (
                  <span className="flex items-center gap-1 text-slate-600 font-medium">
                    <Icon name="mark_chat_read" className="text-xs text-whatsapp" />
                    {label.text}
                  </span>
                ) : (
                  <span className={`flex items-center gap-1 ${label.kind === "off" ? "text-amber-700" : "text-slate-500"}`}>
                    <Icon name={label.kind === "off" ? "block" : "schedule"} className="text-xs text-slate-400" />
                    {label.text}
                  </span>
                )}
                <span className="text-slate-400 font-mono tabular-nums">{patient.mrn}</span>
              </div>
            </div>
          );
        })}
      </div>

      <Link
        href="/follow-ups?tab=upcoming"
        className="mt-2 pt-3 border-t border-slate-100 flex items-center justify-center gap-1 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors"
      >
        <span>View All Upcoming</span>
        <Icon name="arrow_forward" className="text-sm" />
      </Link>
    </div>
  );
}
