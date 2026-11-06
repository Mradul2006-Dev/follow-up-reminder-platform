"use client";

import { usePathname } from "next/navigation";
import { formatHeaderDate } from "@/lib/date";
import { useStore } from "@/lib/store/store";
import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";
import { useModals } from "../modals/ModalsProvider";
import { isActive, NAV_ITEMS } from "./nav";
import { useSearch } from "./search";

export function Header({ onMenu }: { onMenu: () => void }) {
  const pathname = usePathname();
  const { query, setQuery } = useSearch();
  const { settings } = useStore();
  const { openAddPatient, openSchedule } = useModals();

  const title = NAV_ITEMS.find((n) => isActive(pathname, n.href))?.title ?? "Clinical Follow-ups";
  const searchable = pathname !== "/settings";

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 px-4 md:px-8 py-3 lg:py-0 lg:h-16 flex flex-wrap lg:flex-nowrap items-center justify-between gap-x-6 gap-y-3">
      {/* Title & date */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onMenu}
          aria-label="Open navigation"
          className="lg:hidden h-9 w-9 -ml-1.5 rounded-lg hover:bg-slate-100 text-slate-600 flex items-center justify-center"
        >
          <Icon name="menu" className="text-xl" />
        </button>
        <h1 className="font-display text-lg font-bold text-slate-900 tracking-tight whitespace-nowrap">{title}</h1>
        <span className="hidden md:block h-4 w-px bg-slate-200" />
        <span className="hidden md:flex text-xs font-medium text-slate-500 items-center gap-1.5 whitespace-nowrap">
          <Icon name="calendar_today" className="text-sm text-slate-400" />
          {formatHeaderDate()}
        </span>
      </div>

      {/* Search + credits + actions */}
      <div className="contents lg:flex lg:items-center lg:gap-3">
        {searchable && (
          <div className="relative order-last lg:order-none w-full lg:w-72">
            <Icon name="search" className="absolute left-3 top-2 text-slate-400 text-lg" />
            <input
              id="searchInput"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search patient, MRN, phone..."
              aria-label="Search patient, MRN or phone"
              className="w-full h-9 pl-9 pr-3 bg-slate-50 border border-slate-200/70 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all"
            />
          </div>
        )}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50/70 border border-emerald-200/50 rounded-lg text-emerald-800 text-xs font-medium whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-whatsapp" />
          <span>{settings.creditsRemaining.toLocaleString("en-US")} WA credits</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" icon="person_add" onClick={openAddPatient} aria-label="Add Patient">
            <span className="hidden sm:inline">Add Patient</span>
          </Button>
          <Button icon="add" onClick={() => openSchedule()} aria-label="Schedule Follow-up">
            <span className="hidden sm:inline">Schedule Follow-up</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
