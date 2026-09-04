import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { round2 } from "@/lib/money";
import { priceDenomination } from "@/lib/pricing";
import { getGlobalPricingRules, getSettings } from "@/lib/services/settings";
import { evaluateCoupon } from "@/lib/services/coupons";
import { recordAudit } from "@/lib/services/audit";
import type { CartLine } from "@/types/catalog";
import type { OrderStatus } from "@/lib/constants";

export type CreateOrderInput = {
  lines: CartLine[];
  customer: { fullName: string; email: string; phone?: string | null; notes?: string | null };
  paymentMethod: string;
  couponCode?: string | null;
  userId?: string | null;
};

export type CreateOrderResult =
  | { ok: true; orderId: string; reference: string }
  | { ok: false; error: string };

export function generateReference(): string {
  return `FS-${new Date().getFullYear()}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  if (!input.lines.length) return { ok: false, error: "Tu carrito está vacío." };

  const settings = await getSettings();
  if (!settings.paymentMethods.includes(input.paymentMethod)) {
    return { ok: false, error: "El método de pago seleccionado no está disponible." };
  }

  const rules = await getGlobalPricingRules();
  const denominations = await prisma.denomination.findMany({
    where: { id: { in: input.lines.map((line) => line.denominationId) }, active: true },
    include: { product: true },
  });

  const items: {
    productId: string;
    denominationId: string;
    productName: string;
    denominationLabel: string;
    quantity: number;
    unitCost: number;
    unitTax: number;
    unitCommission: number;
    unitMargin: number;
    unitPrice: number;
    lineTotal: number;
    taxRate: number;
    marginRate: number;
    commissionRate: number;
    roundingRule: string;
  }[] = [];
  let subtotal = 0;
  let taxTotal = 0;
  let costTotal = 0;

  for (const line of input.lines) {
    const denomination = denominations.find((item) => item.id === line.denominationId);
    if (!denomination || denomination.productId !== line.productId || !denomination.product.active) {
      return { ok: false, error: "Uno de los productos ya no está disponible." };
    }

    const stock = await prisma.digitalCode.count({
      where: { denominationId: denomination.id, status: "AVAILABLE" },
    });
    if (stock < line.quantity) {
      return {
        ok: false,
        error: `Sin inventario suficiente para ${denomination.product.name} ${denomination.label}.`,
      };
    }

    const breakdown = priceDenomination(denomination, denomination.product, rules);
    const lineTotal = round2(breakdown.finalPrice * line.quantity);

    subtotal = round2(subtotal + lineTotal);
    taxTotal = round2(taxTotal + breakdown.taxAmount * line.quantity);
    costTotal = round2(costTotal + breakdown.cost * line.quantity);

    items.push({
      productId: denomination.productId,
      denominationId: denomination.id,
      productName: denomination.product.name,
      denominationLabel: denomination.label,
      quantity: line.quantity,
      unitCost: breakdown.cost,
      unitTax: breakdown.taxAmount,
      unitCommission: breakdown.commissionAmount,
      unitMargin: breakdown.marginAmount,
      unitPrice: breakdown.finalPrice,
      lineTotal,
      taxRate: breakdown.taxRate,
      marginRate: breakdown.marginRate,
      commissionRate: breakdown.commissionRate,
      roundingRule: breakdown.roundingRule,
    });
  }

  let discount = 0;
  let couponCode: string | null = null;

  if (input.couponCode) {
    const result = await evaluateCoupon(input.couponCode, {
      subtotal,
      productIds: items.map((item) => item.productId),
      categoryIds: denominations.map((item) => item.product.categoryId),
    });
    if (!result.ok) return { ok: false, error: result.error };
    discount = result.discount;
    couponCode = result.code;
  }

  const total = round2(Math.max(subtotal - discount, 0));
  const profitTotal = round2(total - taxTotal - costTotal);
  const reference = generateReference();

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        reference,
        userId: input.userId ?? null,
        email: input.customer.email.toLowerCase(),
        fullName: input.customer.fullName,
        phone: input.customer.phone ?? null,
        notes: input.customer.notes ?? null,
        status: "AWAITING_PAYMENT",
        paymentStatus: "PENDING",
        paymentMethod: input.paymentMethod,
        subtotal,
        taxTotal,
        discount,
        total,
        costTotal,
        profitTotal,
        currency: settings.currency,
        couponCode,
        pricingSnapshot: JSON.stringify({ global: rules, capturedAt: new Date().toISOString() }),
        items: { create: items },
      },
      include: { items: true },
    });

    for (const item of created.items) {
      const codes = await tx.digitalCode.findMany({
        where: { denominationId: item.denominationId, status: "AVAILABLE" },
        take: item.quantity,
        orderBy: { createdAt: "asc" },
      });
      if (codes.length < item.quantity) throw new Error("STOCK");
      await tx.digitalCode.updateMany({
        where: { id: { in: codes.map((code) => code.id) } },
        data: { status: "RESERVED", orderItemId: item.id, reservedAt: new Date() },
      });
    }

    if (couponCode) {
      await tx.coupon.update({ where: { code: couponCode }, data: { usedCount: { increment: 1 } } });
    }

    await tx.payment.create({
      data: {
        reference: `PAY-${randomBytes(3).toString("hex").toUpperCase()}`,
        orderId: created.id,
        method: input.paymentMethod,
        amount: total,
        status: "PENDING",
      },
    });

    return created;
  });

  await recordAudit({
    actorId: input.userId ?? null,
    actorEmail: input.customer.email,
    action: "order.created",
    entity: "order",
    entityId: order.id,
    metadata: { reference, total },
  });

  return { ok: true, orderId: order.id, reference };
}

export async function markOrderPaid(orderId: string, actor: { id: string; email: string }) {
  const settings = await getSettings();
  const order = await prisma.order.update({
    where: { id: orderId },
    data: { status: "PAID", paymentStatus: "APPROVED", paidAt: new Date() },
    include: { items: true },
  });

  await prisma.payment.updateMany({
    where: { orderId, status: "PENDING" },
    data: { status: "APPROVED" },
  });

  await recordAudit({
    actorId: actor.id,
    actorEmail: actor.email,
    action: "order.paid",
    entity: "order",
    entityId: orderId,
  });

  if (settings.autoDelivery) {
    await deliverOrder(orderId, actor);
  }

  return order;
}

export async function deliverOrder(orderId: string, actor: { id: string; email: string }) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!order) return null;

  await prisma.$transaction(async (tx) => {
    for (const item of order.items) {
      const assigned = await tx.digitalCode.count({ where: { orderItemId: item.id } });
      if (assigned < item.quantity) {
        const missing = item.quantity - assigned;
        const codes = await tx.digitalCode.findMany({
          where: { denominationId: item.denominationId, status: "AVAILABLE" },
          take: missing,
        });
        if (codes.length < missing) throw new Error("STOCK");
        await tx.digitalCode.updateMany({
          where: { id: { in: codes.map((code) => code.id) } },
          data: { status: "RESERVED", orderItemId: item.id, reservedAt: new Date() },
        });
      }

      await tx.digitalCode.updateMany({
        where: { orderItemId: item.id, status: { in: ["RESERVED", "SOLD"] } },
        data: {
          status: "DELIVERED",
          soldAt: new Date(),
          deliveredAt: new Date(),
          assignedById: actor.id,
        },
      });

      await tx.product.update({
        where: { id: item.productId },
        data: { salesCount: { increment: item.quantity } },
      });
    }

    await tx.order.update({
      where: { id: orderId },
      data: { status: "DELIVERED", deliveredAt: new Date() },
    });
  });

  await recordAudit({
    actorId: actor.id,
    actorEmail: actor.email,
    action: "order.delivered",
    entity: "order",
    entityId: orderId,
  });

  return prisma.order.findUnique({ where: { id: orderId } });
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  actor: { id: string; email: string },
) {
  const data: Record<string, unknown> = { status };

  if (status === "COMPLETED") data.completedAt = new Date();
  if (status === "CANCELLED" || status === "REFUNDED") {
    await prisma.digitalCode.updateMany({
      where: { orderItem: { orderId }, status: { in: ["RESERVED", "SOLD"] } },
      data: { status: "AVAILABLE", orderItemId: null, reservedAt: null },
    });
    data.paymentStatus = status === "REFUNDED" ? "REFUNDED" : "REJECTED";
    await prisma.payment.updateMany({
      where: { orderId },
      data: { status: status === "REFUNDED" ? "REFUNDED" : "REJECTED" },
    });
  }

  const order = await prisma.order.update({ where: { id: orderId }, data });

  await recordAudit({
    actorId: actor.id,
    actorEmail: actor.email,
    action: `order.status.${status.toLowerCase()}`,
    entity: "order",
    entityId: orderId,
  });

  return order;
}

export async function assignCodeToItem(
  orderItemId: string,
  codeId: string,
  actor: { id: string; email: string },
) {
  const item = await prisma.orderItem.findUnique({ where: { id: orderItemId } });
  const code = await prisma.digitalCode.findUnique({ where: { id: codeId } });
  if (!item || !code) return { ok: false as const, error: "Orden o código inválido." };
  if (code.status !== "AVAILABLE") return { ok: false as const, error: "El código no está disponible." };
  if (code.denominationId !== item.denominationId)
    return { ok: false as const, error: "El código no corresponde a la denominación." };

  await prisma.digitalCode.update({
    where: { id: codeId },
    data: { status: "RESERVED", orderItemId, reservedAt: new Date(), assignedById: actor.id },
  });

  await recordAudit({
    actorId: actor.id,
    actorEmail: actor.email,
    action: "code.assigned",
    entity: "order_item",
    entityId: orderItemId,
    metadata: { codeId },
  });

  return { ok: true as const };
}
