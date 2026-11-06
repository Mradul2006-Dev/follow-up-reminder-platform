"use client";

import { STATUS_META } from "@/lib/constants";
import type { FollowUpRow } from "@/lib/followups";
import { useStore } from "@/lib/store/store";
import type { FollowUpStatus } from "@/lib/types";
import { useModals } from "../modals/ModalsProvider";
import { Button, IconButton } from "../ui/Button";
import { Dropdown, type MenuItem } from "../ui/Dropdown";
import { useToast } from "../ui/Toast";

const STATUS_ORDER: FollowUpStatus[] = ["scheduled", "confirmed", "visited", "missed"];

/** The "Quick Action" cell: primary action depends on status, plus a menu for status changes. */
export function FollowUpActions({ row }: { row: FollowUpRow }) {
  const { followUp, patient } = row;
  const { setFollowUpStatus, sendReminder } = useStore();
  const { openSchedule, openSummary } = useModals();
  const { toast } = useToast();

  const openChat = () => toast("WhatsApp chat opens here once Twilio is connected (backend phase).", "info");

  const menu: MenuItem[] = [
    ...STATUS_ORDER.map((s) => ({
      label: `Mark as ${STATUS_META[s].label}`,
      icon: s === "visited" ? "check_circle" : s === "missed" ? "person_off" : s === "confirmed" ? "done_all" : "schedule",
      active: followUp.status === s,
      disabled: followUp.status === s,
      onSelect: () => void setFollowUpStatus(followUp.id, s),
    })),
    {
      label: "Resend WhatsApp reminder",
      icon: "send",
      separated: true,
      disabled: followUp.status === "visited",
      onSelect: () => void sendReminder(followUp.id, followUp.status === "missed" ? "missed" : "reminder24h"),
    },
    { label: "Open WhatsApp chat", icon: "chat", onSelect: openChat },
    {
      label: "Reschedule…",
      icon: "edit_calendar",
      separated: true,
      onSelect: () => openSchedule({ followUp }),
    },
  ];

  return (
    <div className="inline-flex items-center gap-1.5">
      {followUp.status === "confirmed" && (
        <>
          <Button size="sm" icon="check_circle" onClick={() => void setFollowUpStatus(followUp.id, "visited")}>
            Mark Visited
          </Button>
          <IconButton icon="chat" label="Open WhatsApp chat" onClick={openChat} className="hidden 2xl:flex" />
        </>
      )}
      {followUp.status === "scheduled" && (
        <Button size="sm" variant="secondary" icon="send" onClick={() => void sendReminder(followUp.id)}>
          Resend WA
        </Button>
      )}
      {followUp.status === "visited" && (
        <>
          <span className="hidden 2xl:inline text-[11px] text-slate-400 font-medium mr-1">Completed</span>
          <Button size="sm" variant="ghost" icon="description" onClick={() => openSummary(followUp, patient)}>
            Summary
          </Button>
        </>
      )}
      {followUp.status === "missed" && (
        <Button
          size="sm"
          variant="danger"
          icon="schedule_send"
          onClick={() => openSchedule({ patientId: patient.id, protocol: followUp.protocol })}
        >
          Re-engage
        </Button>
      )}
      <Dropdown items={menu} />
    </div>
  );
}
