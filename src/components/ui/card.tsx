import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, children, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("glass rounded-2xl", className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  description,
  action,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-start justify-between gap-4 border-b border-line/60 p-5", className)}>
      <div className="space-y-1">
        <h3 className="font-display text-base font-semibold tracking-tight text-white">{title}</h3>
        {description ? <p className="text-sm text-muted">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function CardBody({ className, children, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("p-5", className)} {...props}>
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  accent = "blue",
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  accent?: "blue" | "violet" | "cyan" | "magenta" | "emerald";
}) {
  const glow: Record<string, string> = {
    blue: "from-neon-blue/20",
    violet: "from-neon-violet/20",
    cyan: "from-neon-cyan/20",
    magenta: "from-neon-magenta/20",
    emerald: "from-neon-emerald/20",
  };

  return (
    <div className="glass relative overflow-hidden rounded-2xl p-5">
      <div className={cn("pointer-events-none absolute -right-10 -top-12 size-36 rounded-full bg-gradient-to-b to-transparent blur-2xl", glow[accent])} />
      <div className="relative flex items-start justify-between gap-3">
        <div className="space-y-1.5">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">{label}</p>
          <p className="font-display text-2xl font-semibold text-white">{value}</p>
          {hint ? <p className="text-xs text-muted">{hint}</p> : null}
        </div>
        {icon ? <div className="rounded-xl border border-line/70 bg-white/5 p-2.5 text-white/80">{icon}</div> : null}
      </div>
    </div>
  );
}
