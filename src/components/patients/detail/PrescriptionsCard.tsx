import { formatDateLong } from "@/lib/date";
import type { Prescription } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pill } from "@/components/ui/StatusBadge";

const TONE: Record<Prescription["status"], "emerald" | "slate" | "rose"> = {
  active: "emerald",
  completed: "slate",
  discontinued: "rose",
};
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const period = (rx: Prescription) =>
  `${formatDateLong(rx.startDate)} – ${rx.endDate ? formatDateLong(rx.endDate) : "Ongoing"}`;

export function PrescriptionsCard({ prescriptions }: { prescriptions: Prescription[] }) {
  // Active first, then most recently started.
  const sorted = [...prescriptions].sort(
    (a, b) => Number(b.status === "active") - Number(a.status === "active") || b.startDate.localeCompare(a.startDate),
  );
  const activeCount = prescriptions.filter((p) => p.status === "active").length;

  return (
    <Card
      title="Prescriptions"
      icon="medication"
      action={<span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{activeCount} active</span>}
    >
      {sorted.length === 0 ? (
        <EmptyState icon="medication" title="No prescriptions" hint="Medications prescribed to this patient will be listed here." />
      ) : (
        <>
          {/* Tablet / desktop */}
          <div className="hidden md:block overflow-x-auto -mx-5 -my-5">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-semibold">
                  <th className="py-3 px-5">Medication</th>
                  <th className="py-3 px-3">Dosage &amp; frequency</th>
                  <th className="py-3 px-3">Period</th>
                  <th className="py-3 px-3">Prescribed by</th>
                  <th className="py-3 px-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {sorted.map((rx) => (
                  <tr key={rx.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-5">
                      <span className="font-semibold text-slate-900 block">{rx.medication}</span>
                      {rx.instructions && <span className="text-[11px] text-slate-500">{rx.instructions}</span>}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="font-medium text-slate-900 block">{rx.dosage}</span>
                      <span className="text-[11px] text-slate-500">{rx.frequency}</span>
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap tabular-nums text-[11px] text-slate-600">{period(rx)}</td>
                    <td className="py-3.5 px-3 whitespace-nowrap">{rx.prescribedBy}</td>
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <Pill tone={TONE[rx.status]}>{cap(rx.status)}</Pill>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Phone */}
          <ul className="md:hidden divide-y divide-slate-100">
            {sorted.map((rx) => (
              <li key={rx.id} className="py-3.5 first:pt-0 last:pb-0 flex flex-col gap-1.5">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-xs font-semibold text-slate-900">{rx.medication}</span>
                  <Pill tone={TONE[rx.status]}>{cap(rx.status)}</Pill>
                </div>
                <p className="text-xs text-slate-700">
                  {rx.dosage} · {rx.frequency}
                </p>
                {rx.instructions && <p className="text-[11px] text-slate-500">{rx.instructions}</p>}
                <p className="text-[11px] text-slate-500 tabular-nums">
                  {period(rx)} · {rx.prescribedBy}
                </p>
              </li>
            ))}
          </ul>
        </>
      )}
    </Card>
  );
}
