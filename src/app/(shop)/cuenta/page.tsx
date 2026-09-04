import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Package, Receipt, Wallet } from "lucide-react";
import { StatCard } from "@/components/ui/card";
import { OrderStatusBadge } from "@/components/ui/badge";
import { EmptyState, SectionHeading } from "@/components/ui/states";
import { LinkButton } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Mi cuenta", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const orders = await prisma.order.findMany({
    where: { OR: [{ userId: user.id }, { email: user.email }] },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  const totalSpent = orders
    .filter((order) => ["PAID", "DELIVERED", "COMPLETED"].includes(order.status))
    .reduce((total, order) => total + order.total, 0);

  const deliveredCodes = await prisma.digitalCode.count({
    where: { orderItem: { order: { OR: [{ userId: user.id }, { email: user.email }] } }, status: "DELIVERED" },
  });

  return (
    <div className="mx-auto w-full max-w-7xl space-y-10 px-4 py-14 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Mi cuenta"
        title={`Hola, ${user.name.split(" ")[0]}`}
        description={`${user.email} · miembro desde ${formatDate(user.createdAt)}`}
        action={
          <form action="/api/auth/logout" method="post">
            <button type="submit" className="cursor-pointer text-sm text-muted hover:text-white">
              Cerrar sesión
            </button>
          </form>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Órdenes" value={orders.length} icon={<Receipt className="size-5" />} accent="blue" />
        <StatCard label="Total gastado" value={formatMoney(totalSpent)} icon={<Wallet className="size-5" />} accent="violet" />
        <StatCard label="Códigos entregados" value={deliveredCodes} icon={<Package className="size-5" />} accent="cyan" />
      </div>

      <div className="space-y-4">
        <h2 className="font-display text-xl font-semibold text-white">Historial de órdenes</h2>

        {orders.length ? (
          <div className="space-y-3">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/cuenta/ordenes/${order.id}`}
                className="glass flex flex-col gap-3 rounded-2xl p-5 transition-colors hover:border-neon-violet/40 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-1">
                  <p className="font-display text-sm font-semibold text-white">{order.reference}</p>
                  <p className="text-xs text-muted">
                    {formatDate(order.createdAt)} · {order.items.length} productos
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <OrderStatusBadge status={order.status} />
                  <span className="font-display text-lg font-semibold text-white">
                    {formatMoney(order.total, order.currency)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Aún no tienes órdenes"
            description="Cuando compres una tarjeta digital aparecerá aquí junto a sus códigos."
            icon={<Receipt className="size-6" />}
            action={<LinkButton href="/tarjetas" size="sm">Explorar catálogo</LinkButton>}
          />
        )}
      </div>
    </div>
  );
}
