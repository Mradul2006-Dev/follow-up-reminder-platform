import { formatDateLong } from "@/lib/date";
import type { Allergy, Condition, PatientRecord } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { Pill } from "@/components/ui/StatusBadge";

const CONDITION_TONE: Record<Condition["status"], "amber" | "slate" | "emerald"> = {
  active: "amber",
  monitoring: "slate",
  resolved: "emerald",
};
const ALLERGY_TONE: Record<Allergy["severity"], "rose" | "amber" | "slate"> = {
  severe: "rose",
  moderate: "amber",
  mild: "slate",
};
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function Heading({ children }: { children: React.ReactNode }) {
  return <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">{children}</h3>;
}

export function MedicalHistoryCard({ record }: { record: PatientRecord }) {
  return (
    <Card title="Medical history" icon="medical_information">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Heading>Conditions</Heading>
          {record.conditions.length === 0 ? (
            <p className="text-xs text-slate-500">No conditions on record.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {record.conditions.map((c) => (
                <li key={c.id} className="py-2.5 first:pt-0 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900">{c.name}</p>
                    <p className="text-[11px] text-slate-500">Since {formatDateLong(c.since)}</p>
                  </div>
                  <Pill tone={CONDITION_TONE[c.status]}>{cap(c.status)}</Pill>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <Heading>Allergies</Heading>
          {record.allergies.length === 0 ? (
            <p className="text-xs text-slate-500">No known allergies.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {record.allergies.map((a) => (
                <li key={a.id} className="py-2.5 first:pt-0 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                      {a.severity === "severe" && <Icon name="warning" filled className="text-sm text-rose-600" />}
                      {a.substance}
                    </p>
                    <p className="text-[11px] text-slate-500">{a.reaction}</p>
                  </div>
                  <Pill tone={ALLERGY_TONE[a.severity]}>{cap(a.severity)}</Pill>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Card>
  );
}
