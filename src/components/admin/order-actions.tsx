"use client";

import { useActionState, useState, useTransition } from "react";
import { CheckCircle2, KeyRound, PackageCheck, RotateCcw, Truck, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Field, Select } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { assignCodeAction, orderStatusAction, type ActionState } from "@/lib/actions/admin";
import type { OrderStatus } from "@/lib/constants";

export function OrderActions({ orderId, status }: { orderId: string; status: string }) {
  const toast = useToast();
  const [pending, startTransition] = useTransition();

  const run = (next: OrderStatus, message: string) => {
    startTransition(async () => {
      try {
        await orderStatusAction(orderId, next);
        toast.success(message);
      } catch {
        toast.error("No se pudo actualizar la orden.", "Verifica el inventario disponible.");
      }
    });
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button size="sm" variant="secondary" disabled={pending} onClick={() => run("PROCESSING", "Orden en proceso.")}>
        <RotateCcw className="size-4" /> Procesar
      </Button>
      <Button size="sm" disabled={pending || status === "PAID"} onClick={() => run("PAID", "Pago aprobado.")}>
        <CheckCircle2 className="size-4" /> Marcar pagada
      </Button>
      <Button size="sm" variant="success" disabled={pending} onClick={() => run("DELIVERED", "Código entregado.")}>
        <Truck className="size-4" /> Entregar
      </Button>
      <Button size="sm" variant="secondary" disabled={pending} onClick={() => run("COMPLETED", "Orden completada.")}>
        <PackageCheck className="size-4" /> Completar
      </Button>
      <Button size="sm" variant="outline" disabled={pending} onClick={() => run("CANCELLED", "Orden cancelada.")}>
        <XCircle className="size-4" /> Cancelar
      </Button>
      <Button size="sm" variant="danger" disabled={pending} onClick={() => run("REFUNDED", "Orden reembolsada.")}>
        Reembolsar
      </Button>
    </div>
  );
}

export function AssignCodeButton({
  orderItemId,
  codes,
}: {
  orderItemId: string;
  codes: { id: string; masked: string; batch: string | null }[];
}) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<ActionState, FormData>(async (prev, formData) => {
    const result = await assignCodeAction(prev, formData);
    if (result?.ok) {
      toast.success(result.message);
      setOpen(false);
    } else if (result) {
      toast.error(result.message);
    }
    return result;
  }, null);

  return (
    <>
      <Button size="sm" variant="secondary" onClick={() => setOpen(true)} disabled={!codes.length}>
        <KeyRound className="size-4" /> Asignar código
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title="Asignar código" description="Selecciona un código disponible del inventario." size="sm">
        <form action={action} className="space-y-4">
          <input type="hidden" name="orderItemId" value={orderItemId} />
          <Field label="Código disponible" required error={state && !state.ok ? state.message : null}>
            <Select name="codeId" required>
              {codes.map((code) => (
                <option key={code.id} value={code.id}>
                  {code.masked} {code.batch ? `· ${code.batch}` : ""}
                </option>
              ))}
            </Select>
          </Field>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={pending}>
              Asignar
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
