/** In-memory implementations. They persist nothing; a page refresh resets the demo data. */
import { MOCK_TODAY } from "../date";
import type { Services } from "./types";

export const mockServices: Services = {
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
