"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";

type Mode = "login" | "register";

export function AuthForm({ mode, redirectTo }: { mode: Mode; redirectTo?: string }) {
  const router = useRouter();
  const toast = useToast();
  const [values, setValues] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const payload = mode === "login" ? { email: values.email, password: values.password } : values;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok || !data.ok) {
        setError(data.error ?? "No pudimos completar la operación.");
        return;
      }

      toast.success(mode === "login" ? "Sesión iniciada." : "Cuenta creada correctamente.");
      const target = redirectTo ?? (data.role === "ADMIN" || data.role === "STAFF" ? "/admin" : "/cuenta");
      router.push(target);
      router.refresh();
    } catch {
      setError("Error de conexión. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="glass-strong space-y-5 rounded-2xl p-7">
      <div className="space-y-1.5">
        <h1 className="font-display text-2xl font-semibold text-white">
          {mode === "login" ? "Inicia sesión" : "Crea tu cuenta"}
        </h1>
        <p className="text-sm text-muted">
          {mode === "login"
            ? "Accede para ver tus órdenes y códigos entregados."
            : "Compra más rápido y consulta tus códigos cuando quieras."}
        </p>
      </div>

      {mode === "register" ? (
        <Field label="Nombre completo" required>
          <Input
            value={values.name}
            onChange={(event) => setValues({ ...values, name: event.target.value })}
            placeholder="Juan Pérez"
            autoComplete="name"
            required
          />
        </Field>
      ) : null}

      <Field label="Correo electrónico" required>
        <Input
          type="email"
          value={values.email}
          onChange={(event) => setValues({ ...values, email: event.target.value })}
          placeholder="tucorreo@email.com"
          autoComplete="email"
          required
        />
      </Field>

      <Field label="Contraseña" required error={error}>
        <Input
          type="password"
          value={values.password}
          onChange={(event) => setValues({ ...values, password: event.target.value })}
          placeholder="••••••••"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          required
        />
      </Field>

      <Button type="submit" size="lg" className="w-full" loading={loading}>
        {mode === "login" ? "Entrar" : "Crear cuenta"}
      </Button>

      <div className="flex items-center justify-between text-xs text-muted">
        {mode === "login" ? (
          <>
            <Link href="/recuperar" className="hover:text-white">
              Olvidé mi contraseña
            </Link>
            <Link href="/registro" className="hover:text-white">
              Crear cuenta
            </Link>
          </>
        ) : (
          <Link href="/login" className="hover:text-white">
            Ya tengo una cuenta
          </Link>
        )}
      </div>
    </form>
  );
}
