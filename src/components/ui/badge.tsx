import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  CODE_STATUS_LABELS,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  PRODUCT_TAG_LABELS,
  type CodeStatus,
  type OrderStatus,
  type PaymentStatus,
  type ProductTag,
} from "@/lib/constants";

type Tone = "blue" | "violet" | "cyan" | "magenta" | "emerald" | "amber" | "rose" | "slate";

const tones: Record<Tone, string> = {
  blue: "border-neon-blue/40 bg-neon-blue/12 text-neon-blue",
  violet: "border-neon-violet/40 bg-neon-violet/12 text-neon-violet",
  cyan: "border-neon-cyan/40 bg-neon-cyan/12 text-neon-cyan",
  magenta: "border-neon-magenta/40 bg-neon-magenta/12 text-neon-magenta",
  emerald: "border-neon-emerald/40 bg-neon-emerald/12 text-neon-emerald",
  amber: "border-amber-400/40 bg-amber-400/12 text-amber-300",
  rose: "border-rose-500/40 bg-rose-500/12 text-rose-300",
  slate: "border-line/70 bg-white/5 text-muted",
};

export function Badge({
  children,
  tone = "slate",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em]",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

const orderTones: Record<OrderStatus, Tone> = {
  PENDING: "slate",
  AWAITING_PAYMENT: "amber",
  PAID: "cyan",
  PROCESSING: "blue",
  DELIVERED: "violet",
  COMPLETED: "emerald",
  CANCELLED: "rose",
  REFUNDED: "magenta",
};

export function OrderStatusBadge({ status }: { status: string }) {
  const key = (status as OrderStatus) in ORDER_STATUS_LABELS ? (status as OrderStatus) : "PENDING";
  return <Badge tone={orderTones[key]}>{ORDER_STATUS_LABELS[key]}</Badge>;
}

const paymentTones: Record<PaymentStatus, Tone> = {
  PENDING: "amber",
  APPROVED: "emerald",
  REJECTED: "rose",
  REFUNDED: "magenta",
};

export function PaymentStatusBadge({ status }: { status: string }) {
  const key = (status as PaymentStatus) in PAYMENT_STATUS_LABELS ? (status as PaymentStatus) : "PENDING";
  return <Badge tone={paymentTones[key]}>{PAYMENT_STATUS_LABELS[key]}</Badge>;
}

const codeTones: Record<CodeStatus, Tone> = {
  AVAILABLE: "emerald",
  RESERVED: "amber",
  SOLD: "blue",
  DELIVERED: "violet",
  CANCELLED: "rose",
};

export function CodeStatusBadge({ status }: { status: string }) {
  const key = (status as CodeStatus) in CODE_STATUS_LABELS ? (status as CodeStatus) : "AVAILABLE";
  return <Badge tone={codeTones[key]}>{CODE_STATUS_LABELS[key]}</Badge>;
}

const tagTones: Record<ProductTag, Tone> = {
  NUEVO: "cyan",
  POPULAR: "violet",
  MAS_VENDIDO: "magenta",
  OFERTA: "emerald",
};

export function ProductTagBadge({ tag }: { tag: string }) {
  const key = (tag as ProductTag) in PRODUCT_TAG_LABELS ? (tag as ProductTag) : null;
  if (!key) return null;
  return <Badge tone={tagTones[key]}>{PRODUCT_TAG_LABELS[key]}</Badge>;
}
