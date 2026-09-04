"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const ranges = [
  { key: "today", label: "Hoy" },
  { key: "7d", label: "7 días" },
  { key: "month", label: "Este mes" },
  { key: "prev-month", label: "Mes anterior" },
  { key: "year", label: "Este año" },
];

export function RangeFilter({ current }: { current: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const setRange = (key: string) => {
    const next = new URLSearchParams(params.toString());
    next.set("rango", key);
    router.push(`${pathname}?${next.toString()}`);
  };

  const setCustom = (field: "desde" | "hasta", value: string) => {
    const next = new URLSearchParams(params.toString());
    next.set("rango", "custom");
    next.set(field, value);
    router.push(`${pathname}?${next.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="scrollbar-none flex gap-1.5 overflow-x-auto">
        {ranges.map((range) => (
          <button
            key={range.key}
            type="button"
            onClick={() => setRange(range.key)}
            className={cn(
              "shrink-0 cursor-pointer rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
              current === range.key
                ? "border-neon-violet/60 bg-neon-violet/15 text-white"
                : "border-line/70 text-muted hover:text-white",
            )}
          >
            {range.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-1.5">
        <input
          type="date"
          aria-label="Desde"
          defaultValue={params.get("desde") ?? ""}
          onChange={(event) => setCustom("desde", event.target.value)}
          className="h-9 rounded-lg border border-line/70 bg-abyss/70 px-2.5 text-xs text-white"
        />
        <span className="text-xs text-muted">a</span>
        <input
          type="date"
          aria-label="Hasta"
          defaultValue={params.get("hasta") ?? ""}
          onChange={(event) => setCustom("hasta", event.target.value)}
          className="h-9 rounded-lg border border-line/70 bg-abyss/70 px-2.5 text-xs text-white"
        />
      </div>
    </div>
  );
}
