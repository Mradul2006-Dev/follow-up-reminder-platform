/**
 * Mock clinical records (history, doctor's notes, prescriptions) per patient.
 *
 * The nine patients from the Stitch design have hand-written records. Every other patient gets a
 * record generated from a seed derived from their id, so it is stable between visits.
 * Real version: GET /patients/:id/record (Supabase tables: conditions, allergies, notes, prescriptions).
 */
import { PROVIDERS } from "./constants";
import { addDays, MOCK_TODAY } from "./date";
import { hashString, mulberry32 } from "./prng";
import type { Allergy, Condition, PatientRecord, Prescription } from "./types";

const ago = (days: number) => addDays(MOCK_TODAY, -days);

type CondT = [name: string, status: Condition["status"], sinceDaysAgo: number];
type AllergyT = [substance: string, reaction: string, severity: Allergy["severity"]];
type NoteT = [daysAgo: number, author: string, content: string];
type RxT = [
  medication: string,
  dosage: string,
  frequency: string,
  startedDaysAgo: number,
  endedDaysAgo: number | null,
  prescribedBy: string,
  status: Prescription["status"],
  instructions?: string,
];
interface Template {
  bloodType?: string;
  conditions: CondT[];
  allergies: AllergyT[];
  notes: NoteT[];
  prescriptions: RxT[];
}

function build(patientId: string, t: Template): PatientRecord {
  return {
    patientId,
    bloodType: t.bloodType,
    conditions: t.conditions.map(([name, status, since], i) => ({ id: `${patientId}-c${i}`, name, status, since: ago(since) })),
    allergies: t.allergies.map(([substance, reaction, severity], i) => ({ id: `${patientId}-a${i}`, substance, reaction, severity })),
    notes: t.notes
      .map(([days, author, content], i) => ({ id: `${patientId}-n${i}`, date: ago(days), author, content }))
      .sort((a, b) => b.date.localeCompare(a.date)),
    prescriptions: t.prescriptions.map(
      ([medication, dosage, frequency, started, ended, prescribedBy, status, instructions], i) => ({
        id: `${patientId}-rx${i}`,
        medication,
        dosage,
        frequency,
        startDate: ago(started),
        endDate: ended === null ? undefined : ago(ended),
        prescribedBy,
        status,
        instructions,
      }),
    ),
  };
}

const J = "Dr. Sarah Jenkins";
const C = "Dr. Robert Chen";
const N = "Dr. Priya Nair";
const H = "Dr. Marcus Hale";
const O = "Dr. Amara Okafor";

const HAND: Record<string, Template> = {
  "p-001": {
    bloodType: "O+",
    conditions: [["Appendectomy recovery", "monitoring", 21], ["Seasonal allergic rhinitis", "active", 900]],
    allergies: [["Penicillin", "Skin rash", "moderate"]],
    notes: [
      [7, J, "Incision healing well with no signs of infection. Sutures removed. Advised to avoid heavy lifting for two more weeks."],
      [21, C, "Laparoscopic appendectomy completed without complication. Discharged the same day with wound-care instructions."],
    ],
    prescriptions: [
      ["Acetaminophen", "500 mg", "Every 6 hours as needed", 21, 14, C, "completed", "Take with food."],
      ["Cetirizine", "10 mg", "Once daily", 300, null, J, "active"],
    ],
  },
  "p-002": {
    bloodType: "A+",
    conditions: [["Type 2 diabetes", "active", 1400], ["Hypertension", "monitoring", 800]],
    allergies: [],
    notes: [
      [30, J, "HbA1c 7.4%, down from 8.1%. Continue metformin and reinforce the diet plan. Repeat HbA1c in 3 months."],
      [120, J, "Patient reports occasional fatigue. Fasting glucose elevated. Dose adjusted and dietitian referral made."],
    ],
    prescriptions: [
      ["Metformin", "500 mg", "Twice daily with meals", 1300, null, J, "active", "Do not skip doses."],
      ["Lisinopril", "10 mg", "Once daily", 780, null, J, "active"],
    ],
  },
  "p-003": {
    bloodType: "B+",
    conditions: [["Coronary artery disease", "active", 1800], ["Hypertension", "active", 2500]],
    allergies: [["Sulfa drugs", "Hives", "moderate"]],
    notes: [
      [0, C, "BP stable at 122/78. Continue current medication. Review in 3 months."],
      [95, C, "Mild exertional dyspnea resolved. ECG unchanged from prior. Statin dose maintained."],
    ],
    prescriptions: [
      ["Atorvastatin", "40 mg", "Once daily at night", 1700, null, C, "active"],
      ["Aspirin", "81 mg", "Once daily", 1700, null, C, "active"],
      ["Amlodipine", "5 mg", "Once daily", 900, null, C, "active"],
    ],
  },
  "p-004": {
    bloodType: "AB+",
    conditions: [["Mild persistent asthma", "monitoring", 1000]],
    allergies: [["Peanuts", "Anaphylaxis", "severe"]],
    notes: [
      [60, J, "Routine vaccinations up to date. Asthma well controlled. Parent counselled on trigger avoidance."],
      [150, J, "Growth and development on track. Carries epinephrine auto-injector for peanut allergy."],
    ],
    prescriptions: [
      ["Albuterol inhaler", "90 mcg", "As needed for wheeze", 400, null, J, "active", "Use a spacer."],
      ["Epinephrine auto-injector", "0.15 mg", "Emergency use", 365, null, J, "active", "Carry at all times."],
    ],
  },
  "p-005": {
    bloodType: "O-",
    conditions: [["Hypertension", "active", 600], ["High cholesterol", "monitoring", 500]],
    allergies: [],
    notes: [
      [45, J, "Home BP readings averaging 138/86. Increase amlodipine and recheck in 6 weeks."],
      [110, J, "New diagnosis of hypertension confirmed after repeat readings. Lifestyle changes discussed."],
    ],
    prescriptions: [
      ["Amlodipine", "10 mg", "Once daily", 45, null, J, "active"],
      ["Amlodipine", "5 mg", "Once daily", 110, 45, J, "discontinued", "Replaced by 10 mg dose."],
    ],
  },
  "p-006": {
    bloodType: "A-",
    conditions: [["Distal radius fracture (left)", "monitoring", 42]],
    allergies: [["Latex", "Contact dermatitis", "mild"]],
    notes: [
      [14, C, "X-ray shows good callus formation. Cast removed, wrist splint for 2 more weeks."],
      [42, C, "Closed reduction and casting after a fall. Neurovascular status intact."],
    ],
    prescriptions: [["Ibuprofen", "400 mg", "Every 8 hours as needed", 42, 14, C, "completed", "Take with food."]],
  },
  "p-007": {
    bloodType: "B-",
    conditions: [["Pregnancy, second trimester", "monitoring", 120]],
    allergies: [],
    notes: [
      [28, N, "Anatomy scan normal. Fundal height appropriate for gestation. Continue prenatal vitamins."],
      [56, N, "Routine antenatal visit. BP and urine protein normal. Glucose screening scheduled."],
    ],
    prescriptions: [["Prenatal multivitamin", "1 tablet", "Once daily", 120, null, N, "active"]],
  },
  "p-008": {
    bloodType: "O+",
    conditions: [["Colon cancer, on chemotherapy", "active", 200], ["Hypothyroidism", "monitoring", 2000]],
    allergies: [["Shellfish", "Swelling", "severe"]],
    notes: [
      [16, H, "Cycle 4 tolerated with grade 1 nausea. Neutrophils adequate to proceed. Continue antiemetics."],
      [37, H, "Cycle 3 completed. Mild fatigue, no neuropathy. Weight stable."],
    ],
    prescriptions: [
      ["Ondansetron", "8 mg", "Every 8 hours as needed", 200, null, H, "active"],
      ["Levothyroxine", "75 mcg", "Once daily, morning", 1900, null, H, "active"],
    ],
  },
  "p-009": {
    bloodType: "A+",
    conditions: [["Atypical mole (left shoulder)", "monitoring", 24], ["Eczema", "active", 2200]],
    allergies: [],
    notes: [
      [10, O, "Punch biopsy taken from left shoulder lesion. Wound care explained. Results expected within a week."],
      [60, O, "Dermoscopy showed an irregular pigmented lesion. Biopsy recommended."],
    ],
    prescriptions: [["Hydrocortisone 1% cream", "Thin layer", "Twice daily to affected areas", 200, null, O, "active"]],
  },
};

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const CONDITIONS = [
  "Type 2 diabetes", "Hypertension", "Asthma", "Hypothyroidism", "Osteoarthritis",
  "Migraine", "Anxiety disorder", "High cholesterol", "GERD", "Seasonal allergic rhinitis",
];
const ALLERGIES: AllergyT[] = [
  ["Penicillin", "Skin rash", "moderate"],
  ["Peanuts", "Anaphylaxis", "severe"],
  ["Latex", "Contact dermatitis", "mild"],
  ["Sulfa drugs", "Hives", "moderate"],
  ["Shellfish", "Swelling", "severe"],
];
const MEDICATIONS: [string, string, string][] = [
  ["Metformin", "500 mg", "Twice daily with meals"],
  ["Lisinopril", "10 mg", "Once daily"],
  ["Atorvastatin", "20 mg", "Once daily at night"],
  ["Albuterol inhaler", "90 mcg", "As needed for wheeze"],
  ["Levothyroxine", "50 mcg", "Once daily, morning"],
  ["Omeprazole", "20 mg", "Once daily before breakfast"],
  ["Ibuprofen", "400 mg", "Every 8 hours as needed"],
  ["Amlodipine", "5 mg", "Once daily"],
];
const NOTE_TEXT = [
  "Routine review. Vitals stable and medication adherence is good. No changes to the plan.",
  "Reports mild improvement since the last visit. Continue the current plan and recheck in 4 weeks.",
  "Discussed lifestyle changes (diet, exercise, sleep). Patient understands the plan.",
  "Recent labs reviewed and within the expected range. No change to treatment.",
  "Patient asked about side effects. Reassured and advised to report any new symptoms.",
];

function generateTemplate(patientId: string): Template {
  const rand = mulberry32(hashString(patientId));
  const int = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;
  const sample = <T,>(items: readonly T[], count: number): T[] => {
    const pool = [...items];
    const out: T[] = [];
    while (out.length < count && pool.length > 0) out.push(pool.splice(int(0, pool.length - 1), 1)[0]);
    return out;
  };
  const provider = () => PROVIDERS[int(0, PROVIDERS.length - 1)] as string;

  const conditions: CondT[] = sample(CONDITIONS, int(0, 3)).map((name) => [
    name,
    (["active", "monitoring", "resolved"] as const)[int(0, 2)],
    int(60, 2500),
  ]);

  let daysAgo = int(5, 60);
  const notes: NoteT[] = sample(NOTE_TEXT, int(1, 4)).map((content) => {
    const note: NoteT = [daysAgo, provider(), content];
    daysAgo += int(40, 110);
    return note;
  });

  const prescriptions: RxT[] = sample(MEDICATIONS, int(0, 3)).map(([med, dose, freq]) => {
    const started = int(20, 600);
    const completed = rand() < 0.3;
    return [med, dose, freq, started, completed ? started - int(10, 19) : null, provider(), completed ? "completed" : "active"];
  });

  return {
    bloodType: BLOOD_TYPES[int(0, BLOOD_TYPES.length - 1)],
    conditions,
    allergies: sample(ALLERGIES, rand() < 0.5 ? 0 : int(1, 2)),
    notes,
    prescriptions,
  };
}

export function getMockRecord(patientId: string): PatientRecord {
  return build(patientId, HAND[patientId] ?? generateTemplate(patientId));
}
