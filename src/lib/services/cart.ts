import { prisma } from "@/lib/prisma";
import { round2 } from "@/lib/money";
import { priceDenomination } from "@/lib/pricing";
import { getGlobalPricingRules } from "@/lib/services/settings";
import { evaluateCoupon } from "@/lib/services/coupons";
import type { CartLine, CartSummary, CartLineView } from "@/types/catalog";

export function normalizeCart(raw: unknown): CartLine[] {
  if (!Array.isArray(raw)) return [];
  const map = new Map<string, CartLine>();
  for (const entry of raw) {
    if (!entry || typeof entry !== "object") continue;
    const productId = String((entry as CartLine).productId ?? "");
    const denominationId = String((entry as CartLine).denominationId ?? "");
    const quantity = Number((entry as CartLine).quantity ?? 0);
    if (!productId || !denominationId || !Number.isFinite(quantity) || quantity <= 0) continue;
    const key = `${productId}:${denominationId}`;
    const existing = map.get(key);
    const nextQuantity = Math.min((existing?.quantity ?? 0) + Math.floor(quantity), 25);
    map.set(key, { productId, denominationId, quantity: nextQuantity });
  }
  return [...map.values()];
}

export async function buildCartSummary(lines: CartLine[], couponCode?: string | null): Promise<CartSummary> {
  const empty: CartSummary = {
    lines: [],
    subtotal: 0,
    taxTotal: 0,
    discount: 0,
    total: 0,
    itemCount: 0,
    couponCode: null,
    couponError: null,
  };
  if (!lines.length) return empty;

  const rules = await getGlobalPricingRules();
  const denominations = await prisma.denomination.findMany({
    where: { id: { in: lines.map((line) => line.denominationId) }, active: true },
    include: {
      product: { include: { category: true } },
      _count: { select: { codes: { where: { status: "AVAILABLE" } } } },
    },
  });

  const views: CartLineView[] = [];
  let subtotal = 0;
  let taxTotal = 0;

  for (const line of lines) {
    const denomination = denominations.find((item) => item.id === line.denominationId);
    if (!denomination || denomination.productId !== line.productId || !denomination.product.active) continue;

    const stock = denomination._count.codes;
    const quantity = Math.max(0, Math.min(line.quantity, stock));
    if (quantity <= 0) continue;

    const breakdown = priceDenomination(denomination, denomination.product, rules);
    const lineTotal = round2(breakdown.finalPrice * quantity);

    subtotal = round2(subtotal + lineTotal);
    taxTotal = round2(taxTotal + breakdown.taxAmount * quantity);

    views.push({
      productId: denomination.productId,
      denominationId: denomination.id,
      quantity,
      productName: denomination.product.name,
      productSlug: denomination.product.slug,
      denominationLabel: denomination.label,
      logo: denomination.product.logo,
      accent: denomination.product.accent,
      unitPrice: breakdown.finalPrice,
      unitTax: breakdown.taxAmount,
      lineTotal,
      stock,
    });
  }

  if (!views.length) return empty;

  let discount = 0;
  let appliedCoupon: string | null = null;
  let couponError: string | null = null;

  if (couponCode) {
    const productIds = views.map((view) => view.productId);
    const categoryIds = denominations.map((item) => item.product.categoryId);
    const result = await evaluateCoupon(couponCode, { subtotal, productIds, categoryIds });
    if (result.ok) {
      discount = result.discount;
      appliedCoupon = result.code;
    } else {
      couponError = result.error;
    }
  }

  return {
    lines: views,
    subtotal,
    taxTotal,
    discount,
    total: round2(Math.max(subtotal - discount, 0)),
    itemCount: views.reduce((total, view) => total + view.quantity, 0),
    couponCode: appliedCoupon,
    couponError,
  };
}
