"use client";

import { calculatePrice, type PricingRules } from "@/lib/pricing";
import { formatMoney, formatPercent } from "@/lib/money";
import { ROUNDING_RULE_LABELS, type RoundingRule } from "@/lib/constants";

export function PricePreview({
  cost,
  rules,
  currency,
  compact = false,
}: {
  cost: number;
  rules: PricingRules;
  currency: string;
  compact?: boolean;
}) {
  const breakdown = calculatePrice(cost, rules);

  const rows = [
    { label: "Costo base", value: formatMoney(breakdown.cost, currency) },
    { label: `IVA (${formatPercent(breakdown.taxRate)})`, value: formatMoney(breakdown.taxAmount, currency) },
    { label: "Costo con IVA", value: formatMoney(breakdown.costWithTax, currency) },
    { label: `Margen (${formatPercent(breakdown.marginRate)})`, value: formatMoney(breakdown.marginAmount, currency) },
    { label: `Comisión (${formatPercent(breakdown.commissionRate)})`, value: formatMoney(breakdown.commissionAmount, currency) },
    { label: "Precio calculado", value: formatMoney(breakdown.rawPrice, currency) },
    { label: `Redondeo (${ROUNDING_RULE_LABELS[breakdown.roundingRule as RoundingRule]})`, value: formatMoney(breakdown.roundingDelta, currency) },
  ];

  return (
    <div className="glass-strong space-y-3 rounded-2xl p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Vista previa de precio</p>

      <dl className={compact ? "space-y-1.5" : "space-y-2"}>
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-3 text-sm">
            <dt className="text-muted">{row.label}</dt>
            <dd className="font-medium text-white">{row.value}</dd>
          </div>
        ))}
      </dl>

      <div className="flex items-end justify-between gap-3 border-t border-line/60 pt-3">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-muted">Precio final</p>
          <p className="font-display text-3xl font-semibold neon-text">{formatMoney(breakdown.finalPrice, currency)}</p>
        </div>
        <div className="text-right text-xs text-muted">
          <p>Ganancia estimada</p>
          <p className="font-display text-base font-semibold text-neon-emerald">
            {formatMoney(breakdown.profit, currency)}
          </p>
        </div>
      </div>
    </div>
  );
}
