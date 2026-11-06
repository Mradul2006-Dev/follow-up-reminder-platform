import { Icon } from "./Icon";

export function EmptyState({ icon = "search_off", title, hint }: { icon?: string; title: string; hint?: string }) {
  return (
    <div className="py-14 px-6 flex flex-col items-center text-center">
      <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center mb-3">
        <Icon name={icon} className="text-xl" />
      </div>
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      {hint && <p className="text-xs text-slate-500 mt-1 max-w-xs">{hint}</p>}
    </div>
  );
}
