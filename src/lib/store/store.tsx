"use client";

/**
 * Single client-side store. Components read state and call actions from here; actions go through
 * lib/services (mock today, Supabase/Twilio later). This is the only place that mutates data.
 *
 * Integration note: initial state is seeded synchronously from mock data. With Supabase, load it
 * in a server component / effect and pass it in as the initial value (add loading states then).
 */
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { useToast } from "@/components/ui/Toast";
import { MOCK_TODAY } from "../date";
import { applyStatus, buildFollowUp } from "../followups";
import { seedFollowUps, seedPatients, seedSettings } from "../mock-data";
import { services } from "../services";
import { computeStats } from "../stats";
import type {
  ClinicSettings,
  DashboardStats,
  FollowUp,
  FollowUpStatus,
  NewFollowUpInput,
  NewPatientInput,
  Patient,
} from "../types";

interface Store {
  patients: Patient[];
  followUps: FollowUp[];
  settings: ClinicSettings;
  patientsById: Map<string, Patient>;
  stats: DashboardStats;
  addPatient: (input: NewPatientInput) => Promise<Patient>;
  setPatientConsent: (id: string, consent: boolean) => Promise<void>;
  scheduleFollowUp: (input: NewFollowUpInput) => Promise<FollowUp>;
  rescheduleFollowUp: (id: string, input: NewFollowUpInput) => Promise<void>;
  setFollowUpStatus: (id: string, status: FollowUpStatus) => Promise<void>;
  sendReminder: (id: string, kind?: "reminder24h" | "reminder2h" | "missed") => Promise<void>;
  saveSettings: (settings: ClinicSettings) => Promise<void>;
}

const StoreContext = createContext<Store | null>(null);

/** "(415) 555-0123" / "0415 555 0123" -> "4155550123" */
export function normalizeLocalNumber(raw: string): string {
  return raw.replace(/\D/g, "").replace(/^0+/, "");
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [patients, setPatients] = useState<Patient[]>(seedPatients);
  const [followUps, setFollowUps] = useState<FollowUp[]>(seedFollowUps);
  const [settings, setSettings] = useState<ClinicSettings>(seedSettings);

  const patientsById = useMemo(() => new Map(patients.map((p) => [p.id, p])), [patients]);
  const stats = useMemo(() => computeStats(patients, followUps), [patients, followUps]);

  const addPatient = useCallback(
    async (input: NewPatientInput) => {
      const existing = new Set(patients.map((p) => p.mrn));
      let mrn = input.mrn?.trim().toUpperCase() ?? "";
      while (!mrn || (existing.has(mrn) && !input.mrn)) {
        mrn = `MRN-${Math.floor(100000 + Math.random() * 900000)}`;
      }
      const { countryCode, phone, ...rest } = input;
      const created = await services.patients.create({
        ...rest,
        name: input.name.trim(),
        mrn,
        phone: `${countryCode}${normalizeLocalNumber(phone)}`,
        consentAt: input.whatsappOptIn ? MOCK_TODAY : undefined,
      });
      setPatients((prev) => [created, ...prev]);
      toast(`${created.name} added to patients`);
      return created;
    },
    [patients, toast],
  );

  const setPatientConsent = useCallback(
    async (id: string, consent: boolean) => {
      const current = patientsById.get(id);
      if (!current) return;
      const next: Patient = { ...current, whatsappOptIn: consent, consentAt: consent ? MOCK_TODAY : undefined };
      await services.patients.save(next);
      setPatients((prev) => prev.map((p) => (p.id === id ? next : p)));
      toast(consent ? `WhatsApp consent recorded for ${next.name}` : `WhatsApp consent revoked for ${next.name}`, "info");
    },
    [patientsById, toast],
  );

  const scheduleFollowUp = useCallback(
    async (input: NewFollowUpInput) => {
      const created = await services.followUps.save(buildFollowUp(input, `fu-${crypto.randomUUID()}`));
      setFollowUps((prev) => [...prev, created]);
      toast("Follow-up scheduled");
      return created;
    },
    [toast],
  );

  const rescheduleFollowUp = useCallback(
    async (id: string, input: NewFollowUpInput) => {
      const current = followUps.find((f) => f.id === id);
      if (!current) return;
      // A new slot restarts the cycle: back to "scheduled" unless it is still the same slot.
      const sameSlot = current.date === input.date && current.time === input.time;
      const next: FollowUp = sameSlot ? { ...current, ...input } : applyStatus({ ...current, ...input }, "scheduled");
      await services.followUps.save(next);
      setFollowUps((prev) => prev.map((f) => (f.id === id ? next : f)));
      toast("Follow-up updated");
    },
    [followUps, toast],
  );

  const setFollowUpStatus = useCallback(
    async (id: string, status: FollowUpStatus) => {
      const current = followUps.find((f) => f.id === id);
      if (!current || current.status === status) return;
      const next = applyStatus(current, status);
      await services.followUps.save(next);
      setFollowUps((prev) => prev.map((f) => (f.id === id ? next : f)));
      const name = patientsById.get(current.patientId)?.name ?? "Patient";
      toast(status === "visited" ? `${name} marked as visited` : `${name} set to ${status}`);
    },
    [followUps, patientsById, toast],
  );

  const sendReminder = useCallback(
    async (id: string, kind: "reminder24h" | "reminder2h" | "missed" = "reminder24h") => {
      const current = followUps.find((f) => f.id === id);
      if (!current) return;
      const patient = patientsById.get(current.patientId);
      if (!patient?.whatsappOptIn) {
        toast("This patient has not given WhatsApp consent", "error");
        return;
      }
      const { queuedAt } = await services.whatsapp.sendReminder({ followUpId: id, kind });
      setFollowUps((prev) => prev.map((f) => (f.id === id ? { ...f, lastReminderAt: queuedAt } : f)));
      toast(`WhatsApp reminder queued for ${patient.name} (demo, nothing is sent)`, "info");
    },
    [followUps, patientsById, toast],
  );

  const saveSettings = useCallback(
    async (next: ClinicSettings) => {
      const saved = await services.settings.save(next);
      setSettings(saved);
      toast("Settings saved");
    },
    [toast],
  );

  const value = useMemo<Store>(
    () => ({
      patients,
      followUps,
      settings,
      patientsById,
      stats,
      addPatient,
      setPatientConsent,
      scheduleFollowUp,
      rescheduleFollowUp,
      setFollowUpStatus,
      sendReminder,
      saveSettings,
    }),
    [
      patients,
      followUps,
      settings,
      patientsById,
      stats,
      addPatient,
      setPatientConsent,
      scheduleFollowUp,
      rescheduleFollowUp,
      setFollowUpStatus,
      sendReminder,
      saveSettings,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
