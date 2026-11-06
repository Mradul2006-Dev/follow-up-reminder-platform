"use client";

import { formatDateTime, formatTime } from "@/lib/date";
import { useStore } from "@/lib/store/store";
import type { FollowUp, Patient } from "@/lib/types";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { StatusBadge } from "../ui/StatusBadge";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 text-xs">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-slate-900 font-medium text-right">{children}</dd>
    </div>
  );
}

export function VisitSummaryModal({ followUp, patient, onClose }: { followUp: FollowUp; patient: Patient; onClose: () => void }) {
  const { followUps, setFollowUpStatus } = useStore();
  // Read the live record so the badge reflects status changes made from this dialog.
  const live = followUps.find((f) => f.id === followUp.id) ?? followUp;

  return (
    <Modal
      open
      onClose={onClose}
      title="Visit summary"
      description={`${patient.name} · ${patient.mrn}`}
      footer={
        <>
          {live.status === "visited" && (
            <Button variant="secondary" onClick={() => void setFollowUpStatus(live.id, "confirmed")} icon="undo">
              Revert to Confirmed
            </Button>
          )}
          <Button onClick={onClose}>Close</Button>
        </>
      }
    >
      <dl className="divide-y divide-slate-100">
        <Row label="Status">
          <StatusBadge status={live.status} />
        </Row>
        <Row label="Visit">{live.protocol}</Row>
        <Row label="Provider">{live.provider}</Row>
        <Row label="Department">{live.department}</Row>
        <Row label="Scheduled">{formatDateTime(live.date, live.time)}</Row>
        {live.loggedAt && <Row label="Logged at">{formatTime(live.loggedAt)}</Row>}
      </dl>
      <div className="mt-4">
        <p className="text-xs font-semibold text-slate-900 mb-1.5">Clinical notes</p>
        <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 border border-slate-100 rounded-lg p-3">
          {live.notes ?? "No notes were recorded for this visit."}
        </p>
      </div>
    </Modal>
  );
}
