import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { LinkButton } from "@/components/ui/button";
import { OrderStatusBadge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/services/settings";
import { formatMoney } from "@/lib/money";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Orden confirmada",
  robots: { index: false, follow: false },
};

export default async function ThankYouPage({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  const [order, settings] = await Promise.all([
    prisma.order.findUnique({ where: { reference }, include: { items: true } }),
    getSettings(),
  ]);

  if (!order) notFound();

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="glass-strong space-y-6 rounded-3xl p-8 text-center">
        <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-neon-emerald/30 to-neon-cyan/20">
          <CheckCircle2 className="size-8 text-neon-emerald" />
        </div>

        <div className="space-y-2">
          <h1 className="font-display text-3xl font-bold text-white">¡Orden creada correctamente!</h1>
          <p className="text-sm text-muted">
            Guardamos tu orden <span className="font-semibold text-white">{order.reference}</span> y reservamos tus
            códigos digitales.
          </p>
        </div>

        <div className="flex justify-center">
          <OrderStatusBadge status={order.status} />
        </div>

        <dl className="grid gap-3 text-left sm:grid-cols-2">
          <Detail label="Fecha" value={formatDateTime(order.createdAt, settings.locale)} />
          <Detail label="Cliente" value={order.fullName} />
          <Detail label="Correo" value={order.email} />
          <Detail label="Total" value={formatMoney(order.total, order.currency)} />
        </dl>

        <div className="space-y-2 rounded-2xl border border-line/70 bg-abyss/60 p-5 text-left">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between gap-3 text-sm">
              <span className="text-muted">
                {item.productName} {item.denominationLabel} × {item.quantity}
              </span>
              <span className="font-medium text-white">{formatMoney(item.lineTotal, order.currency)}</span>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted">
          Te contactaremos a {order.email} con las instrucciones de pago. Cuando el pago sea aprobado, tus códigos
          aparecerán en tu cuenta.
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          <LinkButton href="/cuenta">Ver mis órdenes</LinkButton>
          <LinkButton href="/tarjetas" variant="secondary">
            Seguir comprando
          </LinkButton>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line/70 bg-abyss/60 p-3">
      <dt className="text-[10px] uppercase tracking-[0.16em] text-muted">{label}</dt>
      <dd className="mt-0.5 truncate text-sm text-white">{value}</dd>
    </div>
  );
}
