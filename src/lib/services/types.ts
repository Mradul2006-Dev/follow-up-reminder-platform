/**
 * Integration seam for the backend phase.
 *
 * The UI never talks to a database or to Twilio directly. It only calls these interfaces
 * (through lib/store). To go live:
 *   - Supabase: implement PatientService / FollowUpService / SettingsService with supabase-js
 *     (or route handlers) and export them from ./index.ts instead of the mock ones.
 *   - Twilio WhatsApp: implement WhatsAppService on the server (API route / edge function),
 *     and have the Twilio status webhook update follow_ups.status (confirmed, etc.).
 *
 * Secrets belong in server-side env vars only (see .env.example). Never in client code.
 */
import type { ClinicSettings, FollowUp, NewPatientInput, Patient, PatientRecord } from "../types";

export interface CreatePatientPayload extends Omit<NewPatientInput, "countryCode" | "phone" | "mrn"> {
  mrn: string;
  /** Normalised E.164 number. */
  phone: string;
  consentAt?: string;
}

export interface PatientService {
  create(payload: CreatePatientPayload): Promise<Patient>;
  save(patient: Patient): Promise<Patient>;
}

export interface FollowUpService {
  /** Inserts when the id is new, updates otherwise. */
  save(followUp: FollowUp): Promise<FollowUp>;
}

export type ReminderKind = "reminder24h" | "reminder2h" | "missed";

export interface WhatsAppService {
  sendReminder(args: { followUpId: string; kind: ReminderKind }): Promise<{ queuedAt: string }>;
}

export interface SettingsService {
  save(settings: ClinicSettings): Promise<ClinicSettings>;
}

export interface PatientRecordService {
  /** Conditions, allergies, doctor's notes and prescriptions. Resolves null when none exist. */
  getByPatientId(patientId: string): Promise<PatientRecord | null>;
}

export interface Services {
  records: PatientRecordService;
  patients: PatientService;
  followUps: FollowUpService;
  whatsapp: WhatsAppService;
  settings: SettingsService;
}
