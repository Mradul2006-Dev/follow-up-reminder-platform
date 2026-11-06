"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "../ui/Icon";
import { isActive, NAV_ITEMS } from "./nav";

/** Persistent bottom bar on phones (per DESIGN.md). */
export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Primary mobile"
      className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/80 grid grid-cols-4 pb-[env(safe-area-inset-bottom)]"
    >
      {NAV_ITEMS.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${
              active ? "text-slate-900" : "text-slate-500"
            }`}
          >
            <span
              className={`h-7 w-12 rounded-full flex items-center justify-center ${active ? "bg-slate-900 text-white" : ""}`}
            >
              <Icon name={item.icon} filled={active} className="text-xl" />
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
