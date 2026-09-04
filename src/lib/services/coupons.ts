import { prisma } from "@/lib/prisma";
import { round2 } from "@/lib/money";

export type CouponResult =
  | { ok: true; code: string; discount: number; couponId: string }
  | { ok: false; error: string };

export async function evaluateCoupon(
  rawCode: string,
  context: { subtotal: number; productIds: string[]; categoryIds: string[] },
): Promise<CouponResult> {
  const code = rawCode.trim().toUpperCase();
  if (!code) return { ok: false, error: "Ingresa un cupón válido." };

  const coupon = await prisma.coupon.findUnique({ where: { code } });
  if (!coupon || !coupon.active) return { ok: false, error: "El cupón no existe o está inactivo." };

  const now = new Date();
  if (coupon.startsAt && coupon.startsAt > now) return { ok: false, error: "El cupón aún no está vigente." };
  if (coupon.endsAt && coupon.endsAt < now) return { ok: false, error: "El cupón ya venció." };
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses)
    return { ok: false, error: "El cupón alcanzó su límite de usos." };
  if (coupon.minTotal !== null && context.subtotal < coupon.minTotal)
    return { ok: false, error: "El monto mínimo para este cupón no se cumple." };

  const allowedProducts = splitIds(coupon.productIds);
  const allowedCategories = splitIds(coupon.categoryIds);

  const eligible =
    (allowedProducts.length === 0 && allowedCategories.length === 0) ||
    context.productIds.some((id) => allowedProducts.includes(id)) ||
    context.categoryIds.some((id) => allowedCategories.includes(id));

  if (!eligible) return { ok: false, error: "El cupón no aplica a los productos de tu carrito." };

  const discount =
    coupon.type === "PERCENT"
      ? round2((context.subtotal * coupon.value) / 100)
      : round2(Math.min(coupon.value, context.subtotal));

  if (discount <= 0) return { ok: false, error: "El cupón no genera descuento." };

  return { ok: true, code: coupon.code, discount, couponId: coupon.id };
}

function splitIds(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}
