import { initials } from "@/lib/followups";

export function Avatar({ name, tone }: { name: string; tone: string }) {
  return (
    <div
      className={`w-8 h-8 rounded-full font-semibold text-xs flex items-center justify-center border flex-shrink-0 ${tone}`}
      aria-hidden="true"
    >
      {initials(name)}
    </div>
  );
}
