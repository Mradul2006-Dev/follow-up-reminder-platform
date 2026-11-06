import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Icon } from "./Icon";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "md" | "sm";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-slate-900 hover:bg-slate-800 text-white shadow-sm",
  secondary: "border border-slate-200 bg-white hover:bg-slate-50 text-slate-700",
  danger: "bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/60",
  ghost: "hover:bg-slate-100 text-slate-600",
};

// md = header buttons (h-9, text-xs font-semibold); sm = table row buttons (h-8, font-medium).
const SIZES: Record<Size, { box: string; icon: string }> = {
  md: { box: "h-9 px-3 rounded-lg font-semibold gap-1.5", icon: "text-base" },
  sm: { box: "h-8 px-2.5 rounded-md font-medium gap-1", icon: "text-sm" },
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: string;
  iconFilled?: boolean;
  children?: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  icon,
  iconFilled,
  className = "",
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center text-xs transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-1 ${SIZES[size].box} ${VARIANTS[variant]} ${className}`}
      {...rest}
    >
      {icon && (
        <Icon
          name={icon}
          filled={iconFilled}
          className={`${SIZES[size].icon} ${variant === "secondary" ? "text-slate-500" : ""}`}
        />
      )}
      {children}
    </button>
  );
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: string;
  label: string;
}

/** Square ghost icon button used for "chat" / "more" in table rows. */
export function IconButton({ icon, label, className = "", type = "button", ...rest }: IconButtonProps) {
  return (
    <button
      type={type}
      title={label}
      aria-label={label}
      className={`h-8 w-8 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 ${className}`}
      {...rest}
    >
      <Icon name={icon} className="text-base" />
    </button>
  );
}
