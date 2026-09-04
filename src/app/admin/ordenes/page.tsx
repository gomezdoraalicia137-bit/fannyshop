import { PageHeader } from "@/components/admin/primitives";
import { OrdersTable } from "@/components/admin/orders-table";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/services/settings";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const [orders, settings] = await Promise.all([
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, include: { items: true } }),
    getSettings(),
  ]);

  const rows = orders.map((order) => ({
    id: order.id,
    reference: order.reference,
    customer: order.fullName,
    email: order.email,
    items: order.items.reduce((total, item) => total + item.quantity, 0),
    total: order.total,
    currency: order.currency,
    status: order.status,
    paymentStatus: order.paymentStatus,
    createdAt: order.createdAt.toISOString(),
  }));

  return (
    <>
      <PageHeader title="Órdenes" description={`${orders.length} órdenes registradas en la plataforma`} />
      <OrdersTable orders={rows} locale={settings.locale} />
    </>
  );
}
