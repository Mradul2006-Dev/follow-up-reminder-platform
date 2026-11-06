import { mockServices } from "./mock";
import type { Services } from "./types";

/** Swap this single export for the Supabase/Twilio implementations. */
export const services: Services = mockServices;

export * from "./types";
