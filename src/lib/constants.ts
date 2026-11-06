import type { FollowUpStatus, Gender, TemplateKey } from "./types";

export const PROVIDERS = [
  "Dr. Sarah Jenkins",
  "Dr. Robert Chen",
  "Dr. Priya Nair",
  "Dr. Marcus Hale",
  "Dr. Amara Okafor",
] as const;

export const PROTOCOLS: { name: string; department: string }[] = [
  { name: "Post-Op Wound Check", department: "Surgery" },
  { name: "Diabetes HbA1c Review", department: "Endocrinology" },
  { name: "Cardiology Follow-up", department: "Cardiology" },
  { name: "Pediatric Vaccine Check", department: "Pediatrics" },
  { name: "Hypertension Consultation", department: "Cardiology" },
  { name: "Post-Fracture X-Ray Review", department: "Orthopedics" },
  { name: "Prenatal Ultrasound 2nd Trim", department: "OB/GYN" },
  { name: "Chemotherapy Tolerance Check", department: "Oncology" },
  { name: "Dermatology Biopsy Results", department: "Dermatology" },
  { name: "Asthma Control Review", department: "Pulmonology" },
  { name: "Thyroid Panel Review", department: "Endocrinology" },
  { name: "Physical Therapy Progress", department: "Orthopedics" },
];

export const DEPARTMENTS = [
  "Clinic",
  "Cardiology",
  "Dermatology",
  "Endocrinology",
  "OB/GYN",
  "Oncology",
  "Orthopedics",
  "Pediatrics",
  "Pulmonology",
  "Surgery",
] as const;

export const COUNTRY_CODES = [
  { code: "+1", label: "+1 (US/CA)" },
  { code: "+44", label: "+44 (UK)" },
  { code: "+91", label: "+91 (IN)" },
  { code: "+61", label: "+61 (AU)" },
  { code: "+971", label: "+971 (AE)" },
] as const;

export const GENDERS: { value: Gender; label: string }[] = [
  { value: "unspecified", label: "Prefer not to say" },
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "other", label: "Other" },
];

export const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Los_Angeles",
  "Europe/London",
  "Asia/Kolkata",
  "Asia/Dubai",
  "Australia/Sydney",
];

export const TEMPLATE_META: Record<TemplateKey, { label: string; description: string }> = {
  reminder24h: { label: "24h reminder", description: "Sent the day before the visit" },
  reminder2h: { label: "2h reminder", description: "Sent two hours before the visit" },
  missed: { label: "Missed visit", description: "Re-engagement after a no-show" },
};

export const TEMPLATE_VARIABLES = ["patient_name", "date", "time", "provider", "clinic"] as const;

interface StatusMeta {
  label: string;
  /** Pill classes (border + background + text). */
  pill: string;
  /** Avatar classes for the patient initials circle. */
  avatar: string;
}

export const STATUS_META: Record<FollowUpStatus, StatusMeta> = {
  confirmed: {
    label: "Confirmed",
    pill: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
    avatar: "bg-teal-50 text-teal-800 border-teal-200/50",
  },
  scheduled: {
    label: "Scheduled",
    pill: "bg-blue-50 text-blue-700 border-blue-200/60",
    avatar: "bg-slate-100 text-slate-700 border-slate-200",
  },
  visited: {
    label: "Visited",
    pill: "bg-slate-100 text-slate-600 border-slate-200",
    avatar: "bg-slate-100 text-slate-600 border-slate-200",
  },
  missed: {
    label: "Missed",
    pill: "bg-rose-50 text-rose-700 border-rose-200/60",
    avatar: "bg-rose-50 text-rose-700 border-rose-200/50",
  },
};
