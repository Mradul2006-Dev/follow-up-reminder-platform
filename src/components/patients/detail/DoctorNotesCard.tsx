"use client";

import { useState } from "react";
import { formatDateLong } from "@/lib/date";
import type { DoctorNote } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

const INITIAL = 3;

export function DoctorNotesCard({ notes }: { notes: DoctorNote[] }) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? notes : notes.slice(0, INITIAL);

  return (
    <Card title="Doctor's notes" icon="clinical_notes" action={<span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{notes.length}</span>}>
      {notes.length === 0 ? (
        <EmptyState icon="note_alt" title="No notes yet" hint="Notes recorded by clinicians will appear here." />
      ) : (
        <>
          <ul className="divide-y divide-slate-100">
            {visible.map((n) => (
              <li key={n.id} className="py-3.5 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-bold text-slate-900">{n.author}</span>
                  <span className="text-[11px] text-slate-500 tabular-nums">{formatDateLong(n.date)}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mt-1.5">{n.content}</p>
              </li>
            ))}
          </ul>
          {notes.length > INITIAL && (
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className="mt-3 pt-3 border-t border-slate-100 w-full text-xs font-semibold text-slate-700 hover:text-slate-900"
            >
              {showAll ? "Show fewer notes" : `Show all ${notes.length} notes`}
            </button>
          )}
        </>
      )}
    </Card>
  );
}
