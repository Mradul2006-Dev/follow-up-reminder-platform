/** Pure helpers for follow-ups. No React, no I/O, so they are trivially portable to server code later. */
import { addDays, currentTimeHHmm, hoursFromNow, MOCK_TODAY } from "./date";
import type { FollowUp, FollowUpStatus, NewFollowUpInput, Patient } from "./types";

export interface FollowUpRow {
  followUp: FollowUp;
  patient: Patient;
}

export function compareFollowUps(a: FollowUp, b: FollowUp): number {
  return a.date.localeCompare(b.date) || a.time.localeCompare(b.time) || a.id.localeCompare(b.id);
}

export function toRows(followUps: FollowUp[], patientsById: Map<string, Patient>): FollowUpRow[] {
  const rows: FollowUpRow[] = [];
  for (const followUp of followUps) {
    const patient = patientsById.get(followUp.patientId);
    if (patient) rows.push({ followUp, patient });
  }
  return rows;
}

/** Slot number = position in the day's schedule ("Slot #1"). */
export function computeSlots(dayFollowUps: FollowUp[]): Record<string, number> {
  const slots: Record<string, number> = {};
  [...dayFollowUps].sort(compareFollowUps).forEach((f, i) => (slots[f.id] = i + 1));
  return slots;
}

/** Status transition. Keeps the derived fields (loggedAt, noShowMinutes) consistent. */
export function applyStatus(followUp: FollowUp, status: FollowUpStatus): FollowUp {
  const next: FollowUp = { ...followUp, status };
  delete next.loggedAt;
  delete next.noShowMinutes;
  if (status === "visited") next.loggedAt = currentTimeHHmm();
  if (status === "missed") next.noShowMinutes = followUp.noShowMinutes ?? 15;
  return next;
}

export function buildFollowUp(input: NewFollowUpInput, id: string): FollowUp {
  return { id, ...input, status: "scheduled", createdAt: MOCK_TODAY };
}

/** Case-insensitive match across the fields a coordinator would search by. */
export function rowMatches({ followUp, patient }: FollowUpRow, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [patient.name, patient.mrn, patient.phone, followUp.protocol, followUp.provider, followUp.department, followUp.status]
    .join(" ")
    .toLowerCase()
    .includes(q);
}

export function patientMatches(patient: Patient, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const digits = q.replace(/\D/g, "");
  return (
    patient.name.toLowerCase().includes(q) ||
    patient.mrn.toLowerCase().includes(q) ||
    (digits.length > 0 && patient.phone.replace(/\D/g, "").includes(digits))
  );
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

export interface ReminderLabel {
  kind: "trigger" | "auto" | "off";
  text: string;
}

/** What the "Upcoming" rail shows under each item. */
export function reminderLabel(followUp: FollowUp, patient: Patient): ReminderLabel {
  if (!patient.whatsappOptIn) return { kind: "off", text: "No WhatsApp consent" };
  if (!followUp.reminders.h24 && !followUp.reminders.h2) return { kind: "off", text: "Reminders off" };
  if (followUp.date === addDays(MOCK_TODAY, 1)) {
    const upcoming = [
      followUp.reminders.h24 ? hoursFromNow(followUp.date, followUp.time, 24) : null,
      followUp.reminders.h2 ? hoursFromNow(followUp.date, followUp.time, 2) : null,
    ].filter((h): h is number => h !== null && h > 0);
    if (upcoming.length > 0) return { kind: "trigger", text: `WA Trigger in ${Math.round(Math.min(...upcoming))}h` };
  }
  return { kind: "auto", text: "Auto-scheduled 24h prior" };
}

export function renderTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => vars[key] ?? `{{${key}}}`);
}
