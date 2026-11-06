"use client";

import { useMemo, useState } from "react";
import { DEPARTMENTS, PROTOCOLS, PROVIDERS } from "@/lib/constants";
import { formatTime, MOCK_TODAY } from "@/lib/date";
import { patientMatches } from "@/lib/followups";
import { useStore } from "@/lib/store/store";
import type { Patient } from "@/lib/types";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";
import { Checkbox, Field, Select, TextArea, TextInput } from "../ui/Field";
import { Icon } from "../ui/Icon";
import { Modal } from "../ui/Modal";
import type { ScheduleOptions } from "./ModalsProvider";

interface Props {
  options: ScheduleOptions;
  onClose: () => void;
}

type Errors = Partial<Record<"patient" | "date" | "time" | "protocol", string>>;

export function ScheduleFollowUpModal({ options, onClose }: Props) {
  const { patients, patientsById, followUps, scheduleFollowUp, rescheduleFollowUp } = useStore();
  const editing = options.followUp;

  const [patientId, setPatientId] = useState(editing?.patientId ?? options.patientId ?? "");
  const [search, setSearch] = useState("");
  const [date, setDate] = useState(editing?.date ?? "");
  const [time, setTime] = useState(editing?.time ?? "");
  const [protocol, setProtocol] = useState(editing?.protocol ?? options.protocol ?? "");
  const [department, setDepartment] = useState(editing?.department ?? "");
  const [provider, setProvider] = useState(editing?.provider ?? PROVIDERS[0]);
  const [h24, setH24] = useState(editing?.reminders.h24 ?? true);
  const [h2, setH2] = useState(editing?.reminders.h2 ?? true);
  const [notes, setNotes] = useState(editing?.notes ?? "");
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  const patient: Patient | undefined = patientsById.get(patientId);
  const consent = patient?.whatsappOptIn ?? true;

  const results = useMemo(() => {
    if (!search.trim()) return [];
    return patients.filter((p) => patientMatches(p, search)).slice(0, 6);
  }, [patients, search]);

  const conflict = useMemo(() => {
    if (!date || !time) return null;
    return followUps.find(
      (f) => f.id !== editing?.id && f.date === date && f.time === time && f.provider === provider && f.status !== "missed",
    );
  }, [followUps, date, time, provider, editing?.id]);

  const onProtocol = (name: string) => {
    setProtocol(name);
    const match = PROTOCOLS.find((p) => p.name === name);
    if (match) setDepartment(match.department);
    setErrors((e) => ({ ...e, protocol: undefined }));
  };

  const submit = async () => {
    const e: Errors = {};
    if (!patientId) e.patient = "Select a patient.";
    if (!date) e.date = "Choose a date.";
    else if (date < MOCK_TODAY) e.date = "Date cannot be in the past.";
    if (!time) e.time = "Choose a time.";
    if (!protocol) e.protocol = "Choose a visit protocol.";
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setSaving(true);
    try {
      const input = {
        patientId,
        date,
        time,
        protocol,
        department: department || "Clinic",
        provider,
        reminders: { h24: consent && h24, h2: consent && h2 },
        notes: notes.trim() || undefined,
      };
      if (editing) await rescheduleFollowUp(editing.id, input);
      else await scheduleFollowUp(input);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={editing ? "Reschedule Follow-up" : "Schedule Follow-up"}
      description="Reminders go out automatically on WhatsApp 24h and 2h before the visit."
      widthClass="sm:max-w-xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={() => void submit()} disabled={saving} icon="event_available">
            {editing ? "Save changes" : "Schedule"}
          </Button>
        </>
      }
    >
      <form
        onSubmit={(ev) => {
          ev.preventDefault();
          void submit();
        }}
        noValidate
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        {/* Patient picker */}
        <div className="sm:col-span-2">
          <Field label="Patient" htmlFor="sf-patient" required error={errors.patient}>
            {patient ? (
              <div className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-200 bg-slate-50/60">
                <Avatar name={patient.name} tone="bg-slate-100 text-slate-700 border-slate-200" />
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-xs font-semibold text-slate-900 truncate">{patient.name}</span>
                  <span className="text-[11px] text-slate-400 font-mono tabular-nums">
                    {patient.mrn} · {patient.phone}
                  </span>
                </div>
                {!editing && (
                  <button
                    type="button"
                    onClick={() => setPatientId("")}
                    className="text-xs font-medium text-slate-600 hover:text-slate-900"
                  >
                    Change
                  </button>
                )}
              </div>
            ) : (
              <div className="relative">
                <Icon name="search" className="absolute left-3 top-2 text-slate-400 text-lg" />
                <TextInput
                  id="sf-patient"
                  autoFocus
                  autoComplete="off"
                  value={search}
                  invalid={!!errors.patient}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setErrors((er) => ({ ...er, patient: undefined }));
                  }}
                  placeholder="Search by name, MRN or phone…"
                  className="!pl-9"
                />
                {search.trim() && (
                  <ul className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg py-1 max-h-56 overflow-y-auto">
                    {results.length === 0 && <li className="px-3 py-2 text-xs text-slate-500">No matching patients.</li>}
                    {results.map((p) => (
                      <li key={p.id}>
                        <button
                          type="button"
                          onClick={() => {
                            setPatientId(p.id);
                            setSearch("");
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between gap-3"
                        >
                          <span className="text-xs font-semibold text-slate-900 truncate">{p.name}</span>
                          <span className="text-[11px] text-slate-400 font-mono tabular-nums">{p.mrn}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </Field>
        </div>

        <Field label="Date" htmlFor="sf-date" required error={errors.date}>
          <TextInput id="sf-date" type="date" min={MOCK_TODAY} value={date} invalid={!!errors.date} onChange={(e) => { setDate(e.target.value); setErrors((er) => ({ ...er, date: undefined })); }} />
        </Field>
        <Field label="Time" htmlFor="sf-time" required error={errors.time}>
          <TextInput id="sf-time" type="time" step={900} value={time} invalid={!!errors.time} onChange={(e) => { setTime(e.target.value); setErrors((er) => ({ ...er, time: undefined })); }} />
        </Field>

        <Field label="Visit protocol" htmlFor="sf-protocol" required error={errors.protocol} className="sm:col-span-2">
          <Select id="sf-protocol" value={protocol} invalid={!!errors.protocol} onChange={(e) => onProtocol(e.target.value)}>
            <option value="">Select a protocol…</option>
            {PROTOCOLS.map((p) => (
              <option key={p.name} value={p.name}>
                {p.name}
              </option>
            ))}
            {protocol && !PROTOCOLS.some((p) => p.name === protocol) && <option value={protocol}>{protocol}</option>}
          </Select>
        </Field>

        <Field label="Provider" htmlFor="sf-provider">
          <Select id="sf-provider" value={provider} onChange={(e) => setProvider(e.target.value)}>
            {PROVIDERS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Department" htmlFor="sf-dept">
          <Select id="sf-dept" value={department || "Clinic"} onChange={(e) => setDepartment(e.target.value)}>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </Select>
        </Field>

        {conflict && (
          <p className="sm:col-span-2 flex items-start gap-2 text-[11px] text-amber-800 bg-amber-50 border border-amber-200/60 rounded-lg px-3 py-2">
            <Icon name="warning" className="text-sm mt-px" />
            {provider} already has a follow-up at {formatTime(time)} on this date. You can still schedule it.
          </p>
        )}

        <div className="sm:col-span-2 rounded-lg border border-slate-200 p-3.5 flex flex-col gap-3">
          <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
            <Icon name="mark_chat_read" className="text-sm text-whatsapp" />
            WhatsApp reminders
          </span>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Checkbox id="sf-24" checked={consent && h24} disabled={!consent} onChange={setH24} label="24 hours before" />
            <Checkbox id="sf-2" checked={consent && h2} disabled={!consent} onChange={setH2} label="2 hours before" />
          </div>
          {!consent && (
            <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200/60 rounded-lg px-3 py-2">
              This patient has not given WhatsApp consent, so reminders are off. Record consent from the Patients page.
            </p>
          )}
        </div>

        <Field label="Notes" htmlFor="sf-notes" className="sm:col-span-2">
          <TextArea id="sf-notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional instructions for the visit…" />
        </Field>
      </form>
    </Modal>
  );
}
