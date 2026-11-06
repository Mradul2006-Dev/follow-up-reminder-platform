/**
 * Deterministic mock data (seeded PRNG, so the server and client agree).
 *
 * Everything is fictional. Phone numbers use the 555 / Ofcom drama ranges.
 * The dashboard numbers shown in the Stitch design (1,284 patients, 28 today,
 * 94 upcoming, 5 missed) fall out of this data via lib/stats.ts. Nothing is hardcoded there.
 */
import { addDays, MOCK_TODAY } from "./date";
import { PROTOCOLS, PROVIDERS } from "./constants";
import { mulberry32 } from "./prng";
import type { ClinicSettings, FollowUp, Gender, Patient } from "./types";

const rand = mulberry32(20251024);
const int = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;
const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(rand() * arr.length)];
const pad = (n: number) => String(n).padStart(2, "0");
const hhmm = (minutes: number) => `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;

const FIRST_NAMES = [
  "Aarav", "Olivia", "Liam", "Priya", "Noah", "Fatima", "Lucas", "Mei", "Omar", "Chloe",
  "Ethan", "Zara", "Mateo", "Nadia", "Jack", "Ananya", "Leo", "Hannah", "Samir", "Grace",
  "Daniel", "Isabel", "Kenji", "Amelia", "Hugo", "Layla", "Owen", "Sofia", "Rohan", "Emma",
  "Theo", "Yasmin", "Caleb", "Ingrid", "Arjun", "Nora", "Felix", "Camila", "Idris", "Ruby",
  "Victor", "Tara", "Miles", "Aisha", "Adrian", "Bella", "Kofi", "Lena", "Dev", "Maya",
];
const LAST_NAMES = [
  "Anderson", "Bennett", "Chowdhury", "Dalton", "Ellison", "Fischer", "Grant", "Hughes", "Iyer", "Jensen",
  "Kapoor", "Larsen", "Morales", "Nguyen", "Okafor", "Patel", "Quinn", "Reyes", "Sato", "Thompson",
  "Underwood", "Vasquez", "Walker", "Xu", "Young", "Zimmerman", "Abbott", "Banerjee", "Cortez", "Doyle",
  "Evans", "Farooq", "Gill", "Hartman", "Ibrahim", "Joshi", "Kerr", "Lopez", "Mehta", "Novak",
  "Osei", "Pereira", "Rahman", "Silva", "Tanaka", "Usman", "Voss", "Whitaker", "Yilmaz", "Zhang",
];

const HAND_DOB: Record<string, string> = {
  "p-001": "1984-03-12",
  "p-002": "1971-08-02",
  "p-003": "1958-11-23",
  "p-004": "2018-05-09",
  "p-005": "1979-01-30",
  "p-006": "1992-06-17",
  "p-007": "1995-09-04",
  "p-008": "1952-12-15",
  "p-009": "1988-07-21",
};

const HAND_PATIENTS: Patient[] = [
  ["p-001", "MRN-849201", "Clara Vance", "+15550100001", "female", "2024-02-11"],
  ["p-002", "MRN-910482", "Marcus Brody", "+15550100002", "male", "2023-09-05"],
  ["p-003", "MRN-723145", "Eleanor Davies", "+15550100003", "female", "2023-04-19"],
  ["p-004", "MRN-554201", "David Kim", "+15550100004", "male", "2024-06-30"],
  ["p-005", "MRN-330194", "Sophia Martinez", "+15550100005", "female", "2024-01-22"],
  ["p-006", "MRN-609122", "Ethan Wright", "+15550100006", "male", "2025-03-14"],
  ["p-007", "MRN-441890", "Maria Gonzalez", "+15550100007", "female", "2025-05-02"],
  ["p-008", "MRN-219084", "Arthur Pendelton", "+15550100008", "male", "2022-11-08"],
  ["p-009", "MRN-781033", "Leila Farhan", "+15550100009", "female", "2025-07-17"],
].map(([id, mrn, name, phone, gender, createdAt]) => ({
  id,
  mrn,
  name,
  phone,
  email: `${name.toLowerCase().replace(" ", ".")}@example.com`,
  dob: HAND_DOB[id],
  gender: gender as Gender,
  whatsappOptIn: true,
  consentAt: createdAt,
  createdAt,
}));

const TOTAL_PATIENTS = 1284;
const NEW_THIS_MONTH = 138; // 138 / (1284 - 138) = +12%

function generatePatients(): Patient[] {
  const usedMrn = new Set(HAND_PATIENTS.map((p) => p.mrn));
  const usedPhone = new Set(HAND_PATIENTS.map((p) => p.phone));
  const out: Patient[] = [];
  const count = TOTAL_PATIENTS - HAND_PATIENTS.length;

  for (let i = 0; i < count; i++) {
    let mrn = "";
    do mrn = `MRN-${int(100000, 999999)}`;
    while (usedMrn.has(mrn));
    usedMrn.add(mrn);

    let phone = "";
    do phone = rand() < 0.1 ? `+447700900${pad(int(0, 99))}${int(0, 9)}` : `+1555${int(1000000, 9999999)}`;
    while (usedPhone.has(phone));
    usedPhone.add(phone);

    const isNew = i >= count - NEW_THIS_MONTH;
    const createdAt = isNew
      ? `2025-10-${pad(int(1, 24))}`
      : addDays("2023-01-01", int(0, 1000)); // up to ~Sep 2025
    const optIn = rand() < 0.92;
    const first = pick(FIRST_NAMES);
    const last = pick(LAST_NAMES);
    out.push({
      id: `p-${100 + i}`,
      mrn,
      name: `${first} ${last}`,
      phone,
      email: rand() < 0.5 ? `${first}.${last}@example.com`.toLowerCase() : undefined,
      dob: `${int(1940, 2019)}-${pad(int(1, 12))}-${pad(int(1, 28))}`,
      gender: pick(["female", "male", "other", "unspecified"] as const),
      whatsappOptIn: optIn,
      consentAt: optIn ? createdAt : undefined,
      createdAt,
    });
  }
  return out;
}

export const seedPatients: Patient[] = [...HAND_PATIENTS, ...generatePatients()];

// ---------------------------------------------------------------------------
// Follow-ups
// ---------------------------------------------------------------------------

const protocolDept = (name: string) => PROTOCOLS.find((p) => p.name === name)?.department ?? "Clinic";

function hand(
  n: number,
  patientId: string,
  date: string,
  time: string,
  protocol: string,
  provider: string,
  status: FollowUp["status"],
  extra: Partial<FollowUp> = {},
  department = protocolDept(protocol),
): FollowUp {
  return {
    id: `fu-${pad(n)}`,
    patientId,
    date,
    time,
    protocol,
    department,
    provider,
    status,
    reminders: { h24: true, h2: true },
    createdAt: addDays(date, -14),
    ...extra,
  };
}

const T = MOCK_TODAY;
const handFollowUps: FollowUp[] = [
  // Today (matches the Stitch table)
  hand(1, "p-001", T, "09:30", "Post-Op Wound Check", "Dr. Sarah Jenkins", "confirmed"),
  hand(2, "p-002", T, "10:15", "Diabetes HbA1c Review", "Dr. Sarah Jenkins", "scheduled"),
  hand(3, "p-003", T, "11:00", "Cardiology Follow-up", "Dr. Robert Chen", "visited", {
    loggedAt: "10:55",
    notes: "BP stable at 122/78. Continue current medication. Review in 3 months.",
  }),
  hand(4, "p-004", T, "14:00", "Pediatric Vaccine Check", "Dr. Sarah Jenkins", "missed", { noShowMinutes: 40 }),
  hand(5, "p-005", T, "15:30", "Hypertension Consultation", "Dr. Sarah Jenkins", "confirmed"),
  // Upcoming (matches the Stitch rail)
  hand(6, "p-006", addDays(T, 1), "10:00", "Post-Fracture X-Ray Review", "Dr. Robert Chen", "scheduled"),
  hand(7, "p-007", addDays(T, 1), "13:15", "Prenatal Ultrasound 2nd Trim", "Dr. Priya Nair", "scheduled"),
  hand(8, "p-008", addDays(T, 2), "09:00", "Chemotherapy Tolerance Check", "Dr. Marcus Hale", "scheduled"),
  hand(9, "p-009", addDays(T, 3), "11:30", "Dermatology Biopsy Results", "Dr. Amara Okafor", "scheduled", {}, "Clinic"),
];

// Earlier visits for the nine design patients, so their detail timelines have history.
// All in the past and "visited", so no dashboard number changes.
const HISTORY: [patientId: string, daysAgo: number, protocol: string, provider: string, notes: string][] = [
  ["p-001", 7, "Post-Op Wound Check", "Dr. Sarah Jenkins", "Incision healing well. Sutures removed."],
  ["p-001", 21, "Post-Op Wound Check", "Dr. Robert Chen", "First post-op check. Mild swelling, no infection."],
  ["p-002", 30, "Diabetes HbA1c Review", "Dr. Sarah Jenkins", "HbA1c 7.4%. Continue current plan."],
  ["p-002", 120, "Diabetes HbA1c Review", "Dr. Sarah Jenkins", "Dose adjusted. Dietitian referral made."],
  ["p-003", 95, "Cardiology Follow-up", "Dr. Robert Chen", "ECG unchanged. Statin dose maintained."],
  ["p-003", 185, "Cardiology Follow-up", "Dr. Robert Chen", "Stable. Review in 3 months."],
  ["p-004", 60, "Pediatric Vaccine Check", "Dr. Sarah Jenkins", "Vaccinations up to date."],
  ["p-004", 150, "Pediatric Vaccine Check", "Dr. Sarah Jenkins", "Growth on track. Booster given."],
  ["p-005", 45, "Hypertension Consultation", "Dr. Sarah Jenkins", "Dose increased. Recheck in 6 weeks."],
  ["p-005", 110, "Hypertension Consultation", "Dr. Sarah Jenkins", "Hypertension confirmed. Lifestyle plan discussed."],
  ["p-006", 14, "Post-Fracture X-Ray Review", "Dr. Robert Chen", "Good callus formation. Cast removed."],
  ["p-006", 42, "Post-Fracture X-Ray Review", "Dr. Robert Chen", "Fracture reduced and casted."],
  ["p-007", 28, "Prenatal Ultrasound 2nd Trim", "Dr. Priya Nair", "Anatomy scan normal."],
  ["p-007", 56, "Prenatal Ultrasound 2nd Trim", "Dr. Priya Nair", "Routine antenatal visit. All normal."],
  ["p-008", 16, "Chemotherapy Tolerance Check", "Dr. Marcus Hale", "Cycle 4 tolerated. Mild nausea only."],
  ["p-008", 37, "Chemotherapy Tolerance Check", "Dr. Marcus Hale", "Cycle 3 completed. Weight stable."],
  ["p-009", 10, "Dermatology Biopsy Results", "Dr. Amara Okafor", "Punch biopsy taken. Results pending."],
  ["p-009", 60, "Dermatology Biopsy Results", "Dr. Amara Okafor", "Dermoscopy done. Biopsy recommended."],
];
const HISTORY_TIMES = ["09:00", "10:30", "11:15", "14:00", "15:30"];
const handHistory: FollowUp[] = HISTORY.map(([patientId, daysAgo, protocol, provider, notes], i) => {
  const time = HISTORY_TIMES[i % HISTORY_TIMES.length];
  return hand(10 + i, patientId, addDays(T, -daysAgo), time, protocol, provider, "visited", { loggedAt: time, notes });
});

const VISIT_NOTES = [
  "Recovery on track. No complications reported.",
  "Labs reviewed with patient. Dosage adjusted.",
  "Patient reports mild improvement. Follow-up in 4 weeks.",
  "Vitals normal. Discharged from active monitoring.",
  "Discussed lifestyle changes. Next review scheduled.",
];

function generateFollowUps(): FollowUp[] {
  const out: FollowUp[] = [];
  const handPatientIds = new Set(HAND_PATIENTS.map((p) => p.id));
  // Pick from established, consenting patients; one follow-up per patient.
  const pool = seedPatients.filter((p) => p.whatsappOptIn && !handPatientIds.has(p.id) && p.createdAt < "2025-10-01");
  let cursor = 0;
  const nextPatient = () => pool[cursor++ % pool.length];
  let n = 100;

  const make = (date: string, time: string, status: FollowUp["status"], extra: Partial<FollowUp> = {}): FollowUp => {
    const proto = pick(PROTOCOLS);
    return {
      id: `fu-${n++}`,
      patientId: nextPatient().id,
      date,
      time,
      protocol: proto.name,
      department: proto.department,
      provider: pick(PROVIDERS),
      status,
      reminders: { h24: true, h2: true },
      createdAt: addDays(date, -int(7, 21)),
      ...extra,
    };
  };

  // Today: 23 more after 03:30 PM, so the Stitch rows stay first when sorted by time.
  // Final mix across all 28: 18 confirmed/visited, 5 scheduled, 5 missed.
  for (let i = 0; i < 23; i++) {
    const time = hhmm(15 * 60 + 45 + Math.floor(i * 0.7) * 15);
    if (i < 4) out.push(make(T, time, "missed", { noShowMinutes: int(20, 55) }));
    else if (i % 5 === 2) out.push(make(T, time, "scheduled"));
    else out.push(make(T, time, "confirmed"));
  }

  // Upcoming: 90 more in the 7-day window (Oct 25-26 is a weekend, so only the Stitch ones sit there).
  for (let i = 0; i < 90; i++) {
    let day = int(27, 31);
    let slot = int(0, 33);
    while (day === 27 && 9 * 60 + slot * 15 < 11 * 60 + 45) {
      day = int(27, 31);
      slot = int(0, 33);
    }
    out.push(make(`2025-10-${day}`, hhmm(9 * 60 + slot * 15), "scheduled"));
  }

  // Past week: completed visits for the history view.
  for (let i = 0; i < 60; i++) {
    const minutes = 9 * 60 + int(0, 33) * 15;
    out.push(
      make(addDays(T, -int(1, 10)), hhmm(minutes), "visited", {
        loggedAt: hhmm(minutes - int(0, 10)),
        notes: pick(VISIT_NOTES),
      }),
    );
  }
  return out;
}

export const seedFollowUps: FollowUp[] = [...handFollowUps, ...handHistory, ...generateFollowUps()];

export const seedSettings: ClinicSettings = {
  clinicName: "Metro Health Clinic",
  timezone: "America/New_York",
  whatsapp: {
    enabled: true,
    reminder24h: true,
    reminder2h: true,
    autoReengage: true,
    quietHoursStart: "21:00",
    quietHoursEnd: "08:00",
  },
  templates: {
    reminder24h:
      "Hi {{patient_name}}, this is a reminder from {{clinic}} about your follow-up with {{provider}} on {{date}} at {{time}}. Tap Confirm to secure your slot.",
    reminder2h:
      "Hi {{patient_name}}, your visit with {{provider}} at {{clinic}} is at {{time}} today. See you soon!",
    missed:
      "Hi {{patient_name}}, we missed you at your visit with {{provider}} on {{date}}. Tap Reschedule and we'll find a new time that works.",
  },
  creditsRemaining: 2450,
  apiStatus: { online: true, uptimePct: 99.8 },
};
