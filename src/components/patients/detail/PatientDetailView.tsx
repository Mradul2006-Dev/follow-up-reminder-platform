"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useModals } from "@/components/modals/ModalsProvider";
import { Button } from "@/components/ui/Button";
import { Card, SectionSkeleton } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { Pill } from "@/components/ui/StatusBadge";
import { GENDERS } from "@/lib/constants";
import { calcAge, formatDateTime, MOCK_TODAY } from "@/lib/date";
import { compareFollowUps, initials, toRows } from "@/lib/followups";
import { useStore } from "@/lib/store/store";
import { usePatientRecord } from "@/lib/store/usePatientRecord";
import { DoctorNotesCard } from "./DoctorNotesCard";
import { MedicalHistoryCard } from "./MedicalHistoryCard";
import { ContactConsentCard, PersonalInfoCard } from "./PatientInfoCards";
import { PrescriptionsCard } from "./PrescriptionsCard";
import { VisitTimeline } from "./VisitTimeline";

function BackLink() {
  return (
    <Link href="/patients" className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 self-start">
      <Icon name="arrow_back" className="text-base" />
      Patients
    </Link>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] font-medium text-slate-500">{label}</span>
      <span className="text-sm font-semibold text-slate-900 tabular-nums">{value}</span>
    </div>
  );
}

export function PatientDetailView({ patientId }: { patientId: string }) {
  const { patientsById, followUps } = useStore();
  const { openSchedule } = useModals();
  const patient = patientsById.get(patientId);
  const record = usePatientRecord(patientId);

  const rows = useMemo(
    () => toRows(followUps.filter((f) => f.patientId === patientId), patientsById),
    [followUps, patientId, patientsById],
  );

  const summary = useMemo(() => {
    const sorted = rows.map((r) => r.followUp).sort(compareFollowUps);
    const next = sorted.find((f) => f.date >= MOCK_TODAY && (f.status === "scheduled" || f.status === "confirmed"));
    return {
      visited: sorted.filter((f) => f.status === "visited").length,
      missed: sorted.filter((f) => f.status === "missed").length,
      next: next ? formatDateTime(next.date, next.time) : "None scheduled",
    };
  }, [rows]);

  if (!patient) {
    return (
      <div className="flex flex-col gap-4">
        <BackLink />
        <div className="bg-white rounded-xl border border-slate-200/80">
          <EmptyState
            icon="person_search"
            title="Patient not found"
            hint="This patient does not exist, or the demo data was reset by a page refresh."
          />
        </div>
      </div>
    );
  }

  const gender = GENDERS.find((g) => g.value === patient.gender && g.value !== "unspecified")?.label;
  const meta = [patient.dob ? `${calcAge(patient.dob)} yrs` : null, gender].filter(Boolean).join(" · ");

  return (
    <>
      <BackLink />

      {/* Header */}
      <section className="bg-white rounded-xl border border-slate-200/80 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div
              aria-hidden="true"
              className="w-12 h-12 rounded-full bg-teal-50 text-teal-800 border border-teal-200/50 font-display font-semibold text-base flex items-center justify-center flex-shrink-0"
            >
              {initials(patient.name)}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-xl font-bold text-slate-900 tracking-tight">{patient.name}</h2>
                {patient.whatsappOptIn ? (
                  <Pill tone="emerald">
                    <Icon name="mark_chat_read" className="text-xs text-whatsapp" /> Opted in
                  </Pill>
                ) : (
                  <Pill tone="slate">
                    <Icon name="block" className="text-xs" /> No consent
                  </Pill>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                <span className="font-mono tabular-nums">{patient.mrn}</span>
                {meta && ` · ${meta}`}
              </p>
            </div>
          </div>
          <Button icon="event_available" onClick={() => openSchedule({ patientId: patient.id })}>
            Schedule Follow-up
          </Button>
        </div>
        <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Stat label="Next follow-up" value={summary.next} />
          <Stat label="Visits completed" value={String(summary.visited)} />
          <Stat label="No-shows" value={String(summary.missed)} />
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-6 items-start">
        <div className="flex flex-col gap-6">
          <VisitTimeline rows={rows} />

          {record.status === "loading" && (
            <>
              <Card title="Medical history" icon="medical_information"><SectionSkeleton lines={4} /></Card>
              <Card title="Doctor's notes" icon="clinical_notes"><SectionSkeleton lines={4} /></Card>
              <Card title="Prescriptions" icon="medication"><SectionSkeleton lines={3} /></Card>
            </>
          )}
          {record.status === "error" && (
            <Card title="Clinical record" icon="medical_information">
              <EmptyState icon="cloud_off" title="Couldn't load the clinical record" hint="Check your connection and try again." />
              <div className="flex justify-center">
                <Button variant="secondary" icon="refresh" onClick={record.retry}>
                  Retry
                </Button>
              </div>
            </Card>
          )}
          {record.status === "ready" && !record.record && (
            <Card title="Clinical record" icon="medical_information">
              <EmptyState icon="folder_off" title="No clinical record yet" hint="History, notes and prescriptions will appear once they are recorded." />
            </Card>
          )}
          {record.status === "ready" && record.record && (
            <>
              <MedicalHistoryCard record={record.record} />
              <DoctorNotesCard notes={record.record.notes} />
              <PrescriptionsCard prescriptions={record.record.prescriptions} />
            </>
          )}
        </div>

        {/* On phones the personal details come first */}
        <div className="flex flex-col gap-6 order-first xl:order-none">
          <PersonalInfoCard patient={patient} bloodType={record.record?.bloodType} />
          <ContactConsentCard patient={patient} />
        </div>
      </div>
    </>
  );
}
