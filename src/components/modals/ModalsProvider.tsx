"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { FollowUp, Patient } from "@/lib/types";
import { AddPatientModal } from "./AddPatientModal";
import { ScheduleFollowUpModal } from "./ScheduleFollowUpModal";
import { VisitSummaryModal } from "./VisitSummaryModal";

export interface ScheduleOptions {
  /** Preselect a patient. */
  patientId?: string;
  /** Prefill the protocol (used by "Re-engage"). */
  protocol?: string;
  /** When set, the modal edits this follow-up instead of creating one. */
  followUp?: FollowUp;
}

interface ModalsApi {
  openAddPatient: () => void;
  openSchedule: (options?: ScheduleOptions) => void;
  openSummary: (followUp: FollowUp, patient: Patient) => void;
}

const ModalsContext = createContext<ModalsApi | null>(null);

export function ModalsProvider({ children }: { children: ReactNode }) {
  const [addPatientOpen, setAddPatientOpen] = useState(false);
  const [schedule, setSchedule] = useState<{ options: ScheduleOptions; key: number } | null>(null);
  const [summary, setSummary] = useState<{ followUp: FollowUp; patient: Patient } | null>(null);

  const openAddPatient = useCallback(() => setAddPatientOpen(true), []);
  const openSchedule = useCallback(
    (options: ScheduleOptions = {}) => setSchedule({ options, key: Date.now() }),
    [],
  );
  const openSummary = useCallback((followUp: FollowUp, patient: Patient) => setSummary({ followUp, patient }), []);

  const api = useMemo(() => ({ openAddPatient, openSchedule, openSummary }), [openAddPatient, openSchedule, openSummary]);

  return (
    <ModalsContext.Provider value={api}>
      {children}
      {addPatientOpen && (
        <AddPatientModal
          onClose={() => setAddPatientOpen(false)}
          onAddedAndSchedule={(patient) => {
            setAddPatientOpen(false);
            openSchedule({ patientId: patient.id });
          }}
        />
      )}
      {schedule && <ScheduleFollowUpModal key={schedule.key} options={schedule.options} onClose={() => setSchedule(null)} />}
      {summary && <VisitSummaryModal {...summary} onClose={() => setSummary(null)} />}
    </ModalsContext.Provider>
  );
}

export function useModals(): ModalsApi {
  const ctx = useContext(ModalsContext);
  if (!ctx) throw new Error("useModals must be used within ModalsProvider");
  return ctx;
}
