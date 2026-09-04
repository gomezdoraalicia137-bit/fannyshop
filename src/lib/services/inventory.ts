import { createHash, randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

export function fingerprintCode(productId: string, denominationId: string, secret: string): string {
  return createHash("sha256").update(`${productId}:${denominationId}:${secret.trim()}`).digest("hex");
}

export function maskCode(secret: string): string {
  const clean = secret.trim();
  if (clean.length <= 4) return "••••";
  return `${"•".repeat(Math.max(clean.length - 4, 4))}${clean.slice(-4)}`;
}

export async function addCodes(input: {
  productId: string;
  denominationId: string;
  codes: string[];
  batch?: string | null;
  note?: string | null;
}) {
  const unique = [...new Set(input.codes.map((code) => code.trim()).filter(Boolean))];
  const batch = input.batch?.trim() || `LOTE-${randomBytes(3).toString("hex").toUpperCase()}`;

  const payload = unique.map((secret) => ({
    productId: input.productId,
    denominationId: input.denominationId,
    secret,
    fingerprint: fingerprintCode(input.productId, input.denominationId, secret),
    batch,
    note: input.note ?? null,
  }));

  let inserted = 0;
  for (const item of payload) {
    try {
      await prisma.digitalCode.create({ data: item });
      inserted += 1;
    } catch {
      continue;
    }
  }

  return { inserted, duplicates: payload.length - inserted, batch };
}

export async function inventoryStats() {
  const grouped = await prisma.digitalCode.groupBy({ by: ["status"], _count: { _all: true } });
  const base: Record<string, number> = {
    AVAILABLE: 0,
    RESERVED: 0,
    SOLD: 0,
    DELIVERED: 0,
    CANCELLED: 0,
  };
  for (const row of grouped) base[row.status] = row._count._all;
  return base;
}

export async function availableStock(denominationId: string) {
  return prisma.digitalCode.count({ where: { denominationId, status: "AVAILABLE" } });
}
