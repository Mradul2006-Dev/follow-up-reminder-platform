"use client";

import { STATUS_META } from "@/lib/constants";
import { formatDayLabel, formatTime } from "@/lib/date";
import type { FollowUpRow } from "@/lib/followups";
import { Avatar } from "../ui/Avatar";
import { EmptyState } from "../ui/EmptyState";
import { StatusBadge } from "../ui/StatusBadge";
import { FollowUpActions } from "./FollowUpActions";

interface Props {
  rows: FollowUpRow[];
  /** Slot numbers for today's schedule. */
  slots?: Record<string, number>;
  /** Adds a Date column (used on the Follow-ups page). */
  showDate?: boolean;
  emptyTitle?: string;
  emptyHint?: string;
}

function PatientCell({ row }: { row: FollowUpRow }) {
  return (
    <div className="flex items-center gap-3">
      <Avatar name={row.patient.name} tone={STATUS_META[row.followUp.status].avatar} />
      <div className="flex flex-col min-w-0">
        <span className="font-semibold text-slate-900 truncate">{row.patient.name}</span>
        <span className="text-[11px] text-slate-400 font-mono tabular-nums">{row.patient.mrn}</span>
      </div>
    </div>
  );
}

function TimeCell({ row, slots, showDate }: { row: FollowUpRow; slots?: Record<string, number>; showDate?: boolean }) {
  const { followUp } = row;
  const missed = followUp.status === "missed";
  let sub: React.ReactNode;
  if (followUp.status === "visited" && followUp.loggedAt) {
    sub = <span className="block text-[11px] text-emerald-600 font-medium">Logged {formatTime(followUp.loggedAt)}</span>;
  } else if (missed) {
    sub = <span className="block text-[11px] text-rose-500">No Show (+{followUp.noShowMinutes ?? 0}m)</span>;
  } else if (!showDate && slots?.[followUp.id]) {
    sub = <span className="block text-[11px] text-slate-400">Slot #{slots[followUp.id]}</span>;
  }
  return (
    <>
      <span className={`font-semibold tabular-nums ${missed ? "text-rose-600" : "text-slate-900"}`}>{formatTime(followUp.time)}</span>
      {sub}
    </>
  );
}

function ProtocolCell({ row }: { row: FollowUpRow }) {
  return (
    <>
      <span className="font-medium text-slate-900 block truncate">{row.followUp.protocol}</span>
      <span className="text-[11px] text-slate-500">{row.followUp.provider}</span>
    </>
  );
}

export function FollowUpTable({ rows, slots, showDate, emptyTitle = "No follow-ups found", emptyHint }: Props) {
  if (rows.length === 0) {
    return <EmptyState title={emptyTitle} hint={emptyHint ?? "Try a different filter or search term."} />;
  }

  return (
    <>
      {/* Tablet / desktop: table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-semibold">
              <th className="py-3 px-4">Patient &amp; MRN</th>
              {showDate && <th className="py-3 px-3">Date</th>}
              <th className="py-3 px-3">Scheduled</th>
              <th className="py-3 px-3">Visit Protocol</th>
              <th className="py-3 px-3">WhatsApp Status</th>
              <th className="py-3 px-4 text-right">Quick Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-normal text-slate-700">
            {rows.map((row) => (
              <tr key={row.followUp.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3.5 px-4">
                  <PatientCell row={row} />
                </td>
                {showDate && (
                  <td className="py-3.5 px-3 whitespace-nowrap font-medium text-slate-700">{formatDayLabel(row.followUp.date)}</td>
                )}
                <td className="py-3.5 px-3 whitespace-nowrap">
                  <TimeCell row={row} slots={slots} showDate={showDate} />
                </td>
                <td className="py-3.5 px-3 max-w-[150px]">
                  <ProtocolCell row={row} />
                </td>
                <td className="py-3.5 px-3 whitespace-nowrap">
                  <StatusBadge status={row.followUp.status} />
                </td>
                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                  <FollowUpActions row={row} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Phone: card list */}
      <ul className="md:hidden divide-y divide-slate-100">
        {rows.map((row) => (
          <li key={row.followUp.id} className="p-4 flex flex-col gap-3 text-xs">
            <div className="flex items-start justify-between gap-3">
              <PatientCell row={row} />
              <StatusBadge status={row.followUp.status} />
            </div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <ProtocolCell row={row} />
              </div>
              <div className="text-right whitespace-nowrap">
                {showDate && <span className="block text-[11px] text-slate-500">{formatDayLabel(row.followUp.date)}</span>}
                <TimeCell row={row} slots={slots} showDate={showDate} />
              </div>
            </div>
            <div className="flex justify-end">
              <FollowUpActions row={row} />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
