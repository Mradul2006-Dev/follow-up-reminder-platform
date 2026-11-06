"use client";

import type { ReactNode } from "react";
import { StoreProvider } from "@/lib/store/store";
import { ModalsProvider } from "./modals/ModalsProvider";
import { SearchProvider } from "./layout/search";
import { ToastProvider } from "./ui/Toast";

/** Order matters: the store raises toasts, modals read the store. */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <StoreProvider>
        <SearchProvider>
          <ModalsProvider>{children}</ModalsProvider>
        </SearchProvider>
      </StoreProvider>
    </ToastProvider>
  );
}
