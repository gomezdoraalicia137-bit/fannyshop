"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Eye, Search } from "lucide-react";
import { DataTable, Td } from "@/components/admin/primitives";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/states";
import { Select } from "@/components/ui/field";
import { formatMoney } from "@/lib/money";
import { formatDate } from "@/lib/utils";
import { ORDER_STATUSES, ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/constants";

export type AdminOrderRow = {
  id: string;
  reference: string;
  customer: string;
  email: string;
  items: number;
  total: number;
  currency: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
};

export function OrdersTable({ orders, locale }: { orders: AdminOrderRow[]; locale: string }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const [sort, setSort] = useState<"recent" | "total">("recent");

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return orders
      .filter((order) => {
        const matchesTerm =
          !term ||
          order.reference.toLowerCase().includes(term) ||
          order.customer.toLowerCase().includes(term) ||
          order.email.toLowerCase().includes(term);
        const matchesStatus = status === "ALL" || order.status === status;
        return matchesTerm && matchesStatus;
      })
      .sort((a, b) =>
        sort === "total"
          ? b.total - a.total
          : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }, [orders, query, status, sort]);

  return (
    <div className="space-y-4">
      <div className="glass flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center">
        <div className="flex h-11 flex-1 items-center gap-2.5 rounded-xl border border-line/80 bg-abyss/70 px-4">
          <Search className="size-4 text-muted" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por referencia, cliente o correo"
            aria-label="Buscar órdenes"
            className="h-full w-full bg-transparent text-sm text-white placeholder:text-muted/70 focus:outline-none"
          />
        </div>
        <Select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filtrar por estado" className="sm:w-52">
          <option value="ALL">Todos los estados</option>
          {ORDER_STATUSES.map((item) => (
            <option key={item} value={item}>
              {ORDER_STATUS_LABELS[item as OrderStatus]}
            </option>
          ))}
        </Select>
        <Select value={sort} onChange={(event) => setSort(event.target.value as "recent" | "total")} aria-label="Ordenar" className="sm:w-44">
          <option value="recent">Más recientes</option>
          <option value="total">Mayor monto</option>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="Sin órdenes" description="No hay órdenes que coincidan con los filtros aplicados." />
      ) : (
        <>
          <div className="hidden lg:block">
            <DataTable headers={["ID", "Cliente", "Productos", "Total", "Pago", "Estado", "Fecha", "Acciones"]}>
              {filtered.map((order) => (
                <tr key={order.id} className="transition-colors hover:bg-white/[0.03]">
                  <Td className="font-mono text-xs text-neon-cyan">{order.reference}</Td>
                  <Td>
                    <p className="text-sm font-medium text-white">{order.customer}</p>
                    <p className="text-xs text-muted">{order.email}</p>
                  </Td>
                  <Td>{order.items}</Td>
                  <Td className="font-semibold">{formatMoney(order.total, order.currency)}</Td>
                  <Td><PaymentStatusBadge status={order.paymentStatus} /></Td>
                  <Td><OrderStatusBadge status={order.status} /></Td>
                  <Td className="text-xs text-muted">{formatDate(order.createdAt, locale)}</Td>
                  <Td>
                    <Link
                      href={`/admin/ordenes/${order.id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-line/70 px-2.5 py-1.5 text-xs text-muted transition-colors hover:border-neon-violet/50 hover:text-white"
                    >
                      <Eye className="size-3.5" /> Ver
                    </Link>
                  </Td>
                </tr>
              ))}
            </DataTable>
          </div>

          <div className="grid gap-3 lg:hidden">
            {filtered.map((order) => (
              <Link
                key={order.id}
                href={`/admin/ordenes/${order.id}`}
                className="glass space-y-3 rounded-2xl p-4 transition-colors hover:border-neon-violet/40"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-neon-cyan">{order.reference}</span>
                  <OrderStatusBadge status={order.status} />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{order.customer}</p>
                  <p className="text-xs text-muted">{order.email}</p>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-xs text-muted">{formatDate(order.createdAt, locale)}</span>
                  <span className="font-display font-semibold text-white">{formatMoney(order.total, order.currency)}</span>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
