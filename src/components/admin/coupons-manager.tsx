"use client";

import { useActionState, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { DataTable, Td } from "@/components/admin/primitives";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Checkbox, Field, Input, Select } from "@/components/ui/field";
import { EmptyState } from "@/components/ui/states";
import { useToast } from "@/components/ui/toast";
import { deleteCouponAction, saveCouponAction, type ActionState } from "@/lib/actions/admin";
import { formatMoney } from "@/lib/money";
import { formatDate } from "@/lib/utils";

export type CouponRow = {
  id: string;
  code: string;
  type: string;
  value: number;
  startsAt: string | null;
  endsAt: string | null;
  maxUses: number | null;
  usedCount: number;
  minTotal: number | null;
  productIds: string;
  categoryIds: string;
  active: boolean;
};

export function CouponsManager({
  coupons,
  currency,
  locale,
}: {
  coupons: CouponRow[];
  currency: string;
  locale: string;
}) {
  const toast = useToast();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CouponRow | null>(null);
  const [pending, startTransition] = useTransition();

  const [state, action, saving] = useActionState<ActionState, FormData>(async (prev, formData) => {
    const result = await saveCouponAction(prev, formData);
    if (result?.ok) {
      toast.success(result.message);
      setOpen(false);
      router.refresh();
    } else if (result) {
      toast.error(result.message);
    }
    return result;
  }, null);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          <Plus className="size-4" /> Nuevo cupón
        </Button>
      </div>

      {coupons.length ? (
        <DataTable headers={["Código", "Tipo", "Valor", "Vigencia", "Usos", "Mínimo", "Estado", "Acciones"]}>
          {coupons.map((coupon) => (
            <tr key={coupon.id} className="transition-colors hover:bg-white/[0.03]">
              <Td className="font-mono text-sm text-neon-cyan">{coupon.code}</Td>
              <Td className="text-sm">{coupon.type === "PERCENT" ? "Porcentaje" : "Monto fijo"}</Td>
              <Td className="font-semibold">
                {coupon.type === "PERCENT" ? `${coupon.value}%` : formatMoney(coupon.value, currency)}
              </Td>
              <Td className="text-xs text-muted">
                {coupon.startsAt ? formatDate(coupon.startsAt, locale) : "Sin inicio"} —{" "}
                {coupon.endsAt ? formatDate(coupon.endsAt, locale) : "Sin fin"}
              </Td>
              <Td className="text-sm">
                {coupon.usedCount}
                {coupon.maxUses ? ` / ${coupon.maxUses}` : ""}
              </Td>
              <Td className="text-sm">{coupon.minTotal ? formatMoney(coupon.minTotal, currency) : "-"}</Td>
              <Td>
                <Badge tone={coupon.active ? "emerald" : "slate"}>{coupon.active ? "Activo" : "Inactivo"}</Badge>
              </Td>
              <Td>
                <div className="flex gap-1.5">
                  <Button
                    size="icon"
                    variant="secondary"
                    aria-label="Editar cupón"
                    onClick={() => {
                      setEditing(coupon);
                      setOpen(true);
                    }}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="danger"
                    aria-label="Eliminar cupón"
                    disabled={pending}
                    onClick={() =>
                      startTransition(async () => {
                        await deleteCouponAction(coupon.id);
                        toast.success("Cupón eliminado.");
                        router.refresh();
                      })
                    }
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </Td>
            </tr>
          ))}
        </DataTable>
      ) : (
        <EmptyState title="Sin cupones" description="Crea promociones para incentivar las compras." />
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Editar cupón" : "Nuevo cupón"}>
        <form action={action} className="space-y-4">
          {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Código" required>
              <Input name="code" defaultValue={editing?.code ?? ""} required />
            </Field>
            <Field label="Tipo" required>
              <Select name="type" defaultValue={editing?.type ?? "PERCENT"}>
                <option value="PERCENT">Porcentaje</option>
                <option value="FIXED">Monto fijo</option>
              </Select>
            </Field>
            <Field label="Valor" required>
              <Input name="value" type="number" step="0.01" min="0" defaultValue={editing?.value ?? 10} required />
            </Field>
            <Field label="Monto mínimo">
              <Input name="minTotal" type="number" step="0.01" min="0" defaultValue={editing?.minTotal ?? ""} />
            </Field>
            <Field label="Fecha de inicio">
              <Input name="startsAt" type="date" defaultValue={editing?.startsAt?.slice(0, 10) ?? ""} />
            </Field>
            <Field label="Fecha final">
              <Input name="endsAt" type="date" defaultValue={editing?.endsAt?.slice(0, 10) ?? ""} />
            </Field>
            <Field label="Máximo de usos">
              <Input name="maxUses" type="number" min="0" defaultValue={editing?.maxUses ?? ""} />
            </Field>
            <div className="flex items-end">
              <Checkbox name="active" label="Cupón activo" defaultChecked={editing?.active ?? true} />
            </div>
            <Field label="IDs de productos" hint="Separados por coma. Vacío = todos." className="sm:col-span-2">
              <Input name="productIds" defaultValue={editing?.productIds ?? ""} />
            </Field>
            <Field label="IDs de categorías" hint="Separados por coma. Vacío = todas." className="sm:col-span-2">
              <Input name="categoryIds" defaultValue={editing?.categoryIds ?? ""} />
            </Field>
          </div>

          {state && !state.ok ? <p className="text-sm text-rose-300">{state.message}</p> : null}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              Guardar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
