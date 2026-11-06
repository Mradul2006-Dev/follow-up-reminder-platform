"use client";

import { useCallback, useEffect, useState } from "react";
import { services } from "../services";
import type { PatientRecord } from "../types";

type State =
  | { status: "loading"; record: null }
  | { status: "ready"; record: PatientRecord | null }
  | { status: "error"; record: null };

/**
 * Loads a patient's clinical record through the service layer.
 * Already async with loading/error/retry, so swapping the mock service for an API needs no UI changes.
 */
export function usePatientRecord(patientId: string) {
  const [state, setState] = useState<State>({ status: "loading", record: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading", record: null });
    services.records
      .getByPatientId(patientId)
      .then((record) => !cancelled && setState({ status: "ready", record }))
      .catch(() => !cancelled && setState({ status: "error", record: null }));
    return () => {
      cancelled = true;
    };
  }, [patientId, attempt]);

  const retry = useCallback(() => setAttempt((a) => a + 1), []);
  return { ...state, retry };
}
