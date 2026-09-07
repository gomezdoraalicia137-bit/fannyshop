"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, CreditCard, ShieldCheck, User, Copy, CheckCheck, QrCode } from "lucide-react";
import { Button, LinkButton } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { EmptyState, Skeleton } from "@/components/ui/states";
import { useCart } from "@/components/shop/cart-provider";
import { useToast } from "@/components/ui/toast";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";

const BINANCE_PAY_ID = "902753468";
const BINANCE_USER = "YouKa503";

type Customer = { fullName: string; email: string; phone: string; notes: string };

const steps = [
  { id: 1, label: "Información", icon: User },
  { id: 2, label: "Pago", icon: CreditCard },
  { id: 3, label: "Confirmación", icon: ShieldCheck },
];

export function CheckoutFlow({
  currency,
  methods,
  defaults,
}: {
  currency: string;
  methods: { id: string; label: string }[];
  defaults: { fullName: string; email: string; phone: string };
}) {
  const router = useRouter();
  const toast = useToast();
  const { summary, lines, loading, couponInput, clear } = useCart();

  const [step, setStep] = useState(1);
  const [customer, setCustomer] = useState<Customer>({ ...defaults, notes: "" });
  const [method, setMethod] = useState(methods[0]?.id ?? "");
  const [errors, setErrors] = useState<Partial<Record<keyof Customer, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const copyId = () => {
    navigator.clipboard.writeText(BINANCE_PAY_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isCrypto =
    method.toLowerCase().includes("crypto") ||
    method.toLowerCase().includes("binance") ||
    method.toLowerCase().includes("cripto");

  if (!lines.length) {
    return (
      <EmptyState
        title="No hay productos para pagar"
        description="Agrega productos a tu carrito para iniciar el proceso de compra."
        action={<LinkButton href="/tarjetas" size="sm">Ir al catálogo</LinkButton>}
      />
    );
  }

  if (!summary) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  const validate = () => {
    const next: Partial<Record<keyof Customer, string>> = {};
    if (customer.fullName.trim().length < 3) next.fullName = "Ingresa tu nombre completo.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(customer.email.trim())) next.email = "Ingresa un correo válido.";
    if (customer.phone && customer.phone.replace(/\D/g, "").length < 7) next.phone = "Ingresa un teléfono válido.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lines,
          customer,
          paymentMethod: method,
          couponCode: couponInput || null,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        toast.error("Error al procesar la orden.", data.error ?? "Intenta nuevamente.");
        return;
      }
      toast.success("Orden creada correctamente.", `Referencia ${data.reference}`);
      clear();
      router.push(`/checkout/gracias/${data.reference}`);
    } catch {
      toast.error("Error de conexión.", "No pudimos crear tu orden.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <div className="space-y-6">
        <ol className="glass flex items-center justify-between gap-2 rounded-2xl p-4">
          {steps.map((item) => (
            <li key={item.id} className="flex flex-1 items-center gap-2.5">
              <span
                className={cn(
                  "grid size-9 shrink-0 place-items-center rounded-xl border text-xs font-semibold transition-colors",
                  step >= item.id
                    ? "border-neon-violet/60 bg-gradient-to-br from-neon-blue/30 to-neon-violet/30 text-white"
                    : "border-line/70 text-muted",
                )}
              >
                {step > item.id ? <Check className="size-4" /> : <item.icon className="size-4" />}
              </span>
              <span className={cn("hidden text-xs font-medium sm:block", step >= item.id ? "text-white" : "text-muted")}>
                {item.label}
              </span>
            </li>
          ))}
        </ol>

        {step === 1 ? (
          <section className="glass space-y-4 rounded-2xl p-5">
            <h2 className="font-display text-base font-semibold text-white">Información del cliente</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nombre completo" required error={errors.fullName}>
                <Input
                  value={customer.fullName}
                  onChange={(event) => setCustomer({ ...customer, fullName: event.target.value })}
                  placeholder="Juan Pérez"
                  autoComplete="name"
                />
              </Field>
              <Field label="Correo electrónico" required error={errors.email} hint="Ahí enviaremos tus códigos.">
                <Input
                  type="email"
                  value={customer.email}
                  onChange={(event) => setCustomer({ ...customer, email: event.target.value })}
                  placeholder="tucorreo@email.com"
                  autoComplete="email"
                />
              </Field>
              <Field label="Teléfono" error={errors.phone}>
                <Input
                  value={customer.phone}
                  onChange={(event) => setCustomer({ ...customer, phone: event.target.value })}
                  placeholder="+503 7000 0000"
                  autoComplete="tel"
                />
              </Field>
              <Field label="Notas para el equipo">
                <Input
                  value={customer.notes}
                  onChange={(event) => setCustomer({ ...customer, notes: event.target.value })}
                  placeholder="Opcional"
                />
              </Field>
            </div>
            <div className="flex justify-end">
              <Button
                onClick={() => {
                  if (validate()) setStep(2);
                }}
              >
                Continuar al pago
              </Button>
            </div>
          </section>
        ) : null}

        {step === 2 ? (
          <section className="glass space-y-4 rounded-2xl p-5">
            <h2 className="font-display text-base font-semibold text-white">Método de pago</h2>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {methods.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setMethod(item.id)}
                  className={cn(
                    "cursor-pointer rounded-xl border p-4 text-left transition-all",
                    method === item.id
                      ? "border-neon-violet/60 bg-gradient-to-br from-neon-blue/15 to-neon-violet/15 text-white shadow-lg"
                      : "border-line/70 text-muted hover:border-neon-blue/45 hover:text-white",
                  )}
                >
                  <span className="block text-sm font-semibold">{item.label}</span>
                  <span className="mt-0.5 block text-xs text-muted">Validación manual del equipo</span>
                </button>
              ))}
            </div>

            {/* Cuadro de Binance Pay */}
            {isCrypto ? (
              <div className="rounded-2xl border border-yellow-500/40 bg-gradient-to-br from-yellow-500/10 via-slate-900/90 to-black p-5 text-center shadow-lg space-y-3">
                <div className="flex items-center justify-center gap-2 text-yellow-400 font-bold text-sm">
                  <span>Pago con Binance Pay</span>
                </div>
                <p className="text-xs text-slate-300">
                  Envía el pago desde la app de Binance a nuestro <strong>Pay ID</strong> o nombre de usuario:
                </p>

                <div className="flex flex-wrap items-center justify-center gap-3">
                  <div className="inline-flex items-center justify-center gap-2 rounded-xl border border-yellow-500/30 bg-slate-950 px-4 py-2 text-base font-mono font-bold text-yellow-300 shadow-inner">
                    <span>ID: {BINANCE_PAY_ID}</span>
                    <button
                      type="button"
                      onClick={copyId}
                      className="cursor-pointer text-xs flex items-center gap-1 rounded bg-yellow-500/20 px-2 py-1 text-yellow-200 hover:bg-yellow-500/30"
                    >
                      {copied ? <CheckCheck className="size-3.5 text-green-400" /> : <Copy className="size-3.5" />}
                      {copied ? "Copiado" : "Copiar ID"}
                    </button>
                  </div>

                  <span className="text-xs font-semibold px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200">
                    Usuario: <strong className="text-yellow-400">{BINANCE_USER}</strong>
                  </span>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => setShowQR(!showQR)}
                    className="inline-flex items-center gap-1.5 text-xs text-yellow-400/90 hover:text-yellow-300 underline cursor-pointer mt-1"
                  >
                    <QrCode className="size-3.5" />
                    {showQR ? "Ocultar código QR" : "Ver código QR de Binance"}
                  </button>

                  {showQR ? (
                    <div className="mt-3 flex justify-center">
                      <img
                        src="/binance-qr.jpg"
                        alt="Código QR Binance Pay YouKa503"
                        className="w-48 h-auto rounded-xl border-2 border-yellow-500/40 shadow-2xl bg-slate-900 p-1"
                      />
                    </div>
                  ) : null}
                </div>

                <p className="text-[11px] text-slate-400">
                  Al confirmar tu compra, revisaremos la transferencia en Binance para enviarte tus códigos al instante.
                </p>
              </div>
            ) : (
              <p className="rounded-xl border border-line/70 bg-abyss/60 p-4 text-xs leading-relaxed text-muted">
                No almacenamos datos de tarjetas. Al confirmar la orden recibirás las instrucciones para completar el pago y
                tus códigos quedarán reservados.
              </p>
            )}

            <div className="flex justify-between gap-3">
              <Button variant="outline" onClick={() => setStep(1)}>
                Regresar
              </Button>
              <Button onClick={() => setStep(3)} disabled={!method}>
                Revisar orden
              </Button>
            </div>
          </section>
        ) : null}

        {step === 3 ? (
          <section className="glass space-y-4 rounded-2xl p-5">
            <h2 className="font-display text-base font-semibold text-white">Confirma tu orden</h2>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <Detail label="Cliente" value={customer.fullName} />
              <Detail label="Correo" value={customer.email} />
              <Detail label="Teléfono" value={customer.phone || "No proporcionado"} />
              <Detail label="Método de pago" value={methods.find((item) => item.id === method)?.label ?? method} />
            </dl>

            {isCrypto ? (
              <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-3 text-center text-xs text-yellow-200">
                Pagar a Binance Pay ID: <strong className="font-mono font-bold text-yellow-300">{BINANCE_PAY_ID}</strong> ({BINANCE_USER})
              </div>
            ) : null}

            <div className="space-y-2 rounded-xl border border-line/70 bg-abyss/60 p-4">
              {summary.lines.map((line) => (
                <div key={`${line.productId}-${line.denominationId}`} className="flex justify-between gap-3 text-sm">
                  <span className="text-muted">
                    {line.productName} {line.denominationLabel} × {line.quantity}
                  </span>
                  <span className="font-medium text-white">{formatMoney(line.lineTotal, currency)}</span>
                </div>
              ))}
            </div>

            <Field label="Notas adicionales (Ej. TxID o comprobante de Binance)">
              <Textarea
                value={customer.notes}
                onChange={(event) => setCustomer({ ...customer, notes: event.target.value })}
                placeholder={isCrypto ? "Pega aquí tu ID de transacción (TxID) o nombre de usuario en Binance..." : "Comparte cualquier detalle relevante para tu entrega."}
              />
            </Field>

            <div className="flex justify-between gap-3">
              <Button variant="outline" onClick={() => setStep(2)}>
                Regresar
              </Button>
              <Button onClick={submit} loading={submitting} size="lg">
                Confirmar y crear orden
              </Button>
            </div>
          </section>
        ) : null}
      </div>

      <aside className="glass-strong h-fit space-y-4 rounded-2xl p-5 lg:sticky lg:top-24">
        <h2 className="font-display text-base font-semibold text-white">Resumen</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Subtotal</span>
            <span className="text-white">{formatMoney(summary.subtotal, currency)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">IVA incluido</span>
            <span className="text-white">{formatMoney(summary.taxTotal, currency)}</span>
          </div>
          {summary.discount > 0 ? (
            <div className="flex justify-between">
              <span className="text-muted">Descuento</span>
              <span className="text-neon-emerald">- {formatMoney(summary.discount, currency)}</span>
            </div>
          ) : null}
          <div className="flex items-center justify-between border-t border-line/60 pt-3">
            <span className="text-muted">Total</span>
            <span className="font-display text-2xl font-semibold text-white">{formatMoney(summary.total, currency)}</span>
          </div>
        </div>
        {loading ? <p className="text-xs text-muted">Actualizando precios...</p> : null}
      </aside>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line/70 bg-abyss/60 p-3">
      <dt className="text-[10px] uppercase tracking-[0.16em] text-muted">{label}</dt>
      <dd className="mt-0.5 truncate text-sm text-white">{value}</dd>
    </div>
  );
}
