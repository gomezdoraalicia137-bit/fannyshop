"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";

export function ForgotPasswordForm() {
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/auth/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      setSent(true);
      setToken(data.token ?? null);
      toast.success("Solicitud enviada.", "Si el correo existe recibirás instrucciones.");
    } catch {
      toast.error("No pudimos procesar tu solicitud.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="glass-strong space-y-5 rounded-2xl p-7">
      <div className="space-y-1.5">
        <h1 className="font-display text-2xl font-semibold text-white">Recuperar contraseña</h1>
        <p className="text-sm text-muted">Te enviaremos un enlace para restablecer tu contraseña.</p>
      </div>

      <Field label="Correo electrónico" required>
        <Input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="tucorreo@email.com"
          required
        />
      </Field>

      <Button type="submit" size="lg" className="w-full" loading={loading}>
        Enviar instrucciones
      </Button>

      {sent && token ? (
        <div className="rounded-xl border border-neon-cyan/35 bg-neon-cyan/8 p-4 text-xs text-neon-cyan">
          El envío de correos aún no está configurado. Usa este enlace para continuar:
          <Link href={`/restablecer?token=${token}`} className="mt-2 block break-all font-semibold underline">
            /restablecer?token={token}
          </Link>
        </div>
      ) : null}

      <Link href="/login" className="block text-center text-xs text-muted hover:text-white">
        Volver a iniciar sesión
      </Link>
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const toast = useToast();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setError(data.error ?? "No se pudo restablecer la contraseña.");
        return;
      }
      setDone(true);
      toast.success("Contraseña actualizada.", "Ya puedes iniciar sesión.");
    } catch {
      setError("Error de conexión.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="glass-strong space-y-4 rounded-2xl p-7 text-center">
        <h1 className="font-display text-2xl font-semibold text-white">Contraseña actualizada</h1>
        <p className="text-sm text-muted">Ya puedes iniciar sesión con tu nueva contraseña.</p>
        <Link href="/login" className="inline-block text-sm font-semibold text-neon-cyan hover:underline">
          Ir a iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="glass-strong space-y-5 rounded-2xl p-7">
      <div className="space-y-1.5">
        <h1 className="font-display text-2xl font-semibold text-white">Nueva contraseña</h1>
        <p className="text-sm text-muted">Define una contraseña segura de al menos 8 caracteres.</p>
      </div>

      <Field label="Nueva contraseña" required error={error}>
        <Input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="••••••••"
          autoComplete="new-password"
          required
        />
      </Field>

      <Button type="submit" size="lg" className="w-full" loading={loading}>
        Guardar contraseña
      </Button>
    </form>
  );
}
