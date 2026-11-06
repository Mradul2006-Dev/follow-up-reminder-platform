/** Dashboard numbers, always derived from the same patients/follow-ups the tables render. */
import { addDays, MOCK_TODAY } from "./date";
import type { DashboardStats, FollowUp, Patient } from "./types";

export function computeStats(patients: Patient[], followUps: FollowUp[]): DashboardStats {
  const monthPrefix = MOCK_TODAY.slice(0, 7);
  const newPatientsThisMonth = patients.filter((p) => p.createdAt.startsWith(monthPrefix)).length;
  const before = patients.length - newPatientsThisMonth;
  const growthPct = before > 0 ? Math.round((newPatientsThisMonth / before) * 100) : 0;

  const today = followUps.filter((f) => f.date === MOCK_TODAY);
  const windowEnd = addDays(MOCK_TODAY, 7);

  return {
    totalPatients: patients.length,
    newPatientsThisMonth,
    growthPct,
    todayTotal: today.length,
    // A visited patient had confirmed, so "Confirmed" counts both (keeps tab counts = All).
    todayConfirmed: today.filter((f) => f.status === "confirmed" || f.status === "visited").length,
    todayPending: today.filter((f) => f.status === "scheduled").length,
    todayMissed: today.filter((f) => f.status === "missed").length,
    upcomingCount: followUps.filter((f) => f.date > MOCK_TODAY && f.date <= windowEnd).length,
    missedCount: followUps.filter((f) => f.status === "missed" && f.date <= MOCK_TODAY).length,
  };
}
