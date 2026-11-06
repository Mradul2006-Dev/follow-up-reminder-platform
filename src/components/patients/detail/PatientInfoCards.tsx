"use client";

import { GENDERS } from "@/lib/constants";
import { calcAge, formatDateLong } from "@/lib/date";
import { useStore } from "@/lib/store/store";
import type { Patient } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Card, InfoRow } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { Pill } from "@/components/ui/StatusBadge";

const NOT_RECORDED = <span className="text-slate-400 font-normal">Not recorded</span>;

export function PersonalInfoCard({ patient, bloodType }: { patient: Patient; bloodType?: string }) {
  const gender = GENDERS.find((g) => g.value === patient.gender)?.label;
  return (
    <Card title="Personal information" icon="badge">
      <dl className="divide-y divide-slate-100 -my-2.5">
        <InfoRow label="Full name">{patient.name}</InfoRow>
        <InfoRow label="MRN">
          <span className="font-mono tabular-nums">{patient.mrn}</span>
        </InfoRow>
        <InfoRow label="Date of birth">
          {patient.dob ? `${formatDateLong(patient.dob)} (${calcAge(patient.dob)} yrs)` : NOT_RECORDED}
        </InfoRow>
        <InfoRow label="Gender">{gender ?? NOT_RECORDED}</InfoRow>
        <InfoRow label="Blood type">{bloodType ?? NOT_RECORDED}</InfoRow>
        <InfoRow label="Patient since">{formatDateLong(patient.createdAt)}</InfoRow>
      </dl>
      {patient.notes && (
        <p className="mt-4 text-xs text-slate-600 leading-relaxed bg-slate-50 border border-slate-100 rounded-lg p-3">{patient.notes}</p>
      )}
    </Card>
  );
}

export function ContactConsentCard({ patient }: { patient: Patient }) {
  const { setPatientConsent } = useStore();
  return (
    <Card title="Contact & WhatsApp consent" icon="contact_phone">
      <dl className="divide-y divide-slate-100 -my-2.5">
        <InfoRow label="WhatsApp number">
          <span className="font-mono tabular-nums">{patient.phone}</span>
        </InfoRow>
        <InfoRow label="Email">{patient.email ?? NOT_RECORDED}</InfoRow>
        <InfoRow label="Reminder consent">
          {patient.whatsappOptIn ? (
            <Pill tone="emerald">
              <Icon name="mark_chat_read" className="text-xs text-whatsapp" /> Opted in
            </Pill>
          ) : (
            <Pill tone="slate">
              <Icon name="block" className="text-xs" /> No consent
            </Pill>
          )}
        </InfoRow>
        {patient.whatsappOptIn && patient.consentAt && <InfoRow label="Consent recorded">{formatDateLong(patient.consentAt)}</InfoRow>}
      </dl>
      <p className="mt-4 text-[11px] text-slate-500 leading-relaxed">
        {patient.whatsappOptIn
          ? "Appointment reminders and confirmations are sent to this number on WhatsApp."
          : "No WhatsApp messages will be sent until the patient gives consent."}
      </p>
      <Button
        className="mt-3 w-full"
        variant="secondary"
        icon={patient.whatsappOptIn ? "block" : "mark_chat_read"}
        onClick={() => void setPatientConsent(patient.id, !patient.whatsappOptIn)}
      >
        {patient.whatsappOptIn ? "Revoke WhatsApp consent" : "Record WhatsApp consent"}
      </Button>
    </Card>
  );
}
