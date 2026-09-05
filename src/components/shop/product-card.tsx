"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ShoppingCart, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductTagBadge } from "@/components/ui/badge";
import { useCart } from "@/components/shop/cart-provider";
import { useToast } from "@/components/ui/toast";
import { BrandTile } from "@/components/shop/brand-tile";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { ProductView } from "@/types/catalog";

export function ProductCard({ product, currency = "USD" }: { product: ProductView; currency?: string }) {
  const { add } = useCart();
  const toast = useToast();
  const firstAvailable = useMemo(
    () => product.denominations.find((item) => item.available) ?? product.denominations[0],
    [product.denominations],
  );
  const [selected, setSelected] = useState(firstAvailable?.id ?? "");

  const denomination = product.denominations.find((item) => item.id === selected) ?? firstAvailable;

  const handleAdd = () => {
    if (!denomination || !denomination.available) return;
    add({ productId: product.id, denominationId: denomination.id, quantity: 1 });
    toast.success("Producto agregado al carrito.", `${product.name} ${denomination.label}`);
  };

  return (
    <article className="group glass relative flex flex-col overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:border-neon-violet/40 hover:shadow-[0_24px_60px_-30px_var(--color-neon-violet)]">
      <div className="absolute right-4 top-4 z-10 flex flex-col items-end gap-2">
        {product.tag ? <ProductTagBadge tag={product.tag} /> : null}
        {!product.inStock ? (
          <span className="rounded-full border border-rose-500/40 bg-rose-500/12 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-rose-300">
            Agotado
          </span>
        ) : null}
      </div>

      <Link href={`/producto/${product.slug}`} className="block p-5 pb-0" aria-label={`Ver ${product.name}`}>
        <BrandTile name={product.name} accent={product.accent} icon={product.category.icon} logo={product.logo} />
      </Link>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">{product.category.name}</p>
          <h3 className="font-display text-lg font-semibold leading-tight text-white">
            <Link href={`/producto/${product.slug}`} className="transition-colors hover:text-neon-cyan">
              {product.name}
            </Link>
          </h3>
          <p className="line-clamp-2 text-xs leading-relaxed text-muted">{product.description}</p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {product.denominations.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelected(item.id)}
              disabled={!item.available}
              className={cn(
                "cursor-pointer rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all",
                item.id === denomination?.id
                  ? "border-neon-violet/70 bg-neon-violet/15 text-white"
                  : "border-line/70 text-muted hover:border-neon-blue/50 hover:text-white",
                !item.available && "cursor-not-allowed opacity-35",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-auto space-y-3 border-t border-line/60 pt-4">
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="text-[11px] uppercase tracking-[0.14em] text-muted">Precio final</p>
              <p className="font-display text-2xl font-semibold text-white">
                {formatMoney(denomination?.price ?? product.fromPrice, currency)}
              </p>
            </div>
            <p className="text-xs text-muted">
              {denomination?.stock ? `${denomination.stock} disponibles` : "Sin stock"}
            </p>
          </div>

          <div className="grid grid-cols-[1fr_auto] gap-2">
            <Button onClick={handleAdd} disabled={!denomination?.available} size="sm" className="w-full">
              <Zap className="size-4" /> Comprar
            </Button>
            <Button
              onClick={handleAdd}
              disabled={!denomination?.available}
              variant="secondary"
              size="icon"
              aria-label="Agregar al carrito"
            >
              <ShoppingCart className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
