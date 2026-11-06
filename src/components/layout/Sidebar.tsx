"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store/store";
import { Icon } from "../ui/Icon";
import { isActive, NAV_ITEMS } from "./nav";

interface SidebarProps {
  /** Below lg the sidebar is a slide-over drawer. */
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { stats, settings } = useStore();

  const badge = (href: string) => {
    if (href === "/patients") return stats.totalPatients.toLocaleString("en-US");
    if (href === "/follow-ups") return String(stats.todayTotal);
    return null;
  };

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-slate-900/45 backdrop-blur-sm lg:hidden" onClick={onClose} aria-hidden="true" />}
      <aside
        className={`fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between z-50 transition-transform duration-200 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Primary"
      >
        <div>
          {/* Brand */}
          <div className="h-16 flex items-center px-5 border-b border-slate-100">
            <Link href="/dashboard" onClick={onClose} className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-whatsapp flex items-center justify-center">
                <Icon name="ecg" className="text-lg" />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-slate-900 text-[15px] tracking-tight flex items-center gap-1.5">
                  RemindPulse
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200/60">
                    MD
                  </span>
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-1 p-3 mt-2">
            {NAV_ITEMS.map((item) => {
              const active = isActive(pathname, item.href);
              const count = badge(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  aria-current={active ? "page" : undefined}
                  className={
                    active
                      ? "flex items-center gap-3 px-3 py-2.5 rounded-lg bg-slate-900 text-white font-medium text-sm transition-all shadow-sm"
                      : "flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 font-medium text-sm transition-colors group"
                  }
                >
                  <Icon
                    name={item.icon}
                    filled={active}
                    className={`text-lg ${active ? "" : "text-slate-400 group-hover:text-slate-700"}`}
                  />
                  <span>{item.label}</span>
                  {count &&
                    (item.href === "/follow-ups" ? (
                      <span
                        className={`ml-auto text-[11px] font-semibold px-1.5 py-0.5 rounded-full border ${
                          active
                            ? "bg-white/15 text-white border-white/20"
                            : "bg-teal-50 text-teal-700 border-teal-200/50"
                        }`}
                      >
                        {count}
                      </span>
                    ) : (
                      <span className={`ml-auto text-xs font-normal ${active ? "text-slate-300" : "text-slate-400"}`}>
                        {count}
                      </span>
                    ))}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* System channel & user */}
        <div className="p-3 border-t border-slate-100 flex flex-col gap-2">
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 border border-slate-200/60">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                {settings.apiStatus.online && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                )}
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${settings.apiStatus.online ? "bg-whatsapp" : "bg-rose-500"}`}
                />
              </span>
              <span className="text-[12px] font-medium text-slate-600">WhatsApp API</span>
            </div>
            <span className={`text-[11px] font-semibold ${settings.apiStatus.online ? "text-emerald-700" : "text-rose-700"}`}>
              {settings.apiStatus.online ? `Online ${settings.apiStatus.uptimePct}%` : "Offline"}
            </span>
          </div>

          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-200/60">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="Dr. Sarah Jenkins"
              className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 bg-slate-100"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCt6l17_u2y6O-merCd7rvHBDhr2AjWrZDj8kB5aRftpHYF2rEym7bc-QT_A_GmjG8QZ8535z_C9P25rgF8A--lwR8VCpeGTtV0ue0wE1tr3HceMgiAFt1PfTs6g187D02VL9LajeJSK585mZlAv2pO-avvaE1mheh7BElkGcJIKNm_vS3pfD9VRO_4uxrQSEF3kMO6ep6iOc1Ol1pOm4S5YwC19JLOLZPdHSV1KS-C"
            />
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-semibold text-slate-900 truncate leading-tight">Dr. Sarah Jenkins</span>
              <span className="text-[11px] text-slate-500 truncate leading-tight">{settings.clinicName}</span>
            </div>
            <Icon name="unfold_more" className="text-slate-400 text-sm" />
          </div>
        </div>
      </aside>
    </>
  );
}
