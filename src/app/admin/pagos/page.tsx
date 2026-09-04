import Link from "next/link";
import { redirect } from "next/navigation";
import { DataTable, PageHeader, Td } from "@/components/admin/primitives";
import { PaymentStatusBadge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/services/settings";
import { getCurrentUser } from "@/lib/auth";
import { formatMoney } from "@/lib/money";
import { formatDateTime } from "@/lib/utils";
import { PAYMENT_METHODS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/admin");

  const [payments, settings] = await Promise.all([
    prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
      include: { order: { select: { id: true, reference: true, fullName: true, email: true } } },
    }),
    getSettings(),
  ]);

  const approved = payments.filter((payment) => payment.status === "APPROVED");
  const pending = payments.filter((payment) => payment.status === "PENDING");
  const refunded = payments.filter((payment) => payment.status === "REFUNDED");

  const methodLabel = (id: string) => PAYMENT_METHODS.find((method) => method.id === id)?.label ?? id;

  return (
    <>
      <PageHeader
        title="Pagos"
        description="Registro de transacciones. La arquitectura está lista para integrar proveedores reales mediante variables de entorno."
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Pagos aprobados" value={approved.length} accent="emerald" />
        <StatCard
          label="Monto aprobado"
          value={formatMoney(approved.reduce((total, payment) => total + payment.amount, 0), settings.currency)}
          accent="blue"
        />
        <StatCard label="Pendientes" value={pending.length} accent="magenta" />
        <StatCard label="Reembolsados" value={refunded.length} accent="violet" />
      </div>

      {payments.length ? (
        <DataTable headers={["ID de pago", "Orden", "Cliente", "Método", "Monto", "Estado", "Fecha"]}>
          {payments.map((payment) => (
            <tr key={payment.id} className="transition-colors hover:bg-white/[0.03]">
              <Td className="font-mono text-xs text-neon-cyan">{payment.reference}</Td>
              <Td>
                <Link href={`/admin/ordenes/${payment.order.id}`} className="text-sm text-white hover:text-neon-cyan">
                  {payment.order.reference}
                </Link>
              </Td>
              <Td>
                <p className="text-sm">{payment.order.fullName}</p>
                <p className="text-xs text-muted">{payment.order.email}</p>
              </Td>
              <Td className="text-sm">{methodLabel(payment.method)}</Td>
              <Td className="font-semibold">{formatMoney(payment.amount, settings.currency)}</Td>
              <Td><PaymentStatusBadge status={payment.status} /></Td>
              <Td className="text-xs text-muted">{formatDateTime(payment.createdAt, settings.locale)}</Td>
            </tr>
          ))}
        </DataTable>
      ) : (
        <EmptyState title="Sin pagos registrados" description="Los pagos se generan automáticamente al crear una orden." />
      )}
    </>
  );
}
