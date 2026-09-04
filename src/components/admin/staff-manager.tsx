"use client";

import { useActionState, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, ShieldOff } from "lucide-react";
import { DataTable, Td } from "@/components/admin/primitives";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Field, Input, Select } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { saveStaffAction, toggleUserStatusAction, type ActionState } from "@/lib/actions/admin";
import { formatDate } from "@/lib/utils";

export type StaffRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
};

export function StaffManager({ staff, locale, currentUserId }: { staff: StaffRow[]; locale: string; currentUserId: string }) {
  const toast = useToast();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<StaffRow | null>(null);
  const [pending, startTransition] = useTransition();

  const [state, action, saving] = useActionState<ActionState, FormData>(async (prev, formData) => {
    const result = await saveStaffAction(prev, formData);
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
          <Plus className="size-4" /> Nuevo usuario
        </Button>
      </div>

      <DataTable headers={["Nombre", "Correo", "Rol", "Estado", "Alta", "Acciones"]}>
        {staff.map((member) => (
          <tr key={member.id} className="transition-colors hover:bg-white/[0.03]">
            <Td className="font-medium">{member.name}</Td>
            <Td className="text-sm text-muted">{member.email}</Td>
            <Td>
              <Badge tone={member.role === "ADMIN" ? "violet" : "blue"}>
                {member.role === "ADMIN" ? "Administrador" : "Empleado"}
              </Badge>
            </Td>
            <Td>
              <Badge tone={member.status === "ACTIVE" ? "emerald" : "rose"}>
                {member.status === "ACTIVE" ? "Activo" : "Bloqueado"}
              </Badge>
            </Td>
            <Td className="text-xs text-muted">{formatDate(member.createdAt, locale)}</Td>
            <Td>
              <div className="flex gap-1.5">
                <Button
                  size="icon"
                  variant="secondary"
                  aria-label="Editar usuario"
                  onClick={() => {
                    setEditing(member);
                    setOpen(true);
                  }}
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  aria-label="Cambiar estado"
                  disabled={pending || member.id === currentUserId}
                  onClick={() =>
                    startTransition(async () => {
                      await toggleUserStatusAction(member.id, member.status === "ACTIVE" ? "BLOCKED" : "ACTIVE");
                      toast.success("Estado actualizado.");
                      router.refresh();
                    })
                  }
                >
                  <ShieldOff className="size-4" />
                </Button>
              </div>
            </Td>
          </tr>
        ))}
      </DataTable>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Editar usuario" : "Nuevo usuario"} size="sm">
        <form action={action} className="space-y-4">
          {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
          <Field label="Nombre" required>
            <Input name="name" defaultValue={editing?.name ?? ""} required />
          </Field>
          <Field label="Correo" required>
            <Input name="email" type="email" defaultValue={editing?.email ?? ""} required />
          </Field>
          <Field label="Rol" required>
            <Select name="role" defaultValue={editing?.role ?? "STAFF"}>
              <option value="STAFF">Empleado</option>
              <option value="ADMIN">Administrador</option>
            </Select>
          </Field>
          <Field
            label="Contraseña"
            hint={editing ? "Déjala vacía para conservar la actual." : "Mínimo 8 caracteres."}
            error={state && !state.ok ? state.message : null}
          >
            <Input name="password" type="password" autoComplete="new-password" />
          </Field>

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
