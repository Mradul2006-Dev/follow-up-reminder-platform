"use client";

import { useMemo, useState } from "react";
import { useSearch } from "@/components/layout/search";
import { PatientTable } from "@/components/patients/PatientTable";
import { Button } from "@/components/ui/Button";
import { FilterTabs } from "@/components/ui/FilterTabs";
import { TableFooter, usePagination } from "@/components/ui/Pagination";
import { useModals } from "@/components/modals/ModalsProvider";
import { MOCK_TODAY } from "@/lib/date";
import { compareFollowUps, patientMatches } from "@/lib/followups";
import { useStore } from "@/lib/store/store";
import type { FollowUp } from "@/lib/types";

type Filter = "all" | "opted-in" | "no-consent";

export default function PatientsPage() {
  const { patients, followUps } = useStore();
  const { query } = useSearch();
  const { openAddPatient } = useModals();
  const [filter, setFilter] = useState<Filter>("all");

  const counts = useMemo(() => {
    const optedIn = patients.filter((p) => p.whatsappOptIn).length;
    return { all: patients.length, optedIn, noConsent: patients.length - optedIn };
  }, [patients]);

  /** Earliest open (not visited/missed) follow-up from today onward, per patient. */
  const nextByPatient = useMemo(() => {
    const map = new Map<string, FollowUp>();
    for (const f of [...followUps].sort(compareFollowUps)) {
      if (f.date < MOCK_TODAY || f.status === "visited" || f.status === "missed") continue;
      if (!map.has(f.patientId)) map.set(f.patientId, f);
    }
    return map;
  }, [followUps]);

  const filtered = useMemo(
    () =>
      patients
        .filter((p) => (filter === "all" ? true : filter === "opted-in" ? p.whatsappOptIn : !p.whatsappOptIn))
        .filter((p) => patientMatches(p, query))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt) || a.name.localeCompare(b.name)),
    [patients, filter, query],
  );

  const { page, setPage, pageCount, pageItems } = usePagination(filtered, 10, `${filter}|${query}`);

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden flex flex-col">
      <div className="p-5 border-b border-slate-100 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-base font-bold text-slate-900 tracking-tight">All Patients</h2>
          <p className="text-xs text-slate-500 mt-0.5">Contact details and WhatsApp consent for every patient on file.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <FilterTabs<Filter>
            ariaLabel="Filter patients"
            value={filter}
            onChange={setFilter}
            tabs={[
              { value: "all", label: "All", count: counts.all },
              { value: "opted-in", label: "Opted in", count: counts.optedIn },
              { value: "no-consent", label: "No consent", count: counts.noConsent },
            ]}
          />
          <Button icon="person_add" onClick={openAddPatient}>
            Add Patient
          </Button>
        </div>
      </div>

      <PatientTable patients={pageItems} nextByPatient={nextByPatient} />

      <TableFooter shown={pageItems.length} total={filtered.length} noun="patients" page={page} pageCount={pageCount} onChange={setPage} />
    </div>
  );
}
