"use client";

import { addDays, formatDateLong, formatTime, MOCK_TODAY } from "@/lib/date";
import { compareFollowUps, type FollowUpRow } from "@/lib/followups";
import { FollowUpActions } from "@/components/follow-ups/FollowUpActions";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { FollowUpStatus } from "@/lib/types";

const DOT: Record<FollowUpStatus, string> = {
  confirmed: "border-emerald-500",
  scheduled: "border-blue-500",
  visited: "border-slate-400",
  missed: "border-rose-500",
};

function dateLabel(date: string): string {
  const long = formatDateLong(date);
  if (date === MOCK_TODAY) return `Today · ${long}`;
  if (date === addDays(MOCK_TODAY, 1)) return `Tomorrow · ${long}`;
  return long;
}

function Entry({ row }: { row: FollowUpRow }) {
  const { followUp } = row;
  return (
    <li className="relative pl-6 pb-6 last:pb-0">
      <span className={`absolute -left-[7px] top-1 h-3.5 w-3.5 rounded-full bg-white border-2 ${DOT[followUp.status]}`} aria-hidden="true" />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-900">{followUp.protocol}</p>
          <p className="text-[11px] text-slate-500 mt-0.5 tabular-nums">
            {dateLabel(followUp.date)} · {formatTime(followUp.time)}
          </p>
          <p className="text-[11px] text-slate-500">
            {followUp.provider} · {followUp.department}
          </p>
        </div>
        <StatusBadge status={followUp.status} />
      </div>

      {followUp.status === "visited" && followUp.loggedAt && (
        <p className="text-[11px] text-emerald-600 font-medium mt-1">Logged {formatTime(followUp.loggedAt)}</p>
      )}
      {followUp.status === "missed" && (
        <p className="text-[11px] text-rose-500 mt-1">No show (+{followUp.noShowMinutes ?? 0}m)</p>
      )}
      {followUp.notes && (
        <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 border border-slate-100 rounded-lg p-2.5 mt-2">{followUp.notes}</p>
      )}
      <div className="mt-2.5">
        <FollowUpActions row={row} />
      </div>
    </li>
  );
}

function Group({ label, rows }: { label: string; rows: FollowUpRow[] }) {
  if (rows.length === 0) return null;
  return (
    <div>
      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-3">
        {label} ({rows.length})
      </h3>
      <ol className="border-l border-slate-200 ml-[7px]">
        {rows.map((row) => (
          <Entry key={row.followUp.id} row={row} />
        ))}
      </ol>
    </div>
  );
}

/** Upcoming follow-ups (soonest first) followed by previous visits (newest first). */
export function VisitTimeline({ rows }: { rows: FollowUpRow[] }) {
  const upcoming = rows
    .filter(({ followUp: f }) => f.date >= MOCK_TODAY && (f.status === "scheduled" || f.status === "confirmed"))
    .sort((a, b) => compareFollowUps(a.followUp, b.followUp));
  const previous = rows
    .filter((r) => !upcoming.includes(r))
    .sort((a, b) => compareFollowUps(b.followUp, a.followUp));

  return (
    <Card title="Visits & follow-ups" icon="timeline" action={<span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{rows.length} total</span>}>
      {rows.length === 0 ? (
        <EmptyState icon="event_busy" title="No visits yet" hint="Schedule a follow-up to start this patient's timeline." />
      ) : (
        <div className="flex flex-col gap-6">
          <Group label="Upcoming" rows={upcoming} />
          <Group label="Previous visits" rows={previous} />
        </div>
      )}
    </Card>
  );
}
