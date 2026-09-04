"use client";

import { useActionState, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { PricePreview } from "@/components/admin/price-preview";
import {
  deleteDenominationAction,
  saveDenominationAction,
  saveProductAction,
  type ActionState,
} from "@/lib/actions/admin";
import { resolvePricingRules, type PricingRules } from "@/lib/pricing";
import { ACCENTS, PRODUCT_TAGS, PRODUCT_TAG_LABELS, ROUNDING_RULES, ROUNDING_RULE_LABELS } from "@/lib/constants";
import { formatMoney } from "@/lib/money";

export type ProductFormValues = {
  id?: string;
  name: string;
  slug: string;
  brand: string;
  categoryId: string;
  description: string;
  terms: string;
  region: string;
  accent: string;
  tag: string;
  deliveryInfo: string;
  active: boolean;
  featured: boolean;
  taxRate: number | null;
  marginRate: number | null;
  commissionRate: number | null;
  roundingRule: string | null;
  metaTitle: string;
  metaDescription: string;
};

export type DenominationRow = {
  id: string;
  label: string;
  faceValue: number;
  cost: number;
  active: boolean;
  stock: number;
  price: number;
  taxRate: number | null;
  marginRate: number | null;
  commissionRate: number | null;
  roundingRule: string | null;
};

export function ProductForm({
  product,
  categories,
  denominations,
  globalRules,
  currency,
}: {
  product: ProductFormValues;
  categories: { id: string; name: string }[];
  denominations: DenominationRow[];
  globalRules: PricingRules;
  currency: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [values, setValues] = useState(product);

  const [state, action, pending] = useActionState<ActionState, FormData>(async (prev, formData) => {
    const result = await saveProductAction(prev, formData);
    if (result?.ok) {
      toast.success(result.message);
      router.push("/admin/productos");
      router.refresh();
    } else if (result) {
      toast.error(result.message);
    }
    return result;
  }, null);

  const productRules = resolvePricingRules(globalRules, {
    taxRate: values.taxRate,
    marginRate: values.marginRate,
    commissionRate: values.commissionRate,
    roundingRule: values.roundingRule,
  });

  const previewCost = denominations[0]?.cost ?? 10;

  return (
    <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
      <form action={action} className="space-y-5">
        {values.id ? <input type="hidden" name="id" value={values.id} /> : null}

        <Card>
          <CardHeader title="Información general" />
          <CardBody className="grid gap-4 sm:grid-cols-2">
            <Field label="Nombre" required>
              <Input name="name" value={values.name} onChange={(event) => setValues({ ...values, name: event.target.value })} required />
            </Field>
            <Field label="Slug (URL)" hint="Se genera automáticamente si lo dejas vacío.">
              <Input name="slug" value={values.slug} onChange={(event) => setValues({ ...values, slug: event.target.value })} />
            </Field>
            <Field label="Marca">
              <Input name="brand" value={values.brand} onChange={(event) => setValues({ ...values, brand: event.target.value })} />
            </Field>
            <Field label="Categoría" required>
              <Select name="categoryId" value={values.categoryId} onChange={(event) => setValues({ ...values, categoryId: event.target.value })} required>
                <option value="">Selecciona una categoría</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Región">
              <Input name="region" value={values.region} onChange={(event) => setValues({ ...values, region: event.target.value })} />
            </Field>
            <Field label="Etiqueta">
              <Select name="tag" value={values.tag} onChange={(event) => setValues({ ...values, tag: event.target.value })}>
                <option value="">Sin etiqueta</option>
                {PRODUCT_TAGS.map((tag) => (
                  <option key={tag} value={tag}>
                    {PRODUCT_TAG_LABELS[tag]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Color de acento">
              <Select name="accent" value={values.accent} onChange={(event) => setValues({ ...values, accent: event.target.value })}>
                {ACCENTS.map((accent) => (
                  <option key={accent} value={accent}>
                    {accent}
                  </option>
                ))}
              </Select>
            </Field>
            <div className="flex items-end gap-6">
              <Checkbox
                name="active"
                label="Activo"
                defaultChecked={values.active}
                onChange={(event) => setValues({ ...values, active: event.target.checked })}
              />
              <Checkbox
                name="featured"
                label="Destacado"
                defaultChecked={values.featured}
                onChange={(event) => setValues({ ...values, featured: event.target.checked })}
              />
            </div>
            <Field label="Descripción" className="sm:col-span-2">
              <Textarea name="description" value={values.description} onChange={(event) => setValues({ ...values, description: event.target.value })} />
            </Field>
            <Field label="Términos de uso" className="sm:col-span-2">
              <Textarea name="terms" value={values.terms} onChange={(event) => setValues({ ...values, terms: event.target.value })} />
            </Field>
            <Field label="Información de entrega" className="sm:col-span-2">
              <Textarea name="deliveryInfo" value={values.deliveryInfo} onChange={(event) => setValues({ ...values, deliveryInfo: event.target.value })} />
            </Field>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Precios del producto" description="Deja vacío para heredar la configuración global." />
          <CardBody className="grid gap-4 sm:grid-cols-2">
            <Field label="IVA (%)">
              <Input
                name="taxRate"
                type="number"
                step="0.01"
                min="0"
                value={values.taxRate === null ? "" : values.taxRate * 100}
                onChange={(event) =>
                  setValues({ ...values, taxRate: event.target.value === "" ? null : Number(event.target.value) / 100 })
                }
                placeholder={`Global: ${(globalRules.taxRate * 100).toFixed(2)}`}
              />
            </Field>
            <Field label="Margen (%)">
              <Input
                name="marginRate"
                type="number"
                step="0.01"
                min="0"
                value={values.marginRate === null ? "" : values.marginRate * 100}
                onChange={(event) =>
                  setValues({ ...values, marginRate: event.target.value === "" ? null : Number(event.target.value) / 100 })
                }
                placeholder={`Global: ${(globalRules.marginRate * 100).toFixed(2)}`}
              />
            </Field>
            <Field label="Comisión (%)">
              <Input
                name="commissionRate"
                type="number"
                step="0.01"
                min="0"
                value={values.commissionRate === null ? "" : values.commissionRate * 100}
                onChange={(event) =>
                  setValues({
                    ...values,
                    commissionRate: event.target.value === "" ? null : Number(event.target.value) / 100,
                  })
                }
                placeholder={`Global: ${(globalRules.commissionRate * 100).toFixed(2)}`}
              />
            </Field>
            <Field label="Regla de redondeo">
              <Select
                name="roundingRule"
                value={values.roundingRule ?? ""}
                onChange={(event) => setValues({ ...values, roundingRule: event.target.value || null })}
              >
                <option value="">Usar configuración global</option>
                {ROUNDING_RULES.map((rule) => (
                  <option key={rule} value={rule}>
                    {ROUNDING_RULE_LABELS[rule]}
                  </option>
                ))}
              </Select>
            </Field>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="SEO" />
          <CardBody className="grid gap-4">
            <Field label="Meta título">
              <Input name="metaTitle" value={values.metaTitle} onChange={(event) => setValues({ ...values, metaTitle: event.target.value })} />
            </Field>
            <Field label="Meta descripción">
              <Textarea name="metaDescription" value={values.metaDescription} onChange={(event) => setValues({ ...values, metaDescription: event.target.value })} />
            </Field>
          </CardBody>
        </Card>

        {state && !state.ok ? (
          <p className="rounded-xl border border-rose-500/35 bg-rose-500/8 px-4 py-3 text-sm text-rose-200">{state.message}</p>
        ) : null}

        <Button type="submit" size="lg" loading={pending}>
          <Save className="size-4" /> Guardar producto
        </Button>
      </form>

      <div className="space-y-5">
        <PricePreview cost={previewCost} rules={productRules} currency={currency} compact />

        {values.id ? (
          <DenominationsManager
            productId={values.id}
            denominations={denominations}
            currency={currency}
            globalRules={productRules}
          />
        ) : (
          <Card>
            <CardHeader title="Denominaciones" description="Guarda el producto para agregar denominaciones." />
          </Card>
        )}
      </div>
    </div>
  );
}

function DenominationsManager({
  productId,
  denominations,
  currency,
  globalRules,
}: {
  productId: string;
  denominations: DenominationRow[];
  currency: string;
  globalRules: PricingRules;
}) {
  const toast = useToast();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<DenominationRow | null>(null);
  const [pendingDelete, startTransition] = useTransition();
  const [cost, setCost] = useState(10);

  const [state, action, pending] = useActionState<ActionState, FormData>(async (prev, formData) => {
    const result = await saveDenominationAction(prev, formData);
    if (result?.ok) {
      toast.success(result.message);
      setOpen(false);
      router.refresh();
    } else if (result) {
      toast.error(result.message);
    }
    return result;
  }, null);

  const openModal = (denomination: DenominationRow | null) => {
    setEditing(denomination);
    setCost(denomination?.cost ?? 10);
    setOpen(true);
  };

  return (
    <Card>
      <CardHeader
        title="Denominaciones"
        description="Cada denominación tiene su propio costo y reglas."
        action={
          <Button size="sm" onClick={() => openModal(null)}>
            <Plus className="size-4" /> Agregar
          </Button>
        }
      />
      <CardBody className="space-y-2.5">
        {denominations.length ? (
          denominations.map((denomination) => (
            <div key={denomination.id} className="flex items-center justify-between gap-3 rounded-xl border border-line/60 bg-abyss/50 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-white">{denomination.label}</p>
                <p className="text-xs text-muted">
                  Costo {formatMoney(denomination.cost, currency)} · Stock {denomination.stock}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-display text-sm font-semibold text-neon-cyan">
                  {formatMoney(denomination.price, currency)}
                </span>
                <Button size="icon" variant="secondary" aria-label="Editar denominación" onClick={() => openModal(denomination)}>
                  <Plus className="size-4 rotate-45" />
                </Button>
                <Button
                  size="icon"
                  variant="danger"
                  aria-label="Eliminar denominación"
                  disabled={pendingDelete}
                  onClick={() =>
                    startTransition(async () => {
                      await deleteDenominationAction(denomination.id);
                      toast.success("Denominación eliminada.");
                      router.refresh();
                    })
                  }
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted">Aún no hay denominaciones.</p>
        )}
      </CardBody>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Editar denominación" : "Nueva denominación"}
        description="El precio final se calcula automáticamente."
      >
        <form action={action} className="space-y-4">
          <input type="hidden" name="productId" value={productId} />
          {editing ? <input type="hidden" name="id" value={editing.id} /> : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Etiqueta" required hint="Ejemplo: $25 o 3 meses">
              <Input name="label" defaultValue={editing?.label ?? ""} required />
            </Field>
            <Field label="Valor nominal" required>
              <Input name="faceValue" type="number" step="0.01" min="0" defaultValue={editing?.faceValue ?? 10} required />
            </Field>
            <Field label="Costo base" required>
              <Input
                name="cost"
                type="number"
                step="0.01"
                min="0"
                value={cost}
                onChange={(event) => setCost(Number(event.target.value))}
                required
              />
            </Field>
            <Field label="IVA (%)">
              <Input name="taxRate" type="number" step="0.01" min="0" defaultValue={editing?.taxRate === null || editing?.taxRate === undefined ? "" : editing.taxRate * 100} />
            </Field>
            <Field label="Margen (%)">
              <Input name="marginRate" type="number" step="0.01" min="0" defaultValue={editing?.marginRate === null || editing?.marginRate === undefined ? "" : editing.marginRate * 100} />
            </Field>
            <Field label="Comisión (%)">
              <Input name="commissionRate" type="number" step="0.01" min="0" defaultValue={editing?.commissionRate === null || editing?.commissionRate === undefined ? "" : editing.commissionRate * 100} />
            </Field>
            <Field label="Redondeo" className="sm:col-span-2">
              <Select name="roundingRule" defaultValue={editing?.roundingRule ?? ""}>
                <option value="">Heredar del producto</option>
                {ROUNDING_RULES.map((rule) => (
                  <option key={rule} value={rule}>
                    {ROUNDING_RULE_LABELS[rule]}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <PricePreview cost={cost} rules={globalRules} currency={currency} compact />

          {state && !state.ok ? <p className="text-sm text-rose-300">{state.message}</p> : null}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={pending}>
              Guardar
            </Button>
          </div>
        </form>
      </Modal>
    </Card>
  );
}
