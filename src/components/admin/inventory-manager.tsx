"use client";

import { useActionState, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, Trash2, Upload } from "lucide-react";
import { DataTable, Td } from "@/components/admin/primitives";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, StatCard } from "@/components/ui/card";
import { CodeStatusBadge } from "@/components/ui/badge";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { EmptyState } from "@/components/ui/states";
import { useToast } from "@/components/ui/toast";
import { deleteCodeAction, importCodesAction, type ActionState } from "@/lib/actions/admin";
import { CODE_STATUSES, CODE_STATUS_LABELS, type CodeStatus } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

export type InventoryRow = {
  id: string;
  masked: string;
  product: string;
  denomination: string;
  denominationId: string;
  status: string;
  batch: string | null;
  orderReference: string | null;
  createdAt: string;
};

export function InventoryManager({
  codes,
  denominations,
  stats,
  locale,
}: {
  codes: InventoryRow[];
  denominations: { id: string; label: string }[];
  stats: Record<string, number>;
  locale: string;
}) {
  const toast = useToast();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const [denomination, setDenomination] = useState("ALL");
  const [pending, startTransition] = useTransition();

  const [state, action, saving] = useActionState<ActionState, FormData>(async (prev, formData) => {
    const result = await importCodesAction(prev, formData);
    if (result?.ok) {
      toast.success(result.message);
      formRef.current?.reset();
      router.refresh();
    } else if (result) {
      toast.error(result.message);
    }
    return result;
  }, null);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return codes.filter((code) => {
      const matchesTerm =
        !term ||
        code.product.toLowerCase().includes(term) ||
        code.masked.toLowerCase().includes(term) ||
        (code.batch ?? "").toLowerCase().includes(term) ||
        (code.orderReference ?? "").toLowerCase().includes(term);
      const matchesStatus = status === "ALL" || code.status === status;
      const matchesDenomination = denomination === "ALL" || code.denominationId === denomination;
      return matchesTerm && matchesStatus && matchesDenomination;
    });
  }, [codes, query, status, denomination]);

  const handleFile = async (file: File) => {
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(Boolean);
    const parsed = lines
      .map((line) => line.split(/[,;\t]/))
      .filter((parts) => parts.length && !/^producto$/i.test(parts[0]?.trim() ?? ""))
      .map((parts) => (parts.length >= 3 ? parts[2] : parts[0]))
      .map((code) => code?.trim())
      .filter(Boolean);

    const textarea = formRef.current?.elements.namedItem("codes") as HTMLTextAreaElement | null;
    if (textarea) textarea.value = parsed.join("\n");
    toast.info(`${parsed.length} códigos cargados desde el archivo.`);
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Disponibles" value={stats.AVAILABLE ?? 0} accent="emerald" />
        <StatCard label="Reservados" value={stats.RESERVED ?? 0} accent="magenta" />
        <StatCard label="Vendidos" value={stats.SOLD ?? 0} accent="blue" />
        <StatCard label="Entregados" value={stats.DELIVERED ?? 0} accent="violet" />
      </div>

      <Card>
        <CardHeader title="Importar códigos" description="Pega los códigos o carga un CSV (producto, denominación, código, estado)." />
        <CardBody>
          <form ref={formRef} action={action} className="grid gap-4 lg:grid-cols-2">
            <Field label="Denominación" required>
              <Select name="denominationId" required>
                <option value="">Selecciona una denominación</option>
                {denominations.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Lote" hint="Opcional, para agrupar la importación.">
              <Input name="batch" placeholder="LOTE-2026-01" />
            </Field>
            <Field label="Códigos" required className="lg:col-span-2" hint="Un código por línea.">
              <Textarea name="codes" placeholder={"XXXX-XXXX-XXXX\nYYYY-YYYY-YYYY"} required />
            </Field>

            <div className="flex flex-wrap items-center gap-3 lg:col-span-2">
              <label className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-line/80 px-4 text-sm text-muted transition-colors hover:border-neon-blue/50 hover:text-white">
                <Upload className="size-4" /> Cargar CSV
                <input
                  type="file"
                  accept=".csv,text/csv,text/plain"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void handleFile(file);
                  }}
                />
              </label>
              <Button type="submit" loading={saving}>
                Importar códigos
              </Button>
              {state && !state.ok ? <p className="text-sm text-rose-300">{state.message}</p> : null}
            </div>
          </form>
        </CardBody>
      </Card>

      <div className="glass flex flex-col gap-3 rounded-2xl p-4 lg:flex-row lg:items-center">
        <div className="flex h-11 flex-1 items-center gap-2.5 rounded-xl border border-line/80 bg-abyss/70 px-4">
          <Search className="size-4 text-muted" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por producto, lote u orden"
            aria-label="Buscar códigos"
            className="h-full w-full bg-transparent text-sm text-white placeholder:text-muted/70 focus:outline-none"
          />
        </div>
        <Select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filtrar por estado" className="lg:w-48">
          <option value="ALL">Todos los estados</option>
          {CODE_STATUSES.map((item) => (
            <option key={item} value={item}>
              {CODE_STATUS_LABELS[item as CodeStatus]}
            </option>
          ))}
        </Select>
        <Select
          value={denomination}
          onChange={(event) => setDenomination(event.target.value)}
          aria-label="Filtrar por denominación"
          className="lg:w-64"
        >
          <option value="ALL">Todas las denominaciones</option>
          {denominations.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </Select>
      </div>

      {filtered.length ? (
        <DataTable headers={["Código", "Producto", "Denominación", "Estado", "Lote", "Orden", "Fecha", ""]}>
          {filtered.slice(0, 300).map((code) => (
            <tr key={code.id} className="transition-colors hover:bg-white/[0.03]">
              <Td className="font-mono text-xs text-neon-cyan">{code.masked}</Td>
              <Td className="text-sm">{code.product}</Td>
              <Td className="text-sm">{code.denomination}</Td>
              <Td><CodeStatusBadge status={code.status} /></Td>
              <Td className="text-xs text-muted">{code.batch ?? "-"}</Td>
              <Td className="text-xs text-muted">{code.orderReference ?? "-"}</Td>
              <Td className="text-xs text-muted">{formatDate(code.createdAt, locale)}</Td>
              <Td>
                {code.status === "AVAILABLE" ? (
                  <Button
                    size="icon"
                    variant="danger"
                    aria-label="Eliminar código"
                    disabled={pending}
                    onClick={() =>
                      startTransition(async () => {
                        await deleteCodeAction(code.id);
                        toast.success("Código eliminado.");
                        router.refresh();
                      })
                    }
                  >
                    <Trash2 className="size-4" />
                  </Button>
                ) : null}
              </Td>
            </tr>
          ))}
        </DataTable>
      ) : (
        <EmptyState title="Sin códigos" description="Importa códigos para comenzar a vender." />
      )}
    </div>
  );
}
