import Link from "next/link";
import { Icon } from "../ui/Icon";

export function AutomationCard({ enabled }: { enabled: boolean }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center border flex-shrink-0 ${
            enabled ? "bg-emerald-50 text-emerald-700 border-emerald-200/50" : "bg-slate-100 text-slate-500 border-slate-200"
          }`}
        >
          <Icon name="forum" className="text-base" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-slate-900">
            WhatsApp Automation {enabled ? "Active" : "Paused"}
          </span>
          <span className="text-[11px] text-slate-500">
            {enabled ? "Templates deliver interactive one-tap confirm" : "No reminders are being sent"}
          </span>
        </div>
      </div>
      <Link href="/settings" className="text-xs font-medium text-teal-700 hover:text-teal-900 flex-shrink-0">
        Settings
      </Link>
    </div>
  );
}
