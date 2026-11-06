"use client";

import { useState, type FormEvent } from "react";
import { COUNTRY_CODES, GENDERS } from "@/lib/constants";
import { MOCK_TODAY } from "@/lib/date";
import { normalizeLocalNumber, useStore } from "@/lib/store/store";
import type { Gender, Patient } from "@/lib/types";
import { Button } from "../ui/Button";
import { Checkbox, Field, Select, TextArea, TextInput } from "../ui/Field";
import { Icon } from "../ui/Icon";
import { Modal } from "../ui/Modal";

interface Form {
  name: string;
  mrn: string;
  countryCode: string;
  phone: string;
  email: string;
  dob: string;
  gender: Gender;
  whatsappOptIn: boolean;
  notes: string;
}

const EMPTY: Form = {
  name: "",
  mrn: "",
  countryCode: "+1",
  phone: "",
  email: "",
  dob: "",
  gender: "unspecified",
  whatsappOptIn: false,
  notes: "",
};

type Errors = Partial<Record<keyof Form, string>>;

interface Props {
  onClose: () => void;
  onAddedAndSchedule: (patient: Patient) => void;
}

export function AddPatientModal({ onClose, onAddedAndSchedule }: Props) {
  const { patients, addPatient } = useStore();
  const [form, setForm] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof Form>(key: K, value: Form[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = (): Errors => {
    const e: Errors = {};
    if (form.name.trim().length < 2) e.name = "Enter the patient's full name.";
    const mrn = form.mrn.trim().toUpperCase();
    if (mrn) {
      if (!/^[A-Z0-9-]{4,20}$/.test(mrn)) e.mrn = "Use 4-20 letters, numbers or dashes.";
      else if (patients.some((p) => p.mrn === mrn)) e.mrn = "This MRN already exists.";
    }
    const digits = normalizeLocalNumber(form.phone);
    if (!digits) e.phone = "WhatsApp number is required.";
    else if (digits.length < 6 || digits.length > 13) e.phone = "Enter a valid phone number (6-13 digits).";
    else if (patients.some((p) => p.phone === `${form.countryCode}${digits}`)) e.phone = "A patient with this number already exists.";
    if (form.email.trim() && !/^\S+@\S+\.\S+$/.test(form.email.trim())) e.email = "Enter a valid email address.";
    if (form.dob && form.dob > MOCK_TODAY) e.dob = "Date of birth cannot be in the future.";
    return e;
  };

  const submit = async (andSchedule: boolean) => {
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    setSaving(true);
    try {
      const created = await addPatient({
        ...form,
        email: form.email.trim() || undefined,
        dob: form.dob || undefined,
        notes: form.notes.trim() || undefined,
      });
      if (andSchedule) onAddedAndSchedule(created);
      else onClose();
    } finally {
      setSaving(false);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void submit(false);
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Add Patient"
      description="Create a patient record and capture WhatsApp consent."
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="secondary" onClick={() => void submit(true)} disabled={saving}>
            Add &amp; schedule
          </Button>
          <Button onClick={() => void submit(false)} disabled={saving} icon="person_add">
            Add Patient
          </Button>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Full name" htmlFor="ap-name" required error={errors.name} className="sm:col-span-2">
          <TextInput id="ap-name" autoFocus value={form.name} invalid={!!errors.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Clara Vance" />
        </Field>

        <Field label="WhatsApp number" htmlFor="ap-phone" required error={errors.phone} hint="Reminders are sent to this number." className="sm:col-span-2">
          <div className="flex gap-2">
            <Select aria-label="Country code" className="!w-32 flex-shrink-0" value={form.countryCode} onChange={(e) => set("countryCode", e.target.value)}>
              {COUNTRY_CODES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </Select>
            <TextInput id="ap-phone" type="tel" inputMode="tel" value={form.phone} invalid={!!errors.phone} onChange={(e) => set("phone", e.target.value)} placeholder="415 555 0123" />
          </div>
        </Field>

        <Field label="MRN" htmlFor="ap-mrn" error={errors.mrn} hint="Leave blank to auto-generate.">
          <TextInput id="ap-mrn" value={form.mrn} invalid={!!errors.mrn} onChange={(e) => set("mrn", e.target.value)} placeholder="MRN-123456" className="font-mono" />
        </Field>
        <Field label="Email" htmlFor="ap-email" error={errors.email}>
          <TextInput id="ap-email" type="email" value={form.email} invalid={!!errors.email} onChange={(e) => set("email", e.target.value)} placeholder="optional" />
        </Field>

        <Field label="Date of birth" htmlFor="ap-dob" error={errors.dob}>
          <TextInput id="ap-dob" type="date" max={MOCK_TODAY} value={form.dob} invalid={!!errors.dob} onChange={(e) => set("dob", e.target.value)} />
        </Field>
        <Field label="Gender" htmlFor="ap-gender">
          <Select id="ap-gender" value={form.gender} onChange={(e) => set("gender", e.target.value as Gender)}>
            {GENDERS.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Notes" htmlFor="ap-notes" className="sm:col-span-2">
          <TextArea id="ap-notes" rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Allergies, preferred language, caregiver contact…" />
        </Field>

        <div className="sm:col-span-2 rounded-lg border border-emerald-200/60 bg-emerald-50/50 p-3.5">
          <Checkbox
            id="ap-consent"
            checked={form.whatsappOptIn}
            onChange={(v) => set("whatsappOptIn", v)}
            label={
              <span className="flex items-center gap-1.5">
                <Icon name="mark_chat_read" className="text-sm text-whatsapp" />
                Patient consents to WhatsApp appointment reminders
              </span>
            }
            description="Confirm the patient agreed to receive reminders and replies on WhatsApp. Without consent, no messages are sent."
          />
        </div>
      </form>
    </Modal>
  );
}
