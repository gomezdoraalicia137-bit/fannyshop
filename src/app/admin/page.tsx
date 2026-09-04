import { Suspense } from "react";
import Link from "next/link";
import { Boxes, CheckCircle2, Clock, Package, Receipt, TrendingUp, Users, Wallet } from "lucide-react";
import { PageHeader } from "@/components/admin/primitives";
import { RangeFilter } from "@/components/admin/range-filter";
import { MonthlyLineChart, OrdersBarChart, RevenueAreaChart, StatusPieChart, TopProductsChart } from "@/components/admin/charts";
import { Card, CardBody, CardHeader, StatCard } from "@/components/ui/card";
import { OrderStatusBadge } from "@/components/ui/badge";
import { EmptyState, Skeleton } from "@/components/ui/states";
import { getDashboardMetrics, resolveRange, type RangeKey } from "@/lib/services/analytics";
import { getSettings } from "@/lib/services/settings";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import { formatDate } from "@/lib/utils";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ rango?: string; desde?: string; hasta?: string }>;
}) {
  const params = await searchParams;
  const rangeKey = (params.rango ?? "month") as RangeKey;
  const range = resolveRange(rangeKey, params.desde, params.hasta);

  const [metrics, settings, recentOrders] = await Promise.all([
    getDashboardMetrics(range),
    getSettings(),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 6, include: { items: true } }),
  ]);

  const statusData = Object.entries(metrics.statusCounts).map(([status, value]) => ({
    name: ORDER_STATUS_LABELS[status as OrderStatus] ?? status,
    value,
  }));

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={`Resumen de ${range.label.toLowerCase()} · ${formatDate(range.start, settings.locale)} - ${formatDate(range.end, settings.locale)}`}
        action={
          <Suspense fallback={<Skeleton className="h-9 w-64" />}>
            <RangeFilter current={rangeKey} />
          </Suspense>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Ventas del día" value={formatMoney(metrics.dayTotal, settings.currency)} icon={<Wallet className="size-5" />} accent="blue" />
        <StatCard label="Ventas de la semana" value={formatMoney(metrics.weekTotal, settings.currency)} icon={<TrendingUp className="size-5" />} accent="violet" />
        <StatCard label="Ventas del mes" value={formatMoney(metrics.monthTotal, settings.currency)} icon={<Receipt className="size-5" />} accent="cyan" />
        <StatCard label="Ganancias del periodo" value={formatMoney(metrics.profit, settings.currency)} hint={`Ingresos ${formatMoney(metrics.revenue, settings.currency)}`} icon={<TrendingUp className="size-5" />} accent="emerald" />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Órdenes pendientes" value={metrics.pendingCount} icon={<Clock className="size-5" />} accent="magenta" />
        <StatCard label="Órdenes completadas" value={metrics.completedCount} icon={<CheckCircle2 className="size-5" />} accent="emerald" />
        <StatCard label="Productos vendidos" value={metrics.unitsSold} icon={<Package className="size-5" />} accent="blue" />
        <StatCard label="Clientes registrados" value={metrics.customers} icon={<Users className="size-5" />} accent="violet" />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader title="Ingresos y ganancias" description="Comportamiento diario del periodo seleccionado" />
          <CardBody>
            <RevenueAreaChart data={metrics.series} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Órdenes por estado" description="Distribución del periodo" />
          <CardBody>
            {statusData.length ? (
              <StatusPieChart data={statusData} />
            ) : (
              <EmptyState title="Sin órdenes en el periodo" />
            )}
          </CardBody>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader title="Órdenes por día" />
          <CardBody>
            <OrdersBarChart data={metrics.series} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Productos más vendidos" />
          <CardBody>
            {metrics.topProducts.length ? (
              <TopProductsChart data={metrics.topProducts} />
            ) : (
              <EmptyState title="Aún no hay ventas registradas" />
            )}
          </CardBody>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_1.4fr]">
        <Card>
          <CardHeader title="Ventas por mes" />
          <CardBody>
            {metrics.monthly.length ? <MonthlyLineChart data={metrics.monthly} /> : <EmptyState title="Sin datos mensuales" />}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Órdenes recientes"
            action={
              <Link href="/admin/ordenes" className="text-xs text-neon-cyan hover:underline">
                Ver todas
              </Link>
            }
          />
          <CardBody className="space-y-2.5">
            {recentOrders.length ? (
              recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/ordenes/${order.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line/60 bg-abyss/50 px-4 py-3 transition-colors hover:border-neon-violet/40"
                >
                  <div>
                    <p className="text-sm font-semibold text-white">{order.reference}</p>
                    <p className="text-xs text-muted">
                      {order.fullName} · {formatDate(order.createdAt, settings.locale)}
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
              <EmptyState title="Todavía no hay órdenes" description="Las nuevas órdenes aparecerán aquí." />
            )}
          </CardBody>
        </Card>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Códigos disponibles" value={metrics.inventory.AVAILABLE ?? 0} icon={<Boxes className="size-5" />} accent="emerald" />
        <StatCard label="Códigos reservados" value={metrics.inventory.RESERVED ?? 0} accent="magenta" />
        <StatCard label="Códigos entregados" value={metrics.inventory.DELIVERED ?? 0} accent="violet" />
        <StatCard label="Ticket promedio" value={formatMoney(metrics.averageTicket, settings.currency)} accent="cyan" />
      </div>
    </>
  );
}
