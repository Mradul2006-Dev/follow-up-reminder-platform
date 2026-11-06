"use client";

import { useEffect, useState } from "react";

/** Paginates an array. `resetKey` sends the user back to page 1 when filters/search change. */
export function usePagination<T>(items: T[], pageSize: number, resetKey: string) {
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));

  useEffect(() => setPage(1), [resetKey]);

  const current = Math.min(page, pageCount);
  const pageItems = items.slice((current - 1) * pageSize, current * pageSize);
  return { page: current, setPage, pageCount, pageItems };
}

function pageNumbers(page: number, count: number): (number | "…")[] {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1);
  const set = new Set([1, count, page - 1, page, page + 1]);
  const nums = [...set].filter((n) => n >= 1 && n <= count).sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  nums.forEach((n, i) => {
    if (i > 0 && n - nums[i - 1] > 1) out.push("…");
    out.push(n);
  });
  return out;
}

interface PaginationProps {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, pageCount, onChange }: PaginationProps) {
  if (pageCount <= 1) return null;
  return (
    <nav className="flex items-center gap-1" aria-label="Pagination">
      <button
        type="button"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        className="px-2.5 py-1 rounded border border-slate-200 bg-white text-slate-600 disabled:opacity-50 hover:bg-slate-50"
      >
        Previous
      </button>
      {pageNumbers(page, pageCount).map((n, i) =>
        n === "…" ? (
          <span key={`gap-${i}`} className="px-1 text-slate-400">
            …
          </span>
        ) : (
          <button
            key={n}
            type="button"
            aria-current={n === page ? "page" : undefined}
            onClick={() => onChange(n)}
            className={
              n === page
                ? "px-2.5 py-1 rounded bg-slate-900 text-white font-medium"
                : "px-2.5 py-1 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }
          >
            {n}
          </button>
        ),
      )}
      <button
        type="button"
        disabled={page === pageCount}
        onClick={() => onChange(page + 1)}
        className="px-2.5 py-1 rounded border border-slate-200 bg-white text-slate-600 disabled:opacity-50 hover:bg-slate-50"
      >
        Next
      </button>
    </nav>
  );
}

interface TableFooterProps extends PaginationProps {
  shown: number;
  total: number;
  noun: string;
}

/** The grey footer strip under each table: "Showing 5 of 28 patients scheduled today". */
export function TableFooter({ shown, total, noun, ...pagination }: TableFooterProps) {
  return (
    <div className="p-4 bg-slate-50/60 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
      <span>
        Showing <strong className="text-slate-800 font-semibold">{shown}</strong> of{" "}
        <strong className="text-slate-800 font-semibold">{total}</strong> {noun}
      </span>
      <Pagination {...pagination} />
    </div>
  );
}
