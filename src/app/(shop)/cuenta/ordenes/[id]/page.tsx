import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/ui/badge";
import { CodeReveal } from "@/components/shop/code-reveal";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Detalle de orden", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AccountOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { codes: true } }, payments: true },
  });

  if (!order || (order.userId !== user.id && order.email !== user.email)) notFound();

  const canSeeCodes = ["DELIVERED", "COMPLETED"].includes(order.status);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 px-4 py-14 sm:px-6 lg:px-8">
      <Link href="/cuenta" className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-white">
        <ArrowLeft className="size-4" /> Volver a mis órdenes
      </Link>

      <header className="glass-strong flex flex-wrap items-center justify-between gap-4 rounded-2xl p-6">
        <div className="space-y-1">
          <h1 className="font-display text-2xl font-semibold text-white">{order.reference}</h1>
          <p className="text-xs text-muted">{formatDateTime(order.createdAt)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <OrderStatusBadge status={order.status} />
          <PaymentStatusBadge status={order.paymentStatus} />
        </div>
      </header>

      <section className="glass space-y-4 rounded-2xl p-6">
        <h2 className="font-display text-base font-semibold text-white">Productos</h2>
        {order.items.map((item) => (
          <div key={item.id} className="space-y-3 rounded-xl border border-line/70 bg-abyss/50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-white">
                  {item.productName} · {item.denominationLabel}
                </p>
                <p className="text-xs text-muted">
                  {item.quantity} × {formatMoney(item.unitPrice, order.currency)}
                </p>
              </div>
              <p className="font-display text-base font-semibold text-white">
                {formatMoney(item.lineTotal, order.currency)}
              </p>
            </div>

            {canSeeCodes ? (
              <div className="space-y-2">
                {item.codes.map((code) => (
                  <CodeReveal key={code.id} code={code.secret} />
                ))}
              </div>
            ) : (
              <p className="rounded-xl border border-line/70 bg-surface/60 px-3 py-2.5 text-xs text-muted">
                Los códigos se mostrarán aquí cuando la orden sea entregada.
              </p>
            )}
          </div>
        ))}
      </section>

      <section className="glass space-y-3 rounded-2xl p-6 text-sm">
        <h2 className="font-display text-base font-semibold text-white">Resumen</h2>
        <Row label="Subtotal" value={formatMoney(order.subtotal, order.currency)} />
        <Row label="IVA incluido" value={formatMoney(order.taxTotal, order.currency)} />
        {order.discount > 0 ? <Row label="Descuento" value={`- ${formatMoney(order.discount, order.currency)}`} /> : null}
        <Row label="Total" value={formatMoney(order.total, order.currency)} strong />
      </section>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between border-t border-line/50 pt-2 first:border-0 first:pt-0">
      <span className="text-muted">{label}</span>
      <span className={strong ? "font-display text-lg font-semibold text-white" : "text-white"}>{value}</span>
    </div>
  );
}
