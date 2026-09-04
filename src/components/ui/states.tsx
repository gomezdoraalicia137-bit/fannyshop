import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-xl", className)} />;
}

export function ProductCardSkeleton() {
  return (
    <div className="glass space-y-4 rounded-2xl p-5">
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-3 w-1/3" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={index} className="h-12 w-full" />
      ))}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "glass flex flex-col items-center justify-center gap-3 rounded-2xl px-6 py-14 text-center",
        className,
      )}
    >
      {icon ? (
        <div className="rounded-2xl border border-line/70 bg-gradient-to-b from-neon-violet/15 to-transparent p-3.5 text-neon-violet">
          {icon}
        </div>
      ) : null}
      <h3 className="font-display text-lg font-semibold text-white">{title}</h3>
      {description ? <p className="max-w-md text-sm text-muted">{description}</p> : null}
      {action}
    </div>
  );
}

export function ErrorState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-rose-500/35 bg-rose-500/8 px-6 py-10 text-center">
      <h3 className="font-display text-lg font-semibold text-rose-200">{title}</h3>
      {description ? <p className="mt-2 text-sm text-rose-200/80">{description}</p> : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  align = "left",
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  action?: ReactNode;
  align?: "left" | "center";
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-end justify-between gap-5",
        align === "center" && "flex-col items-center text-center",
      )}
    >
      <div className={cn("max-w-2xl space-y-2.5", align === "center" && "mx-auto")}>
        {eyebrow ? (
          <span className="inline-flex items-center gap-2 rounded-full border border-line/70 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-neon-cyan">
            {eyebrow}
          </span>
        ) : null}
        <h2 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">{title}</h2>
        {description ? <p className="text-sm leading-relaxed text-muted sm:text-base">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
