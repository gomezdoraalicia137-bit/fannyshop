import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatDate(value: Date | string, locale = "es-SV"): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(date);
}

export function formatDateTime(value: Date | string, locale = "es-SV"): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export function accentClasses(accent: string) {
  const map: Record<string, { text: string; ring: string; bg: string; glow: string }> = {
    blue: {
      text: "text-neon-blue",
      ring: "ring-neon-blue/40",
      bg: "from-neon-blue/25 to-neon-violet/10",
      glow: "shadow-[0_0_40px_-12px_var(--color-neon-blue)]",
    },
    violet: {
      text: "text-neon-violet",
      ring: "ring-neon-violet/40",
      bg: "from-neon-violet/25 to-neon-blue/10",
      glow: "shadow-[0_0_40px_-12px_var(--color-neon-violet)]",
    },
    cyan: {
      text: "text-neon-cyan",
      ring: "ring-neon-cyan/40",
      bg: "from-neon-cyan/25 to-neon-blue/10",
      glow: "shadow-[0_0_40px_-12px_var(--color-neon-cyan)]",
    },
    magenta: {
      text: "text-neon-magenta",
      ring: "ring-neon-magenta/40",
      bg: "from-neon-magenta/25 to-neon-violet/10",
      glow: "shadow-[0_0_40px_-12px_var(--color-neon-magenta)]",
    },
    emerald: {
      text: "text-neon-emerald",
      ring: "ring-neon-emerald/40",
      bg: "from-neon-emerald/25 to-neon-cyan/10",
      glow: "shadow-[0_0_40px_-12px_var(--color-neon-emerald)]",
    },
  };
  return map[accent] ?? map.blue;
}

export function initials(value: string): string {
  return value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
