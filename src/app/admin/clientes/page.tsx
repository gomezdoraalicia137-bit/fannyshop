import Link from "next/link";
import { DataTable, PageHeader, Td } from "@/components/admin/primitives";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/states";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/services/settings";
import { formatMoney } from "@/lib/money";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const REVENUE_STATUSES = ["PAID", "PROCESSING", "DELIVERED", "COMPLETED"];

export default async function AdminCustomersPage() {
  const [customers, settings] = await Promise.all([
    prisma.user.findMany({
      where: { role: "CUSTOMER" },
      orderBy: { createdAt: "desc" },
      include: { orders: true },
    }),
    getSettings(),
  ]);

  return (
    <>
      <PageHeader title="Clientes" description={`${customers.length} clientes registrados`} />

      {customers.length ? (
        <>
          <div className="hidden lg:block">
            <DataTable headers={["Cliente", "Correo", "Registro", "Órdenes", "Total gastado", "Estado", ""]}>
              {customers.map((customer) => {
                const spent = customer.orders
                  .filter((order) => REVENUE_STATUSES.includes(order.status))
                  .reduce((total, order) => total + order.total, 0);

                return (
                  <tr key={customer.id} className="transition-colors hover:bg-white/[0.03]">
                    <Td className="font-medium">{customer.name}</Td>
                    <Td className="text-sm text-muted">{customer.email}</Td>
                    <Td className="text-xs text-muted">{formatDate(customer.createdAt, settings.locale)}</Td>
                    <Td>{customer.orders.length}</Td>
                    <Td className="font-semibold">{formatMoney(spent, settings.currency)}</Td>
                    <Td>
                      <Badge tone={customer.status === "ACTIVE" ? "emerald" : "rose"}>
                        {customer.status === "ACTIVE" ? "Activo" : "Bloqueado"}
                      </Badge>
                    </Td>
                    <Td>
                      <Link href={`/admin/clientes/${customer.id}`} className="text-xs text-neon-cyan hover:underline">
                        Ver historial
                      </Link>
                    </Td>
                  </tr>
                );
              })}
            </DataTable>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:hidden">
            {customers.map((customer) => {
              const spent = customer.orders
                .filter((order) => REVENUE_STATUSES.includes(order.status))
                .reduce((total, order) => total + order.total, 0);
              return (
                <Link key={customer.id} href={`/admin/clientes/${customer.id}`} className="glass space-y-2 rounded-2xl p-4">
                  <p className="text-sm font-semibold text-white">{customer.name}</p>
                  <p className="text-xs text-muted">{customer.email}</p>
                  <div className="flex items-center justify-between text-xs text-muted">
                    <span>{customer.orders.length} órdenes</span>
                    <span className="font-display text-sm font-semibold text-white">
                      {formatMoney(spent, settings.currency)}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      ) : (
        <EmptyState title="Sin clientes" description="Los clientes registrados aparecerán aquí." />
      )}
    </>
  );
}
