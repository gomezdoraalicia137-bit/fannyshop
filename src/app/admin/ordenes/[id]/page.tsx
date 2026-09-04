import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/admin/primitives";
import { AssignCodeButton, OrderActions } from "@/components/admin/order-actions";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { CodeStatusBadge, OrderStatusBadge, PaymentStatusBadge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/services/settings";
import { maskCode } from "@/lib/services/inventory";
import { formatMoney, formatPercent } from "@/lib/money";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [order, settings] = await Promise.all([
    prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { codes: true, denomination: true } },
        payments: true,
        user: { select: { id: true, name: true, email: true } },
      },
    }),
    getSettings(),
  ]);

  if (!order) notFound();

  const availableByDenomination = new Map<string, { id: string; masked: string; batch: string | null }[]>();
  for (const item of order.items) {
    const codes = await prisma.digitalCode.findMany({
      where: { denominationId: item.denominationId, status: "AVAILABLE" },
      take: 25,
    });
    availableByDenomination.set(
      item.denominationId,
      codes.map((code) => ({ id: code.id, masked: maskCode(code.secret), batch: code.batch })),
    );
  }

  const auditLogs = await prisma.auditLog.findMany({
    where: { entityId: order.id },
    orderBy: { createdAt: "desc" },
    take: 12,
  });

  return (
    <>
      <Link href="/admin/ordenes" className="mb-4 inline-flex items-center gap-2 text-sm text-muted hover:text-white">
        <ArrowLeft className="size-4" /> Volver a órdenes
      </Link>

      <PageHeader
        title={`Orden ${order.reference}`}
        description={formatDateTime(order.createdAt, settings.locale)}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <OrderStatusBadge status={order.status} />
            <PaymentStatusBadge status={order.paymentStatus} />
          </div>
        }
      />

      <Card className="mb-5">
        <CardHeader title="Acciones" description="Los cambios quedan registrados en el audit log." />
        <CardBody>
          <OrderActions orderId={order.id} status={order.status} />
        </CardBody>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-5">
          <Card>
            <CardHeader title="Productos y precios históricos" />
            <CardBody className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="space-y-3 rounded-xl border border-line/60 bg-abyss/50 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
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

                  <dl className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                    <Meta label="Costo" value={formatMoney(item.unitCost, order.currency)} />
                    <Meta label="IVA" value={`${formatPercent(item.taxRate)} · ${formatMoney(item.unitTax, order.currency)}`} />
                    <Meta label="Margen" value={`${formatPercent(item.marginRate)} · ${formatMoney(item.unitMargin, order.currency)}`} />
                    <Meta label="Redondeo" value={item.roundingRule} />
                  </dl>

                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs uppercase tracking-[0.14em] text-muted">
                        Códigos asignados ({item.codes.length}/{item.quantity})
                      </p>
                      <AssignCodeButton
                        orderItemId={item.id}
                        codes={availableByDenomination.get(item.denominationId) ?? []}
                      />
                    </div>
                    {item.codes.length ? (
                      item.codes.map((code) => (
                        <div key={code.id} className="flex items-center justify-between gap-3 rounded-lg border border-line/60 bg-surface/60 px-3 py-2">
                          <code className="font-mono text-xs text-neon-cyan">{maskCode(code.secret)}</code>
                          <CodeStatusBadge status={code.status} />
                        </div>
                      ))
                    ) : (
                      <p className="rounded-lg border border-line/60 bg-surface/50 px-3 py-2 text-xs text-muted">
                        Sin códigos asignados todavía.
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Historial administrativo" />
            <CardBody className="space-y-2">
              {auditLogs.length ? (
                auditLogs.map((log) => (
                  <div key={log.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line/60 bg-abyss/50 px-3 py-2 text-xs">
                    <span className="font-medium text-white">{log.action}</span>
                    <span className="text-muted">
                      {log.actorEmail ?? "sistema"} · {formatDateTime(log.createdAt, settings.locale)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted">Sin registros.</p>
              )}
            </CardBody>
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader title="Cliente" />
            <CardBody className="space-y-2 text-sm">
              <Row label="Nombre" value={order.fullName} />
              <Row label="Correo" value={order.email} />
              <Row label="Teléfono" value={order.phone ?? "No proporcionado"} />
              <Row label="Cuenta" value={order.user ? "Registrado" : "Invitado"} />
              {order.notes ? <Row label="Notas" value={order.notes} /> : null}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Resumen financiero" />
            <CardBody className="space-y-2 text-sm">
              <Row label="Subtotal" value={formatMoney(order.subtotal, order.currency)} />
              <Row label="IVA" value={formatMoney(order.taxTotal, order.currency)} />
              <Row label="Descuento" value={formatMoney(order.discount, order.currency)} />
              <Row label="Total" value={formatMoney(order.total, order.currency)} />
              <Row label="Costo" value={formatMoney(order.costTotal, order.currency)} />
              <Row label="Ganancia" value={formatMoney(order.profitTotal, order.currency)} />
              {order.couponCode ? <Row label="Cupón" value={order.couponCode} /> : null}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Pagos" />
            <CardBody className="space-y-2">
              {order.payments.map((payment) => (
                <div key={payment.id} className="space-y-1 rounded-lg border border-line/60 bg-abyss/50 px-3 py-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs text-neon-cyan">{payment.reference}</span>
                    <PaymentStatusBadge status={payment.status} />
                  </div>
                  <p className="text-xs text-muted">
                    {payment.method} · {formatMoney(payment.amount, order.currency)}
                  </p>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-line/40 pb-2 last:border-0 last:pb-0">
      <span className="text-xs uppercase tracking-[0.12em] text-muted">{label}</span>
      <span className="text-right text-sm text-white/90">{value}</span>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line/60 bg-surface/50 px-2.5 py-2">
      <dt className="text-[10px] uppercase tracking-[0.14em] text-muted">{label}</dt>
      <dd className="mt-0.5 text-xs text-white">{value}</dd>
    </div>
  );
}
