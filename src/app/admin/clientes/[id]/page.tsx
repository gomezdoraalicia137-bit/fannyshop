import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/admin/primitives";
import { Card, CardBody, CardHeader, StatCard } from "@/components/ui/card";
import { OrderStatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/states";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/services/settings";
import { formatMoney } from "@/lib/money";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

const REVENUE_STATUSES = ["PAID", "PROCESSING", "DELIVERED", "COMPLETED"];

export default async function AdminCustomerDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [customer, settings] = await Promise.all([
    prisma.user.findUnique({ where: { id }, include: { orders: { include: { items: true }, orderBy: { createdAt: "desc" } } } }),
    getSettings(),
  ]);

  if (!customer) notFound();

  const spent = customer.orders
    .filter((order) => REVENUE_STATUSES.includes(order.status))
    .reduce((total, order) => total + order.total, 0);

  return (
    <>
      <Link href="/admin/clientes" className="mb-4 inline-flex items-center gap-2 text-sm text-muted hover:text-white">
        <ArrowLeft className="size-4" /> Volver a clientes
      </Link>

      <PageHeader title={customer.name} description={customer.email} />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Órdenes" value={customer.orders.length} accent="blue" />
        <StatCard label="Total gastado" value={formatMoney(spent, settings.currency)} accent="violet" />
        <StatCard label="Estado" value={customer.status === "ACTIVE" ? "Activo" : "Bloqueado"} accent="emerald" />
      </div>

      <Card className="mt-5">
        <CardHeader title="Historial de órdenes" />
        <CardBody className="space-y-2.5">
          {customer.orders.length ? (
            customer.orders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/ordenes/${order.id}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line/60 bg-abyss/50 px-4 py-3 transition-colors hover:border-neon-violet/40"
              >
                <div>
                  <p className="text-sm font-semibold text-white">{order.reference}</p>
                  <p className="text-xs text-muted">
                    {formatDateTime(order.createdAt, settings.locale)} · {order.items.length} productos
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <OrderStatusBadge status={order.status} />
                  <span className="font-display text-sm font-semibold text-white">
                    {formatMoney(order.total, order.currency)}
                  </span>
                </div>
              </Link>
            ))
          ) : (
            <EmptyState title="Sin órdenes" description="Este cliente aún no ha comprado." />
          )}
        </CardBody>
      </Card>
    </>
  );
}
