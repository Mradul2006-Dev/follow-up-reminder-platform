"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { MobileNav } from "./MobileNav";
import { Sidebar } from "./Sidebar";

export function AppShell({ children }: { children: ReactNode }) {
  const [navOpen, setNavOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setNavOpen(false), [pathname]);

  return (
    <div className="min-h-screen">
      <Sidebar open={navOpen} onClose={() => setNavOpen(false)} />
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <Header onMenu={() => setNavOpen(true)} />
        <main className="p-4 md:p-8 pb-24 md:pb-8 max-w-7xl mx-auto w-full flex flex-col gap-6">{children}</main>
      </div>
      <MobileNav />
    </div>
  );
}
