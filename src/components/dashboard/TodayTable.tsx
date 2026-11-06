"use client";

import { useMemo } from "react";
import { rowMatches, type FollowUpRow } from "@/lib/followups";
import { FollowUpTable } from "../follow-ups/FollowUpTable";
import { FilterTabs } from "../ui/FilterTabs";
import { TableFooter, usePagination } from "../ui/Pagination";

export type TodayFilter = "all" | "confirmed" | "pending" | "missed";

interface Props {
  /** All of today's follow-ups, sorted by time. */
  rows: FollowUpRow[];
  slots: Record<string, number>;
  filter: TodayFilter;
  onFilterChange: (f: TodayFilter) => void;
  query: string;
}

const PAGE_SIZE = 5;

/** Confirmed includes visited: a visited patient had confirmed first, so the tab counts add up to All. */
const FILTERS: Record<TodayFilter, (r: FollowUpRow) => boolean> = {
  all: () => true,
  confirmed: (r) => r.followUp.status === "confirmed" || r.followUp.status === "visited",
  pending: (r) => r.followUp.status === "scheduled",
  missed: (r) => r.followUp.status === "missed",
};

export function TodayTable({ rows, slots, filter, onFilterChange, query }: Props) {
  const counts = useMemo(
    () => ({
      all: rows.length,
      confirmed: rows.filter(FILTERS.confirmed).length,
      pending: rows.filter(FILTERS.pending).length,
      missed: rows.filter(FILTERS.missed).length,
    }),
    [rows],
  );

  const filtered = useMemo(() => rows.filter((r) => FILTERS[filter](r) && rowMatches(r, query)), [rows, filter, query]);
  const { page, setPage, pageCount, pageItems } = usePagination(filtered, PAGE_SIZE, `${filter}|${query}`);

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden flex flex-col">
      <div className="p-5 border-b border-slate-100 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-base font-bold text-slate-900 tracking-tight">Today&apos;s Follow-up Consultations</h2>
          <p className="text-xs text-slate-500 mt-0.5">Automated 24h &amp; 2h reminders with direct response syncing.</p>
        </div>
        <FilterTabs
          ariaLabel="Filter today's follow-ups"
          value={filter}
          onChange={onFilterChange}
          tabs={[
            { value: "all", label: "All", count: counts.all },
            { value: "confirmed", label: "Confirmed", count: counts.confirmed },
            { value: "pending", label: "Pending", count: counts.pending },
            { value: "missed", label: "Missed", count: counts.missed },
          ]}
        />
      </div>

      <FollowUpTable
        rows={pageItems}
        slots={slots}
        emptyTitle="No follow-ups match"
        emptyHint={query ? `Nothing today matches "${query}".` : "Nothing in this category today."}
      />

      <TableFooter
        shown={pageItems.length}
        total={filtered.length}
        noun={filter === "all" && !query ? "patients scheduled today" : "matching follow-ups today"}
        page={page}
        pageCount={pageCount}
        onChange={setPage}
      />
    </div>
  );
}
