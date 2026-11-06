import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

export const inputClass =
  "w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all disabled:bg-slate-50 disabled:text-slate-400";
const errorClass = "!border-rose-300 focus:!ring-rose-500 focus:!border-rose-500";

interface FieldProps {
  label: string;
  htmlFor: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}

export function Field({ label, htmlFor, required, hint, error, children, className = "" }: FieldProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={htmlFor} className="text-xs font-medium text-slate-700">
        {label}
        {required && <span className="text-rose-600"> *</span>}
      </label>
      {children}
      {error ? (
        <p className="text-[11px] text-rose-600" role="alert">
          {error}
        </p>
      ) : (
        hint && <p className="text-[11px] text-slate-400">{hint}</p>
      )}
    </div>
  );
}

export function TextInput({ invalid, className = "", ...rest }: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return <input className={`${inputClass} ${invalid ? errorClass : ""} ${className}`} aria-invalid={invalid} {...rest} />;
}

export function Select({ invalid, className = "", children, ...rest }: SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }) {
  return (
    <select className={`${inputClass} ${invalid ? errorClass : ""} ${className}`} aria-invalid={invalid} {...rest}>
      {children}
    </select>
  );
}

export function TextArea({ className = "", ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`${inputClass} h-auto py-2 leading-relaxed resize-none ${className}`}
      {...rest}
    />
  );
}

interface CheckboxProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
}

export function Checkbox({ id, checked, onChange, label, description, disabled }: CheckboxProps) {
  return (
    <label htmlFor={id} className={`flex items-start gap-2.5 ${disabled ? "opacity-60" : "cursor-pointer"}`}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-slate-900"
      />
      <span className="flex flex-col">
        <span className="text-xs font-medium text-slate-800">{label}</span>
        {description && <span className="text-[11px] text-slate-500 leading-snug mt-0.5">{description}</span>}
      </span>
    </label>
  );
}

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}

export function Toggle({ checked, onChange, label, description, disabled }: ToggleProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex flex-col">
        <span className="text-xs font-semibold text-slate-900">{label}</span>
        {description && <span className="text-[11px] text-slate-500 mt-0.5">{description}</span>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-1 disabled:opacity-50 ${
          checked ? "bg-slate-900" : "bg-slate-200"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
            checked ? "translate-x-4" : ""
          }`}
        />
      </button>
    </div>
  );
}
