"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingCart, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/shop/cart-provider";
import { useToast } from "@/components/ui/toast";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { ProductView } from "@/types/catalog";

export function ProductPurchasePanel({ product, currency }: { product: ProductView; currency: string }) {
  const router = useRouter();
  const { add } = useCart();
  const toast = useToast();

  const initial = useMemo(
    () => product.denominations.find((item) => item.available) ?? product.denominations[0],
    [product.denominations],
  );
  const [selectedId, setSelectedId] = useState(initial?.id ?? "");
  const [quantity, setQuantity] = useState(1);

  const denomination = product.denominations.find((item) => item.id === selectedId) ?? initial;
  const maxQuantity = Math.max(1, Math.min(denomination?.stock ?? 1, 10));

  const handleAdd = (redirect: boolean) => {
    if (!denomination?.available) return;
    add({ productId: product.id, denominationId: denomination.id, quantity });
    toast.success("Producto agregado al carrito.", `${product.name} ${denomination.label} x${quantity}`);
    if (redirect) router.push("/carrito");
  };

  return (
    <div className="glass-strong space-y-6 rounded-2xl p-6">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Selecciona la denominación</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {product.denominations.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setSelectedId(item.id);
                setQuantity(1);
              }}
              disabled={!item.available}
              className={cn(
                "cursor-pointer rounded-xl border px-3 py-3 text-center transition-all",
                item.id === denomination?.id
                  ? "border-neon-violet/70 bg-gradient-to-b from-neon-violet/20 to-transparent text-white"
                  : "border-line/70 text-muted hover:border-neon-blue/50 hover:text-white",
                !item.available && "cursor-not-allowed opacity-35",
              )}
            >
              <span className="block font-display text-sm font-semibold">{item.label}</span>
              <span className="mt-0.5 block text-xs">{formatMoney(item.price, currency)}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 rounded-xl border border-line/70 bg-abyss/60 p-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Total a pagar</p>
          <p className="font-display text-3xl font-semibold text-white">
            {formatMoney((denomination?.price ?? 0) * quantity, currency)}
          </p>
          <p className="mt-0.5 text-xs text-muted">Impuestos incluidos</p>
        </div>

        <div className="flex items-center gap-1 rounded-xl border border-line/70 bg-surface/70 p-1">
          <button
            type="button"
            aria-label="Reducir cantidad"
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
            className="grid size-9 cursor-pointer place-items-center rounded-lg text-muted transition-colors hover:bg-white/5 hover:text-white"
          >
            <Minus className="size-4" />
          </button>
          <span className="w-8 text-center font-display text-sm font-semibold text-white">{quantity}</span>
          <button
            type="button"
            aria-label="Aumentar cantidad"
            onClick={() => setQuantity((value) => Math.min(maxQuantity, value + 1))}
            className="grid size-9 cursor-pointer place-items-center rounded-lg text-muted transition-colors hover:bg-white/5 hover:text-white"
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2">
        <Button size="lg" disabled={!denomination?.available} onClick={() => handleAdd(true)}>
          <Zap className="size-4" /> Comprar ahora
        </Button>
        <Button size="lg" variant="secondary" disabled={!denomination?.available} onClick={() => handleAdd(false)}>
          <ShoppingCart className="size-4" /> Agregar al carrito
        </Button>
      </div>

      <p className="text-center text-xs text-muted">
        {denomination?.available
          ? `${denomination.stock} códigos disponibles · entrega inmediata`
          : "Sin inventario disponible por el momento"}
      </p>
    </div>
  );
}
