"use client";

import Link from "next/link";
import { formatDateTime } from "@/lib/date";
import type { FollowUp, Patient } from "@/lib/types";
import { useStore } from "@/lib/store/store";
import { useModals } from "../modals/ModalsProvider";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";
import { Dropdown } from "../ui/Dropdown";
import { EmptyState } from "../ui/EmptyState";
import { Icon } from "../ui/Icon";
import { Pill } from "../ui/StatusBadge";

interface Props {
  patients: Patient[];
  nextByPatient: Map<string, FollowUp>;
}

function ConsentPill({ optIn }: { optIn: boolean }) {
  return optIn ? (
    <Pill tone="emerald">
      <Icon name="mark_chat_read" className="text-xs text-whatsapp" /> Opted in
    </Pill>
  ) : (
    <Pill tone="slate">
      <Icon name="block" className="text-xs" /> No consent
    </Pill>
  );
}

function PatientCell({ patient }: { patient: Patient }) {
  return (
    <Link href={`/patients/${patient.id}`} aria-label={`Open ${patient.name}'s record`} className="group flex items-center gap-3">
      <Avatar name={patient.name} tone="bg-slate-100 text-slate-700 border-slate-200" />
      <div className="flex flex-col min-w-0">
        <span className="font-semibold text-slate-900 truncate group-hover:text-teal-700 transition-colors">{patient.name}</span>
        <span className="text-[11px] text-slate-400 font-mono tabular-nums">{patient.mrn}</span>
      </div>
    </Link>
  );
}

function PatientActions({ patient }: { patient: Patient }) {
  const { setPatientConsent } = useStore();
  const { openSchedule } = useModals();
  return (
    <div className="inline-flex items-center gap-1.5">
      <Button size="sm" variant="secondary" icon="event_available" onClick={() => openSchedule({ patientId: patient.id })}>
        Schedule
      </Button>
      <Dropdown
        items={[
          {
            label: patient.whatsappOptIn ? "Revoke WhatsApp consent" : "Record WhatsApp consent",
            icon: patient.whatsappOptIn ? "block" : "mark_chat_read",
            onSelect: () => void setPatientConsent(patient.id, !patient.whatsappOptIn),
          },
        ]}
      />
    </div>
  );
}

export function PatientTable({ patients, nextByPatient }: Props) {
  if (patients.length === 0) {
    return <EmptyState icon="person_search" title="No patients found" hint="Try a different filter or search term." />;
  }

  const nextLabel = (id: string) => {
    const next = nextByPatient.get(id);
    return next ? formatDateTime(next.date, next.time) : null;
  };

  return (
    <>
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-semibold">
              <th className="py-3 px-5">Patient &amp; MRN</th>
              <th className="py-3 px-4">WhatsApp Number</th>
              <th className="py-3 px-4">Next Follow-up</th>
              <th className="py-3 px-4">Reminders</th>
              <th className="py-3 px-5 text-right">Quick Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-normal text-slate-700">
            {patients.map((p) => {
              const next = nextByPatient.get(p.id);
              return (
                <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-5">
                    <PatientCell patient={p} />
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap font-mono tabular-nums text-slate-700">{p.phone}</td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {next ? (
                      <>
                        <span className="font-semibold text-slate-900 tabular-nums">{nextLabel(p.id)}</span>
                        <span className="block text-[11px] text-slate-500 truncate max-w-[200px]">{next.protocol}</span>
                      </>
                    ) : (
                      <span className="text-slate-400">None scheduled</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <ConsentPill optIn={p.whatsappOptIn} />
                  </td>
                  <td className="py-3.5 px-5 text-right whitespace-nowrap">
                    <PatientActions patient={p} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ul className="md:hidden divide-y divide-slate-100">
        {patients.map((p) => (
          <li key={p.id} className="p-4 flex flex-col gap-3 text-xs">
            <div className="flex items-start justify-between gap-3">
              <PatientCell patient={p} />
              <ConsentPill optIn={p.whatsappOptIn} />
            </div>
            <div className="flex items-center justify-between gap-3 text-[11px] text-slate-500">
              <span className="font-mono tabular-nums">{p.phone}</span>
              <span>{nextLabel(p.id) ?? "No follow-up scheduled"}</span>
            </div>
            <div className="flex justify-end">
              <PatientActions patient={p} />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
