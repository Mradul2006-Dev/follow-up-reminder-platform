"use client";

import { useMemo, useState } from "react";
import { AutomationCard } from "@/components/dashboard/AutomationCard";
import { TodayTable, type TodayFilter } from "@/components/dashboard/TodayTable";
import { UpcomingList } from "@/components/dashboard/UpcomingList";
import { useSearch } from "@/components/layout/search";
import { Icon } from "@/components/ui/Icon";
import { StatCard } from "@/components/ui/StatCard";
import { addDays, MOCK_TODAY } from "@/lib/date";
import { compareFollowUps, computeSlots, toRows } from "@/lib/followups";
import { useStore } from "@/lib/store/store";

export default function DashboardPage() {
  const { followUps, patientsById, stats, settings } = useStore();
  const { query } = useSearch();
  const [filter, setFilter] = useState<TodayFilter>("all");

  const today = useMemo(() => followUps.filter((f) => f.date === MOCK_TODAY).sort(compareFollowUps), [followUps]);
  const slots = useMemo(() => computeSlots(today), [today]);
  const todayRows = useMemo(() => toRows(today, patientsById), [today, patientsById]);

  const upcomingRows = useMemo(() => {
    const end = addDays(MOCK_TODAY, 7);
    const list = followUps.filter((f) => f.date > MOCK_TODAY && f.date <= end).sort(compareFollowUps);
    return toRows(list.slice(0, 4), patientsById);
  }, [followUps, patientsById]);

  return (
    <>
      {/* Stat cards: every number is derived from the data below */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Summary">
        <StatCard
          label="Total Patients"
          value={stats.totalPatients.toLocaleString("en-US")}
          icon="group"
          iconClass="bg-slate-100 text-slate-700"
          footer={
            <>
              <span className="inline-flex items-center text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                <Icon name="trending_up" className="text-xs mr-0.5" />+{stats.growthPct}%
              </span>
              <span className="text-slate-500 font-normal">this month</span>
            </>
          }
        />
        <StatCard
          label="Today's Follow-ups"
          value={String(stats.todayTotal)}
          icon="today"
          iconClass="bg-teal-50 text-teal-700 border border-teal-100/50"
          footer={
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-whatsapp inline-block" />
              <span className="font-medium text-slate-700">{stats.todayConfirmed} confirmed</span>
              <span>via WhatsApp</span>
            </>
          }
        />
        <StatCard
          label="Upcoming (7 Days)"
          value={String(stats.upcomingCount)}
          icon="schedule"
          iconClass="bg-blue-50 text-blue-700 border border-blue-100/50"
          footer={
            <>
              <span className="font-medium text-slate-700">Cadence scheduled</span>
              <span>• Auto triggers</span>
            </>
          }
        />
        <StatCard
          label="Missed Follow-ups"
          value={String(stats.missedCount).padStart(2, "0")}
          valueClass="text-rose-600"
          icon="notification_important"
          iconClass="bg-rose-50 text-rose-600 border border-rose-100/50"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="inline-flex items-center text-rose-700 font-semibold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">
                Requires action
              </span>
              <button
                type="button"
                onClick={() => setFilter("missed")}
                className="text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                Review
              </button>
            </div>
          }
        />
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-6 items-start">
        <TodayTable rows={todayRows} slots={slots} filter={filter} onFilterChange={setFilter} query={query} />
        <div className="flex flex-col gap-4">
          <UpcomingList rows={upcomingRows} total={stats.upcomingCount} />
          <AutomationCard enabled={settings.whatsapp.enabled} />
        </div>
      </div>
    </>
  );
}
