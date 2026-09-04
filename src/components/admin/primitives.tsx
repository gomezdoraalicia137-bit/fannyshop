import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div className="space-y-1.5">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-white">{title}</h1>
        {description ? <p className="text-sm text-muted">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function DataTable({
  headers,
  children,
  className,
}: {
  headers: string[];
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("glass overflow-hidden rounded-2xl", className)}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-line/60 bg-white/[0.02]">
              {headers.map((header) => (
                <th
                  key={header}
                  className="whitespace-nowrap px-4 py-3.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line/50">{children}</tbody>
        </table>
      </div>
    </div>
  );
}

export function Td({ children, className }: { children: ReactNode; className?: string }) {
  return <td className={cn("px-4 py-3.5 align-middle text-white/85", className)}>{children}</td>;
}

export function MobileCard({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("glass space-y-3 rounded-2xl p-4", className)}>{children}</div>;
}

export function CardRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-xs uppercase tracking-[0.12em] text-muted">{label}</span>
      <span className="text-right text-white/90">{value}</span>
    </div>
  );
}
