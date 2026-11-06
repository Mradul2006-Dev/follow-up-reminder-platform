"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MOCK_TODAY } from "@/lib/date";
import { compareFollowUps, computeSlots, rowMatches, toRows } from "@/lib/followups";
import { useStore } from "@/lib/store/store";
import type { FollowUpStatus } from "@/lib/types";
import { useSearch } from "../layout/search";
import { useModals } from "../modals/ModalsProvider";
import { Button } from "../ui/Button";
import { FilterTabs } from "../ui/FilterTabs";
import { Select } from "../ui/Field";
import { TableFooter, usePagination } from "../ui/Pagination";
import { FollowUpTable } from "./FollowUpTable";

type Range = "today" | "upcoming" | "past" | "all";
type StatusFilter = "all" | FollowUpStatus;

const RANGES: Range[] = ["today", "upcoming", "past", "all"];

export function FollowUpsView() {
  const { followUps, patientsById } = useStore();
  const { query } = useSearch();
  const { openSchedule } = useModals();
  const params = useSearchParams();

  const initial = params.get("tab");
  const [range, setRange] = useState<Range>(RANGES.includes(initial as Range) ? (initial as Range) : "today");
  const [status, setStatus] = useState<StatusFilter>("all");

  const inRange = useMemo(
    () => ({
      today: (d: string) => d === MOCK_TODAY,
      upcoming: (d: string) => d > MOCK_TODAY,
      past: (d: string) => d < MOCK_TODAY,
      all: () => true,
    }),
    [],
  );

  const counts = useMemo(
    () => ({
      today: followUps.filter((f) => inRange.today(f.date)).length,
      upcoming: followUps.filter((f) => inRange.upcoming(f.date)).length,
      past: followUps.filter((f) => inRange.past(f.date)).length,
      all: followUps.length,
    }),
    [followUps, inRange],
  );

  const todaySlots = useMemo(() => computeSlots(followUps.filter((f) => f.date === MOCK_TODAY)), [followUps]);

  const rows = useMemo(() => {
    const list = followUps.filter((f) => inRange[range](f.date) && (status === "all" || f.status === status));
    // Past reads newest-first; everything else chronological.
    list.sort((a, b) => (range === "past" ? compareFollowUps(b, a) : compareFollowUps(a, b)));
    return toRows(list, patientsById).filter((r) => rowMatches(r, query));
  }, [followUps, patientsById, range, status, query, inRange]);

  const { page, setPage, pageCount, pageItems } = usePagination(rows, 10, `${range}|${status}|${query}`);

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden flex flex-col">
      <div className="p-5 border-b border-slate-100 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-base font-bold text-slate-900 tracking-tight">Follow-ups</h2>
          <p className="text-xs text-slate-500 mt-0.5">Every scheduled, confirmed, visited and missed follow-up.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <FilterTabs<Range>
            ariaLabel="Date range"
            value={range}
            onChange={setRange}
            tabs={[
              { value: "today", label: "Today", count: counts.today },
              { value: "upcoming", label: "Upcoming", count: counts.upcoming },
              { value: "past", label: "Past", count: counts.past },
              { value: "all", label: "All", count: counts.all },
            ]}
          />
          <Select
            aria-label="Filter by status"
            className="!w-36"
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusFilter)}
          >
            <option value="all">All statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="confirmed">Confirmed</option>
            <option value="visited">Visited</option>
            <option value="missed">Missed</option>
          </Select>
          <Button icon="add" onClick={() => openSchedule()}>
            Schedule
          </Button>
        </div>
      </div>

      <FollowUpTable rows={pageItems} slots={todaySlots} showDate />

      <TableFooter shown={pageItems.length} total={rows.length} noun="follow-ups" page={page} pageCount={pageCount} onChange={setPage} />
    </div>
  );
}
