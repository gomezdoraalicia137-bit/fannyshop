import { PageHeader } from "@/components/admin/primitives";
import { InventoryManager } from "@/components/admin/inventory-manager";
import { prisma } from "@/lib/prisma";
import { inventoryStats, maskCode } from "@/lib/services/inventory";
import { getSettings } from "@/lib/services/settings";

export const dynamic = "force-dynamic";

export default async function AdminInventoryPage() {
  const [codes, denominations, stats, settings] = await Promise.all([
    prisma.digitalCode.findMany({
      orderBy: { createdAt: "desc" },
      take: 600,
      include: {
        product: { select: { name: true } },
        denomination: { select: { label: true } },
        orderItem: { include: { order: { select: { reference: true } } } },
      },
    }),
    prisma.denomination.findMany({ include: { product: { select: { name: true } } }, orderBy: { productId: "asc" } }),
    inventoryStats(),
    getSettings(),
  ]);

  const rows = codes.map((code) => ({
    id: code.id,
    masked: maskCode(code.secret),
    product: code.product.name,
    denomination: code.denomination.label,
    denominationId: code.denominationId,
    status: code.status,
    batch: code.batch,
    orderReference: code.orderItem?.order.reference ?? null,
    createdAt: code.createdAt.toISOString(),
  }));

  return (
    <>
      <PageHeader title="Inventario" description="Administra los códigos digitales disponibles y su ciclo de vida." />
      <InventoryManager
        codes={rows}
        denominations={denominations.map((item) => ({
          id: item.id,
          label: `${item.product.name} · ${item.label}`,
        }))}
        stats={stats}
        locale={settings.locale}
      />
    </>
  );
}
