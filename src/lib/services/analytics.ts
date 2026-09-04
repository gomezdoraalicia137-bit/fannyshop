import { prisma } from "@/lib/prisma";
import { round2 } from "@/lib/money";

const REVENUE_STATUSES = ["PAID", "PROCESSING", "DELIVERED", "COMPLETED"];

export type RangeKey = "today" | "7d" | "month" | "prev-month" | "year" | "custom";

export function resolveRange(key: RangeKey, from?: string, to?: string): { start: Date; end: Date; label: string } {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  switch (key) {
    case "today":
      return { start: new Date(now.getFullYear(), now.getMonth(), now.getDate()), end, label: "Hoy" };
    case "7d": {
      const start = new Date(end);
      start.setDate(start.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      return { start, end, label: "Últimos 7 días" };
    }
    case "prev-month": {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      return { start, end: monthEnd, label: "Mes anterior" };
    }
    case "year":
      return { start: new Date(now.getFullYear(), 0, 1), end, label: "Este año" };
    case "custom": {
      const start = from ? new Date(from) : new Date(now.getFullYear(), now.getMonth(), 1);
      const customEnd = to ? new Date(`${to}T23:59:59`) : end;
      return { start, end: customEnd, label: "Personalizado" };
    }
    default:
      return { start: new Date(now.getFullYear(), now.getMonth(), 1), end, label: "Este mes" };
  }
}

export async function getDashboardMetrics(range: { start: Date; end: Date }) {
  const [orders, customers, codes] = await Promise.all([
    prisma.order.findMany({
      where: { createdAt: { gte: range.start, lte: range.end } },
      include: { items: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.digitalCode.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const paidOrders = orders.filter((order) => REVENUE_STATUSES.includes(order.status));

  const revenue = round2(paidOrders.reduce((total, order) => total + order.total, 0));
  const profit = round2(paidOrders.reduce((total, order) => total + order.profitTotal, 0));
  const taxes = round2(paidOrders.reduce((total, order) => total + order.taxTotal, 0));
  const unitsSold = paidOrders.reduce(
    (total, order) => total + order.items.reduce((sum, item) => sum + item.quantity, 0),
    0,
  );

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfDay);
  startOfWeek.setDate(startOfWeek.getDate() - 6);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [dayTotal, weekTotal, monthTotal] = await Promise.all([
    sumRevenue(startOfDay),
    sumRevenue(startOfWeek),
    sumRevenue(startOfMonth),
  ]);

  const series = buildDailySeries(paidOrders, range);
  const monthly = buildMonthlySeries(paidOrders);

  const topProducts = aggregateProducts(paidOrders);

  const statusCounts = orders.reduce<Record<string, number>>((acc, order) => {
    acc[order.status] = (acc[order.status] ?? 0) + 1;
    return acc;
  }, {});

  const inventory = codes.reduce<Record<string, number>>((acc, row) => {
    acc[row.status] = row._count._all;
    return acc;
  }, {});

  return {
    revenue,
    profit,
    taxes,
    unitsSold,
    orderCount: orders.length,
    paidCount: paidOrders.length,
    pendingCount: orders.filter((order) => ["PENDING", "AWAITING_PAYMENT", "PROCESSING"].includes(order.status)).length,
    completedCount: orders.filter((order) => ["COMPLETED", "DELIVERED"].includes(order.status)).length,
    customers,
    dayTotal,
    weekTotal,
    monthTotal,
    series,
    monthly,
    topProducts,
    statusCounts,
    inventory,
    averageTicket: paidOrders.length ? round2(revenue / paidOrders.length) : 0,
  };
}

async function sumRevenue(start: Date) {
  const result = await prisma.order.aggregate({
    where: { createdAt: { gte: start }, status: { in: REVENUE_STATUSES } },
    _sum: { total: true },
  });
  return round2(result._sum.total ?? 0);
}

type OrderWithItems = Awaited<ReturnType<typeof prisma.order.findMany>> extends (infer T)[] ? T : never;

function buildDailySeries(
  orders: (OrderWithItems & { items: { quantity: number; productName: string; lineTotal: number; unitCost: number }[] })[],
  range: { start: Date; end: Date },
) {
  const days: { date: string; label: string; ingresos: number; ganancias: number; ordenes: number }[] = [];
  const cursor = new Date(range.start);
  cursor.setHours(0, 0, 0, 0);

  while (cursor <= range.end && days.length < 190) {
    const key = cursor.toISOString().slice(0, 10);
    days.push({
      date: key,
      label: `${cursor.getDate()}/${cursor.getMonth() + 1}`,
      ingresos: 0,
      ganancias: 0,
      ordenes: 0,
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  for (const order of orders) {
    const key = order.createdAt.toISOString().slice(0, 10);
    const bucket = days.find((day) => day.date === key);
    if (!bucket) continue;
    bucket.ingresos = round2(bucket.ingresos + order.total);
    bucket.ganancias = round2(bucket.ganancias + order.profitTotal);
    bucket.ordenes += 1;
  }

  return days;
}

function buildMonthlySeries(
  orders: (OrderWithItems & { items: { quantity: number }[] })[],
) {
  const months = new Map<string, { label: string; ingresos: number; ganancias: number }>();

  for (const order of orders) {
    const key = `${order.createdAt.getFullYear()}-${String(order.createdAt.getMonth() + 1).padStart(2, "0")}`;
    const current = months.get(key) ?? { label: key, ingresos: 0, ganancias: 0 };
    current.ingresos = round2(current.ingresos + order.total);
    current.ganancias = round2(current.ganancias + order.profitTotal);
    months.set(key, current);
  }

  return [...months.values()];
}

function aggregateProducts(
  orders: { items: { productName: string; quantity: number; lineTotal: number; unitCost: number }[] }[],
) {
  const map = new Map<string, { name: string; unidades: number; ingresos: number; ganancia: number }>();

  for (const order of orders) {
    for (const item of order.items) {
      const current = map.get(item.productName) ?? { name: item.productName, unidades: 0, ingresos: 0, ganancia: 0 };
      current.unidades += item.quantity;
      current.ingresos = round2(current.ingresos + item.lineTotal);
      current.ganancia = round2(current.ganancia + (item.lineTotal - item.unitCost * item.quantity));
      map.set(item.productName, current);
    }
  }

  return [...map.values()].sort((a, b) => b.unidades - a.unidades).slice(0, 8);
}
