import { redirect } from "next/navigation";
import { PageHeader } from "@/components/admin/primitives";
import { PricingPanel } from "@/components/admin/pricing-panel";
import { prisma } from "@/lib/prisma";
import { getGlobalPricingRules, getSettings } from "@/lib/services/settings";
import { priceDenomination, resolvePricingRules } from "@/lib/pricing";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminPricingPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/admin");

  const [rules, settings, denominations] = await Promise.all([
    getGlobalPricingRules(),
    getSettings(),
    prisma.denomination.findMany({
      where: { active: true },
      include: { product: true },
      orderBy: [{ productId: "asc" }, { faceValue: "asc" }],
    }),
  ]);

  const rows = denominations.map((denomination) => {
    const resolved = resolvePricingRules(rules, denomination.product, denomination);
    const breakdown = priceDenomination(denomination, denomination.product, rules);

    return {
      id: denomination.id,
      product: denomination.product.name,
      denomination: denomination.label,
      cost: denomination.cost,
      taxRate: resolved.taxRate,
      marginRate: resolved.marginRate,
      commissionRate: resolved.commissionRate,
      roundingRule: resolved.roundingRule,
      finalPrice: breakdown.finalPrice,
      overridden:
        denomination.taxRate !== null ||
        denomination.marginRate !== null ||
        denomination.commissionRate !== null ||
        denomination.roundingRule !== null ||
        denomination.product.taxRate !== null ||
        denomination.product.marginRate !== null ||
        denomination.product.commissionRate !== null ||
        denomination.product.roundingRule !== null,
    };
  });

  return (
    <>
      <PageHeader
        title="Precios"
        description="Define las reglas globales de costo, IVA, margen, comisión y redondeo. Los precios se calculan automáticamente."
      />
      <PricingPanel rules={rules} currency={settings.currency} rows={rows} />
    </>
  );
}
