import { redirect } from "next/navigation";
import { PageHeader } from "@/components/admin/primitives";
import { CouponsManager } from "@/components/admin/coupons-manager";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/services/settings";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/admin");

  const [coupons, settings] = await Promise.all([
    prisma.coupon.findMany({ orderBy: { createdAt: "desc" } }),
    getSettings(),
  ]);

  const rows = coupons.map((coupon) => ({
    id: coupon.id,
    code: coupon.code,
    type: coupon.type,
    value: coupon.value,
    startsAt: coupon.startsAt?.toISOString() ?? null,
    endsAt: coupon.endsAt?.toISOString() ?? null,
    maxUses: coupon.maxUses,
    usedCount: coupon.usedCount,
    minTotal: coupon.minTotal,
    productIds: coupon.productIds,
    categoryIds: coupon.categoryIds,
    active: coupon.active,
  }));

  return (
    <>
      <PageHeader title="Promociones" description="Gestiona cupones de descuento por porcentaje o monto fijo." />
      <CouponsManager coupons={rows} currency={settings.currency} locale={settings.locale} />
    </>
  );
}
