"use client";

import Link from "next/link";
import { useState } from "react";
import { Minus, Plus, ShoppingBag, Ticket, Trash2 } from "lucide-react";
import { Button, LinkButton } from "@/components/ui/button";
import { EmptyState, Skeleton } from "@/components/ui/states";
import { BrandThumb } from "@/components/shop/brand-tile";
import { useCart } from "@/components/shop/cart-provider";
import { useToast } from "@/components/ui/toast";
import { formatMoney } from "@/lib/money";

export function CartView({ currency }: { currency: string }) {
  const { summary, loading, lines, setQuantity, remove, clear, applyCoupon, removeCoupon, couponInput } = useCart();
  const toast = useToast();
  const [code, setCode] = useState(couponInput);

  if (!lines.length) {
    return (
      <EmptyState
        title="Tu carrito está vacío"
        description="Agrega tarjetas digitales y códigos para continuar con tu compra."
        icon={<ShoppingBag className="size-6" />}
        action={<LinkButton href="/tarjetas" size="sm">Explorar tarjetas</LinkButton>}
      />
    );
  }

  if (loading && !summary) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-3">
          {lines.map((line) => (
            <Skeleton key={line.denominationId} className="h-28 w-full" />
          ))}
        </div>
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
      <div className="space-y-3">
        {summary.lines.map((line) => (
          <article
            key={`${line.productId}-${line.denominationId}`}
            className="glass flex flex-col gap-4 rounded-2xl p-4 sm:flex-row sm:items-center"
          >
            <BrandThumb
              name={line.productName}
              accent={line.accent}
              logo={line.logo}
              fallback={line.denominationLabel.replace(/[^0-9A-Za-z]/g, "").slice(0, 4)}
            />

            <div className="min-w-0 flex-1">
              <Link href={`/producto/${line.productSlug}`} className="font-display text-sm font-semibold text-white hover:text-neon-cyan">
                {line.productName}
              </Link>
              <p className="text-xs text-muted">
                {line.denominationLabel} · {formatMoney(line.unitPrice, currency)} c/u
              </p>
            </div>

            <div className="flex items-center gap-1 rounded-xl border border-line/70 bg-abyss/60 p-1">
              <button
                type="button"
                aria-label="Reducir cantidad"
                onClick={() => setQuantity(line.productId, line.denominationId, line.quantity - 1)}
                className="grid size-8 cursor-pointer place-items-center rounded-lg text-muted hover:bg-white/5 hover:text-white"
              >
                <Minus className="size-4" />
              </button>
              <span className="w-8 text-center text-sm font-semibold text-white">{line.quantity}</span>
              <button
                type="button"
                aria-label="Aumentar cantidad"
                disabled={line.quantity >= line.stock}
                onClick={() => setQuantity(line.productId, line.denominationId, line.quantity + 1)}
                className="grid size-8 cursor-pointer place-items-center rounded-lg text-muted hover:bg-white/5 hover:text-white disabled:opacity-40"
              >
                <Plus className="size-4" />
              </button>
            </div>

            <p className="w-24 text-right font-display text-base font-semibold text-white">
              {formatMoney(line.lineTotal, currency)}
            </p>

            <button
              type="button"
              aria-label={`Eliminar ${line.productName}`}
              onClick={() => {
                remove(line.productId, line.denominationId);
                toast.info("Producto eliminado del carrito.");
              }}
              className="grid size-9 cursor-pointer place-items-center rounded-lg text-muted transition-colors hover:bg-rose-500/10 hover:text-rose-300"
            >
              <Trash2 className="size-4" />
            </button>
          </article>
        ))}

        <button
          type="button"
          onClick={() => {
            clear();
            toast.info("Carrito vaciado.");
          }}
          className="cursor-pointer text-xs font-medium text-muted transition-colors hover:text-rose-300"
        >
          Vaciar carrito
        </button>
      </div>

      <aside className="glass-strong h-fit space-y-5 rounded-2xl p-5 lg:sticky lg:top-24">
        <h2 className="font-display text-base font-semibold text-white">Resumen de compra</h2>

        <div className="space-y-2.5 text-sm">
          <Row label={`Subtotal (${summary.itemCount} artículos)`} value={formatMoney(summary.subtotal, currency)} />
          <Row label="IVA incluido" value={formatMoney(summary.taxTotal, currency)} muted />
          {summary.discount > 0 ? (
            <Row label={`Descuento ${summary.couponCode ?? ""}`} value={`- ${formatMoney(summary.discount, currency)}`} accent />
          ) : null}
          <div className="border-t border-line/60 pt-3">
            <Row label="Total" value={formatMoney(summary.total, currency)} strong />
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-muted">
            <Ticket className="size-3.5" /> Cupón de descuento
          </label>
          <div className="flex gap-2">
            <input
              value={code}
              onChange={(event) => setCode(event.target.value.toUpperCase())}
              placeholder="GAMER10"
              aria-label="Código de cupón"
              className="h-10 w-full rounded-xl border border-line/80 bg-abyss/70 px-3 text-sm text-white placeholder:text-muted/70"
            />
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                applyCoupon(code);
                toast.info("Validando cupón...");
              }}
            >
              Aplicar
            </Button>
          </div>
          {summary.couponError ? <p className="text-xs text-rose-300">{summary.couponError}</p> : null}
          {summary.couponCode ? (
            <button
              type="button"
              onClick={() => {
                removeCoupon();
                setCode("");
              }}
              className="cursor-pointer text-xs text-muted hover:text-white"
            >
              Quitar cupón {summary.couponCode}
            </button>
          ) : null}
        </div>

        <LinkButton href="/checkout" size="lg" className="w-full">
          Continuar al pago
        </LinkButton>
        <p className="text-center text-[11px] text-muted">Los códigos se reservan al confirmar tu orden.</p>
      </aside>
    </div>
  );
}

function Row({
  label,
  value,
  muted,
  strong,
  accent,
}: {
  label: string;
  value: string;
  muted?: boolean;
  strong?: boolean;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className={muted ? "text-xs text-muted" : "text-sm text-muted"}>{label}</span>
      <span
        className={
          strong
            ? "font-display text-xl font-semibold text-white"
            : accent
              ? "text-sm font-semibold text-neon-emerald"
              : "text-sm font-medium text-white"
        }
      >
        {value}
      </span>
    </div>
  );
}
