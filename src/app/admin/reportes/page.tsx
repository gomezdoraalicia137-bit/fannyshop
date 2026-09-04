import { Suspense } from "react";
import { redirect } from "next/navigation";
import { DataTable, PageHeader, Td } from "@/components/admin/primitives";
import { RangeFilter } from "@/components/admin/range-filter";
import { ExportButton } from "@/components/admin/export-button";
import { MonthlyLineChart, RevenueAreaChart, TopProductsChart } from "@/components/admin/charts";
import { Card, CardBody, CardHeader, StatCard } from "@/components/ui/card";
import { EmptyState, Skeleton } from "@/components/ui/states";
import { getDashboardMetrics, resolveRange, type RangeKey } from "@/lib/services/analytics";
import { getSettings } from "@/lib/services/settings";
import { getCurrentUser } from "@/lib/auth";
import { inventoryStats } from "@/lib/services/inventory";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ rango?: string; desde?: string; hasta?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/admin");

  const params = await searchParams;
  const rangeKey = (params.rango ?? "month") as RangeKey;
  const range = resolveRange(rangeKey, params.desde, params.hasta);

  const [metrics, settings, inventory, customers] = await Promise.all([
    getDashboardMetrics(range),
    getSettings(),
    inventoryStats(),
    prisma.user.count({ where: { role: "CUSTOMER", createdAt: { gte: range.start, lte: range.end } } }),
  ]);

  return (
    <>
      <PageHeader
        title="Reportes"
        description={`${range.label} · ${formatDate(range.start, settings.locale)} - ${formatDate(range.end, settings.locale)}`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Suspense fallback={<Skeleton className="h-9 w-56" />}>
              <RangeFilter current={rangeKey} />
            </Suspense>
            <ExportButton
              filename={`reporte-ventas-${range.start.toISOString().slice(0, 10)}`}
              headers={["Fecha", "Ingresos", "Ganancias", "Órdenes"]}
              rows={metrics.series.map((row) => [row.date, row.ingresos, row.ganancias, row.ordenes])}
            />
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Ingresos" value={formatMoney(metrics.revenue, settings.currency)} accent="blue" />
        <StatCard label="Ganancias" value={formatMoney(metrics.profit, settings.currency)} accent="emerald" />
        <StatCard label="IVA recaudado" value={formatMoney(metrics.taxes, settings.currency)} accent="violet" />
        <StatCard label="Ticket promedio" value={formatMoney(metrics.averageTicket, settings.currency)} accent="cyan" />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Órdenes" value={metrics.orderCount} accent="blue" />
        <StatCard label="Productos vendidos" value={metrics.unitsSold} accent="magenta" />
        <StatCard label="Clientes nuevos" value={customers} accent="violet" />
        <StatCard label="Códigos disponibles" value={inventory.AVAILABLE ?? 0} accent="emerald" />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader title="Ingresos y ganancias" />
          <CardBody>
            <RevenueAreaChart data={metrics.series} />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Evolución mensual" />
          <CardBody>
            {metrics.monthly.length ? <MonthlyLineChart data={metrics.monthly} /> : <EmptyState title="Sin datos" />}
          </CardBody>
        </Card>
      </div>

      <Card className="mt-5">
        <CardHeader
          title="Reporte de productos"
          action={
            <ExportButton
              filename="reporte-productos"
              headers={["Producto", "Unidades", "Ingresos", "Ganancia"]}
              rows={metrics.topProducts.map((row) => [row.name, row.unidades, row.ingresos, row.ganancia])}
            />
          }
        />
        <CardBody className="space-y-5">
          {metrics.topProducts.length ? (
            <>
              <TopProductsChart data={metrics.topProducts} />
              <DataTable headers={["Producto", "Unidades", "Ingresos", "Ganancia"]}>
                {metrics.topProducts.map((row) => (
                  <tr key={row.name} className="transition-colors hover:bg-white/[0.03]">
                    <Td className="text-sm">{row.name}</Td>
                    <Td>{row.unidades}</Td>
                    <Td className="font-semibold">{formatMoney(row.ingresos, settings.currency)}</Td>
                    <Td className="text-neon-emerald">{formatMoney(row.ganancia, settings.currency)}</Td>
                  </tr>
                ))}
              </DataTable>
            </>
          ) : (
            <EmptyState title="Sin ventas en el periodo" description="Ajusta el rango de fechas para ver resultados." />
          )}
        </CardBody>
      </Card>

      <Card className="mt-5">
        <CardHeader title="Reporte de inventario" />
        <CardBody>
          <DataTable headers={["Estado", "Códigos"]}>
            {Object.entries(inventory).map(([status, count]) => (
              <tr key={status} className="transition-colors hover:bg-white/[0.03]">
                <Td className="text-sm">{status}</Td>
                <Td className="font-semibold">{count}</Td>
              </tr>
            ))}
          </DataTable>
        </CardBody>
      </Card>
    </>
  );
}
