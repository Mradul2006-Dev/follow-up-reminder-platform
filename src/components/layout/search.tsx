"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";

interface SearchApi {
  query: string;
  setQuery: (q: string) => void;
}

const SearchContext = createContext<SearchApi | null>(null);

/** The header search box drives whichever list the current page shows. Cleared on navigation. */
export function SearchProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState("");
  const pathname = usePathname();

  useEffect(() => setQuery(""), [pathname]);

  const value = useMemo(() => ({ query, setQuery }), [query]);
  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

export function useSearch(): SearchApi {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error("useSearch must be used within SearchProvider");
  return ctx;
}
