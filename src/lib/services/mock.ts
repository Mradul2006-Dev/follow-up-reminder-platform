/** In-memory implementations. They persist nothing; a page refresh resets the demo data. */
import { MOCK_TODAY } from "../date";
import { getMockRecord } from "../mock-records";
import type { Services } from "./types";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockServices: Services = {
  records: {
    // The short delay mimics a network call so loading states are exercised.
    async getByPatientId(patientId) {
      await delay(150);
      return getMockRecord(patientId);
    },
  },
  patients: {
    async create(payload) {
      return { id: `p-${crypto.randomUUID()}`, createdAt: MOCK_TODAY, ...payload };
    },
    async save(patient) {
      return patient;
    },
  },
  followUps: {
    async save(followUp) {
      return followUp;
    },
  },
  whatsapp: {
    // Real version: server-side Twilio call using a pre-approved template. No messages are sent here.
    async sendReminder() {
      return { queuedAt: new Date().toISOString() };
    },
  },
  settings: {
    async save(settings) {
      return settings;
    },
  },
};
