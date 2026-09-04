import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

const fieldBase =
  "w-full rounded-xl border border-line/80 bg-abyss/70 px-4 text-sm text-white placeholder:text-muted/70 transition-colors focus:border-neon-blue/70";

export function Field({
  label,
  hint,
  error,
  required,
  children,
  className,
}: {
  label?: string;
  hint?: ReactNode;
  error?: string | null;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block space-y-2", className)}>
      {label ? (
        <span className="flex items-center gap-1 text-xs font-medium uppercase tracking-[0.14em] text-muted">
          {label}
          {required ? <span className="text-neon-magenta">*</span> : null}
        </span>
      ) : null}
      {children}
      {error ? <span className="block text-xs text-rose-300">{error}</span> : null}
      {!error && hint ? <span className="block text-xs text-muted">{hint}</span> : null}
    </label>
  );
}

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(fieldBase, "h-11", className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(fieldBase, "min-h-28 py-3 leading-relaxed", className)} {...props} />;
}

export function Select({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <select className={cn(fieldBase, "h-11 appearance-none pr-9", className)} {...props}>
      {children}
    </select>
  );
}

export function Checkbox({ label, className, ...props }: ComponentProps<"input"> & { label: string }) {
  return (
    <label className={cn("flex cursor-pointer items-center gap-3 text-sm text-white/85", className)}>
      <input
        type="checkbox"
        className="size-4 rounded border-line bg-abyss accent-[var(--color-neon-violet)]"
        {...props}
      />
      {label}
    </label>
  );
}
