"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "./Icon";
import { IconButton } from "./Button";

export interface MenuItem {
  label: string;
  icon?: string;
  onSelect: () => void;
  disabled?: boolean;
  /** Draws a divider above this item. */
  separated?: boolean;
  /** Marks the current value (shows a check). */
  active?: boolean;
}

interface DropdownProps {
  items: MenuItem[];
  label?: string;
  icon?: string;
}

/**
 * Row action menu. Uses fixed positioning so it is never clipped by the table's
 * horizontal scroll container, and flips upward near the bottom of the viewport.
 */
export function Dropdown({ items, label = "More actions", icon = "more_horiz" }: DropdownProps) {
  const [pos, setPos] = useState<{ top?: number; bottom?: number; right: number } | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setPos(null), []);

  useEffect(() => {
    if (!pos) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!menuRef.current?.contains(t) && !triggerRef.current?.contains(t)) close();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [pos, close]);

  const toggle = () => {
    if (pos) return close();
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const right = window.innerWidth - rect.right;
    const flip = rect.bottom + items.length * 36 + 16 > window.innerHeight;
    setPos(flip ? { bottom: window.innerHeight - rect.top + 4, right } : { top: rect.bottom + 4, right });
  };

  return (
    <div ref={triggerRef} className="inline-flex">
      <IconButton icon={icon} label={label} onClick={toggle} aria-haspopup="menu" aria-expanded={!!pos} />
      {pos && (
        <div
          ref={menuRef}
          role="menu"
          style={{ position: "fixed", top: pos.top, bottom: pos.bottom, right: pos.right }}
          className="z-[55] min-w-[200px] bg-white border border-slate-200 rounded-lg shadow-lg py-1 text-left"
        >
          {items.map((item) => (
            <div key={item.label}>
              {item.separated && <div className="my-1 border-t border-slate-100" />}
              <button
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  close();
                  item.onSelect();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent"
              >
                {item.icon && <Icon name={item.icon} className="text-base text-slate-400" />}
                <span className="flex-1 text-left">{item.label}</span>
                {item.active && <Icon name="check" className="text-base text-teal-600" />}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
