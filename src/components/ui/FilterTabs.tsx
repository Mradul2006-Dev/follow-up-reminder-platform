interface Tab<T extends string> {
  value: T;
  label: string;
  count?: number;
}

interface FilterTabsProps<T extends string> {
  tabs: Tab<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
}

/** Segmented control from the Stitch table header. */
export function FilterTabs<T extends string>({ tabs, value, onChange, ariaLabel }: FilterTabsProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="inline-flex p-1 bg-slate-100/80 rounded-lg text-xs font-medium text-slate-600 max-w-full overflow-x-auto"
    >
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.value)}
            className={`px-3 py-1 rounded-md whitespace-nowrap transition-all ${
              active ? "bg-white text-slate-900 font-semibold shadow-xs" : "hover:text-slate-900 text-slate-600"
            }`}
          >
            {tab.label}
            {tab.count !== undefined && ` (${tab.count})`}
          </button>
        );
      })}
    </div>
  );
}
