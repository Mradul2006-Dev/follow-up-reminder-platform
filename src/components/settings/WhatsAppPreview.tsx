import { Icon } from "../ui/Icon";

interface Props {
  text: string;
  /** Quick-reply buttons rendered under the bubble. */
  actions: string[];
}

/** Outgoing WhatsApp bubble (#DCF8C6) with read receipt, per DESIGN.md. */
export function WhatsAppPreview({ text, actions }: Props) {
  return (
    <div className="rounded-2xl bg-slate-100/80 border border-slate-200/70 p-4">
      <div className="max-w-[300px] ml-auto">
        <div className="bg-[#DCF8C6] rounded-xl rounded-tr-sm px-3 py-2 shadow-xs">
          <p className="text-[13px] text-slate-800 leading-snug whitespace-pre-wrap break-words">{text}</p>
          <div className="flex items-center justify-end gap-0.5 mt-1 text-[10px] text-slate-500">
            <span>09:00 AM</span>
            <Icon name="done_all" className="text-sm text-[#38BDF8]" />
          </div>
        </div>
        {actions.map((label) => (
          <div
            key={label}
            className="mt-1 bg-white rounded-lg text-center text-[13px] font-medium text-sky-600 py-1.5 shadow-xs"
          >
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
