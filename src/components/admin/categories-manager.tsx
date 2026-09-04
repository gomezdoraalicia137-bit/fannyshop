"use client";

import { useActionState, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/field";
import { EmptyState } from "@/components/ui/states";
import { useToast } from "@/components/ui/toast";
import { CategoryIcon } from "@/components/shop/brand-tile";
import { deleteCategoryAction, saveCategoryAction, type ActionState } from "@/lib/actions/admin";
import { ACCENTS } from "@/lib/constants";
import { accentClasses, cn } from "@/lib/utils";

export type AdminCategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string;
  accent: string;
  position: number;
  active: boolean;
  products: number;
};

const iconOptions = [
  "Gamepad2",
  "MonitorPlay",
  "Music4",
  "Smartphone",
  "ShoppingBag",
  "Bitcoin",
  "Sparkles",
  "Trophy",
  "Tv",
  "Wallet",
];

export function CategoriesManager({ categories, canDelete }: { categories: AdminCategoryRow[]; canDelete: boolean }) {
  const toast = useToast();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdminCategoryRow | null>(null);
  const [pending, startTransition] = useTransition();

  const [state, action, saving] = useActionState<ActionState, FormData>(async (prev, formData) => {
    const result = await saveCategoryAction(prev, formData);
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
          <Plus className="size-4" /> Nueva categoría
        </Button>
      </div>

      {categories.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => {
            const styles = accentClasses(category.accent);
            return (
              <div key={category.id} className="glass space-y-4 rounded-2xl p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className={cn("rounded-xl border border-line/70 bg-white/5 p-2.5", styles.text)}>
                    <CategoryIcon name={category.icon} className="size-5" />
                  </div>
                  <Badge tone={category.active ? "emerald" : "slate"}>{category.active ? "Activa" : "Inactiva"}</Badge>
                </div>

                <div className="space-y-1">
                  <h3 className="font-display text-base font-semibold text-white">{category.name}</h3>
                  <p className="text-xs text-muted">
                    /{category.slug} · {category.products} productos · orden {category.position}
                  </p>
                  {category.description ? <p className="line-clamp-2 text-xs text-muted">{category.description}</p> : null}
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="flex-1"
                    onClick={() => {
                      setEditing(category);
                      setOpen(true);
                    }}
                  >
                    <Pencil className="size-4" /> Editar
                  </Button>
                  {canDelete ? (
                    <Button
                      size="icon"
                      variant="danger"
                      aria-label="Eliminar categoría"
                      disabled={pending || category.products > 0}
                      onClick={() =>
                        startTransition(async () => {
                          await deleteCategoryAction(category.id);
                          toast.success("Categoría eliminada.");
                          router.refresh();
                        })
                      }
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState title="Sin categorías" description="Crea la primera categoría del catálogo." />
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Editar categoría" : "Nueva categoría"}>
        <form action={action} className="space-y-4">
          {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nombre" required>
              <Input name="name" defaultValue={editing?.name ?? ""} required />
            </Field>
            <Field label="Slug">
              <Input name="slug" defaultValue={editing?.slug ?? ""} />
            </Field>
            <Field label="Icono">
              <Select name="icon" defaultValue={editing?.icon ?? "Sparkles"}>
                {iconOptions.map((icon) => (
                  <option key={icon} value={icon}>
                    {icon}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Acento">
              <Select name="accent" defaultValue={editing?.accent ?? "blue"}>
                {ACCENTS.map((accent) => (
                  <option key={accent} value={accent}>
                    {accent}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Posición">
              <Input name="position" type="number" min="0" defaultValue={editing?.position ?? 0} />
            </Field>
            <div className="flex items-end">
              <Checkbox name="active" label="Categoría activa" defaultChecked={editing?.active ?? true} />
            </div>
            <Field label="Descripción" className="sm:col-span-2">
              <Textarea name="description" defaultValue={editing?.description ?? ""} />
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
