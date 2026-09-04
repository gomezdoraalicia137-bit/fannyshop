import { ROUNDING_RULES, type RoundingRule } from "./constants";
import { applyRounding, round2 } from "./money";

export type PricingRules = {
  taxRate: number;
  marginRate: number;
  commissionRate: number;
  roundingRule: RoundingRule;
};

export type PricingOverrides = {
  taxRate?: number | null;
  marginRate?: number | null;
  commissionRate?: number | null;
  roundingRule?: string | null;
};

export type PriceBreakdown = {
  cost: number;
  taxRate: number;
  marginRate: number;
  commissionRate: number;
  roundingRule: RoundingRule;
  taxAmount: number;
  costWithTax: number;
  marginAmount: number;
  commissionAmount: number;
  rawPrice: number;
  finalPrice: number;
  roundingDelta: number;
  netRevenue: number;
  profit: number;
};

export const DEFAULT_PRICING_RULES: PricingRules = {
  taxRate: 0.13,
  marginRate: 0.1,
  commissionRate: 0,
  roundingRule: "END_49",
};

export function isRoundingRule(value: unknown): value is RoundingRule {
  return typeof value === "string" && (ROUNDING_RULES as readonly string[]).includes(value);
}

export function resolvePricingRules(
  global: PricingRules,
  ...overrides: (PricingOverrides | null | undefined)[]
): PricingRules {
  return overrides.reduce<PricingRules>((acc, override) => {
    if (!override) return acc;
    return {
      taxRate: numberOr(override.taxRate, acc.taxRate),
      marginRate: numberOr(override.marginRate, acc.marginRate),
      commissionRate: numberOr(override.commissionRate, acc.commissionRate),
      roundingRule: isRoundingRule(override.roundingRule) ? override.roundingRule : acc.roundingRule,
    };
  }, global);
}

function numberOr(value: number | null | undefined, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function calculatePrice(cost: number, rules: PricingRules): PriceBreakdown {
  const safeCost = Number.isFinite(cost) && cost > 0 ? cost : 0;
  const taxAmount = round2(safeCost * rules.taxRate);
  const costWithTax = round2(safeCost + taxAmount);
  const marginAmount = round2(costWithTax * rules.marginRate);
  const commissionAmount = round2((costWithTax + marginAmount) * rules.commissionRate);
  const rawPrice = round2(costWithTax + marginAmount + commissionAmount);
  const finalPrice = applyRounding(rawPrice, rules.roundingRule);
  const netRevenue = round2(finalPrice - taxAmount - commissionAmount);

  return {
    cost: safeCost,
    taxRate: rules.taxRate,
    marginRate: rules.marginRate,
    commissionRate: rules.commissionRate,
    roundingRule: rules.roundingRule,
    taxAmount,
    costWithTax,
    marginAmount,
    commissionAmount,
    rawPrice,
    finalPrice,
    roundingDelta: round2(finalPrice - rawPrice),
    netRevenue,
    profit: round2(netRevenue - safeCost),
  };
}

export function priceDenomination(
  denomination: { cost: number } & PricingOverrides,
  product: PricingOverrides,
  global: PricingRules,
): PriceBreakdown {
  const rules = resolvePricingRules(global, product, denomination);
  return calculatePrice(denomination.cost, rules);
}
