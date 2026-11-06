/** Domain types. These mirror the tables Supabase will hold later (patients, follow_ups, clinic_settings). */

export type FollowUpStatus = "scheduled" | "confirmed" | "visited" | "missed";
export type Gender = "female" | "male" | "other" | "unspecified";

export interface Patient {
  id: string;
  /** Medical record number, e.g. "MRN-849201". */
  mrn: string;
  name: string;
  /** E.164 format, e.g. "+15550100001". This is the WhatsApp number. */
  phone: string;
  email?: string;
  /** YYYY-MM-DD */
  dob?: string;
  gender: Gender;
  /** Patient agreed to receive appointment reminders on WhatsApp. */
  whatsappOptIn: boolean;
  /** YYYY-MM-DD, set when consent was recorded. */
  consentAt?: string;
  notes?: string;
  /** YYYY-MM-DD */
  createdAt: string;
}

export interface FollowUp {
  id: string;
  patientId: string;
  /** YYYY-MM-DD */
  date: string;
  /** 24h "HH:mm" */
  time: string;
  protocol: string;
  department: string;
  provider: string;
  status: FollowUpStatus;
  reminders: { h24: boolean; h2: boolean };
  notes?: string;
  /** "HH:mm" the visit was logged (status visited). */
  loggedAt?: string;
  /** Minutes past the slot at the time the patient was flagged as a no-show. */
  noShowMinutes?: number;
  /** ISO timestamp of the last WhatsApp reminder that was sent. */
  lastReminderAt?: string;
  createdAt: string;
}

export interface NewPatientInput {
  name: string;
  /** Optional; generated when blank. */
  mrn?: string;
  /** e.g. "+1" */
  countryCode: string;
  /** Local number as typed. */
  phone: string;
  email?: string;
  dob?: string;
  gender: Gender;
  whatsappOptIn: boolean;
  notes?: string;
}

export interface NewFollowUpInput {
  patientId: string;
  date: string;
  time: string;
  protocol: string;
  department: string;
  provider: string;
  reminders: { h24: boolean; h2: boolean };
  notes?: string;
}

export type TemplateKey = "reminder24h" | "reminder2h" | "missed";

export interface ClinicSettings {
  clinicName: string;
  timezone: string;
  whatsapp: {
    enabled: boolean;
    reminder24h: boolean;
    reminder2h: boolean;
    autoReengage: boolean;
    quietHoursStart: string;
    quietHoursEnd: string;
  };
  templates: Record<TemplateKey, string>;
  /** Shown in the header. Will come from the Twilio usage API later. */
  creditsRemaining: number;
  /** Shown in the sidebar. Will come from a health check later. */
  apiStatus: { online: boolean; uptimePct: number };
}

export interface DashboardStats {
  totalPatients: number;
  newPatientsThisMonth: number;
  growthPct: number;
  todayTotal: number;
  todayConfirmed: number;
  todayPending: number;
  todayMissed: number;
  upcomingCount: number;
  missedCount: number;
}

// ---------------------------------------------------------------------------
// Clinical record (patient detail page)
// ---------------------------------------------------------------------------

export interface Condition {
  id: string;
  name: string;
  status: "active" | "monitoring" | "resolved";
  /** YYYY-MM-DD, when the condition was diagnosed. */
  since: string;
}

export interface Allergy {
  id: string;
  substance: string;
  reaction: string;
  severity: "mild" | "moderate" | "severe";
}

export interface DoctorNote {
  id: string;
  /** YYYY-MM-DD */
  date: string;
  author: string;
  content: string;
}

export interface Prescription {
  id: string;
  medication: string;
  dosage: string;
  frequency: string;
  /** YYYY-MM-DD */
  startDate: string;
  endDate?: string;
  prescribedBy: string;
  status: "active" | "completed" | "discontinued";
  instructions?: string;
}

/** Loaded separately from Patient so the list views stay light. */
export interface PatientRecord {
  patientId: string;
  bloodType?: string;
  conditions: Condition[];
  allergies: Allergy[];
  notes: DoctorNote[];
  prescriptions: Prescription[];
}
