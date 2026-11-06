export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard", title: "Clinical Follow-ups" },
  { href: "/patients", label: "Patients", icon: "group", title: "Patients" },
  { href: "/follow-ups", label: "Follow-ups", icon: "edit_calendar", title: "Follow-ups" },
  { href: "/settings", label: "Settings", icon: "settings", title: "Settings" },
] as const;

export function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
