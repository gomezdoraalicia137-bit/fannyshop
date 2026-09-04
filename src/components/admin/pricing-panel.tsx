"use client";

import { useActionState, useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/field";
import { DataTable, Td } from "@/components/admin/primitives";
import { PricePreview } from "@/components/admin/price-preview";
import { useToast } from "@/components/ui/toast";
import { savePricingAction, type ActionState } from "@/lib/actions/admin";
import { calculatePrice, resolvePricingRules, type PricingRules } from "@/lib/pricing";
import { ROUNDING_RULES, ROUNDING_RULE_LABELS, type RoundingRule } from "@/lib/constants";
import { formatMoney, formatPercent } from "@/lib/money";

export type PricingProductRow = {
  id: string;
  product: string;
  denomination: string;
  cost: number;
  taxRate: number;
  marginRate: number;
  commissionRate: number;
  roundingRule: string;
  finalPrice: number;
  overridden: boolean;
};

export function PricingPanel({
  rules,
  currency,
  rows,
}: {
  rules: PricingRules;
  currency: string;
  rows: PricingProductRow[];
}) {
  const toast = useToast();
  const [draft, setDraft] = useState(rules);
  const [sampleCost, setSampleCost] = useState(10);

  const [state, action, pending] = useActionState<ActionState, FormData>(async (prev, formData) => {
    const result = await savePricingAction(prev, formData);
    if (result?.ok) toast.success(result.message);
    else if (result) toast.error(result.message);
    return result;
  }, null);

  const preview = calculatePrice(sampleCost, draft);

  return (
    <div className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
      <div className="space-y-5">
        <Card>
          <CardHeader title="Configuración global de precios" description="Aplica a todos los productos sin configuración propia." />
          <CardBody>
            <form action={action} className="grid gap-4 sm:grid-cols-2">
              <Field label="IVA global (%)" required>
                <Input
                  name="taxRate"
                  type="number"
                  step="0.01"
                  min="0"
                  value={(draft.taxRate * 100).toFixed(2)}
                  onChange={(event) => setDraft({ ...draft, taxRate: Number(event.target.value) / 100 })}
                  required
                />
              </Field>
              <Field label="Margen global (%)" required>
                <Input
                  name="marginRate"
                  type="number"
                  step="0.01"
                  min="0"
                  value={(draft.marginRate * 100).toFixed(2)}
                  onChange={(event) => setDraft({ ...draft, marginRate: Number(event.target.value) / 100 })}
                  required
                />
              </Field>
              <Field label="Comisión global (%)">
                <Input
                  name="commissionRate"
                  type="number"
                  step="0.01"
                  min="0"
                  value={(draft.commissionRate * 100).toFixed(2)}
                  onChange={(event) => setDraft({ ...draft, commissionRate: Number(event.target.value) / 100 })}
                />
              </Field>
              <Field label="Regla de redondeo">
                <Select
                  name="roundingRule"
                  value={draft.roundingRule}
                  onChange={(event) => setDraft({ ...draft, roundingRule: event.target.value as RoundingRule })}
                >
                  {ROUNDING_RULES.map((rule) => (
                    <option key={rule} value={rule}>
                      {ROUNDING_RULE_LABELS[rule]}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Costo de ejemplo" className="sm:col-span-2" hint="Solo para la vista previa, no se guarda.">
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={sampleCost}
                  onChange={(event) => setSampleCost(Number(event.target.value))}
                />
              </Field>

              {state ? (
                <p className={state.ok ? "text-sm text-neon-emerald sm:col-span-2" : "text-sm text-rose-300 sm:col-span-2"}>
                  {state.message}
                </p>
              ) : null}

              <div className="sm:col-span-2">
                <Button type="submit" size="lg" loading={pending}>
                  <Save className="size-4" /> Guardar reglas
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Precios calculados por denominación" description="Los valores marcados usan configuración propia del producto." />
          <CardBody className="p-0">
            <DataTable headers={["Producto", "Denominación", "Costo", "IVA", "Margen", "Redondeo", "Precio final"]} className="border-0 bg-transparent">
              {rows.map((row) => (
                <tr key={row.id} className="transition-colors hover:bg-white/[0.03]">
                  <Td className="text-sm">
                    {row.product}
                    {row.overridden ? <span className="ml-2 text-[10px] uppercase tracking-wider text-neon-magenta">custom</span> : null}
                  </Td>
                  <Td className="text-sm">{row.denomination}</Td>
                  <Td>{formatMoney(row.cost, currency)}</Td>
                  <Td className="text-xs text-muted">{formatPercent(row.taxRate)}</Td>
                  <Td className="text-xs text-muted">{formatPercent(row.marginRate)}</Td>
                  <Td className="text-xs text-muted">{ROUNDING_RULE_LABELS[row.roundingRule as RoundingRule]}</Td>
                  <Td className="font-display font-semibold text-neon-cyan">{formatMoney(row.finalPrice, currency)}</Td>
                </tr>
              ))}
            </DataTable>
          </CardBody>
        </Card>
      </div>

      <div className="space-y-5">
        <PricePreview cost={sampleCost} rules={draft} currency={currency} />

        <Card>
          <CardHeader title="Cómo se calcula" />
          <CardBody className="space-y-2 text-sm text-muted">
            <p>1. Costo base del proveedor.</p>
            <p>2. Se suma el IVA configurado.</p>
            <p>3. Se aplica el margen sobre el costo con IVA.</p>
            <p>4. Se agrega la comisión de pasarela.</p>
            <p>5. Se aplica la regla de redondeo elegida.</p>
            <p className="pt-2 text-xs">
              Resultado actual: {formatMoney(preview.rawPrice, currency)} → {formatMoney(preview.finalPrice, currency)}
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export function resolveRowRules(
  global: PricingRules,
  product: { taxRate: number | null; marginRate: number | null; commissionRate: number | null; roundingRule: string | null },
  denomination: { taxRate: number | null; marginRate: number | null; commissionRate: number | null; roundingRule: string | null },
) {
  return resolvePricingRules(global, product, denomination);
}
