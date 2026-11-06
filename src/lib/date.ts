/**
 * Date helpers. All dates are plain "YYYY-MM-DD" strings and times are "HH:mm",
 * so server and client render identically (no timezone/hydration drift).
 *
 * MOCK_TODAY pins the demo to the date shown in the Stitch design.
 * Replace with the real current date when the backend is connected.
 */
export const MOCK_TODAY = "2025-10-24";
export const MOCK_NOW_HHMM = "18:00";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const pad = (n: number) => String(n).padStart(2, "0");

function parseDate(d: string): Date {
  const [y, m, day] = d.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, day));
}

export function addDays(date: string, days: number): string {
  const dt = parseDate(date);
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

/** "14:05" -> "02:05 PM" */
export function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  return `${pad(h % 12 || 12)}:${pad(m)} ${h >= 12 ? "PM" : "AM"}`;
}

/** "2025-10-26" -> "Oct 26" */
export function formatShortDate(date: string): string {
  const dt = parseDate(date);
  return `${MONTHS[dt.getUTCMonth()]} ${dt.getUTCDate()}`;
}

/** "Today" / "Tomorrow" / "Oct 26" */
export function formatDayLabel(date: string): string {
  if (date === MOCK_TODAY) return "Today";
  if (date === addDays(MOCK_TODAY, 1)) return "Tomorrow";
  return formatShortDate(date);
}

/** "Tomorrow, 10:00 AM" / "Oct 26, 09:00 AM" */
export function formatDateTime(date: string, time: string): string {
  return `${formatDayLabel(date)}, ${formatTime(time)}`;
}

export function formatHeaderDate(): string {
  const dt = parseDate(MOCK_TODAY);
  return `Today, ${MONTHS[dt.getUTCMonth()]} ${dt.getUTCDate()}, ${dt.getUTCFullYear()}`;
}

/** Real wall-clock time, used when a visit is logged. */
export function currentTimeHHmm(): string {
  const n = new Date();
  return `${pad(n.getHours())}:${pad(n.getMinutes())}`;
}

function toMinutes(date: string, time: string): number {
  const [h, m] = time.split(":").map(Number);
  return parseDate(date).getTime() / 60000 + h * 60 + m;
}

/** Hours from the mock "now" to the given moment (negative if in the past). */
export function hoursFromNow(date: string, time: string, offsetHours = 0): number {
  return (toMinutes(date, time) - offsetHours * 60 - toMinutes(MOCK_TODAY, MOCK_NOW_HHMM)) / 60;
}
