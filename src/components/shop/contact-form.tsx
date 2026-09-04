"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";

export function ContactForm() {
  const toast = useToast();
  const [values, setValues] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setError(data.error ?? "No pudimos enviar tu mensaje.");
        return;
      }
      toast.success("Mensaje enviado.", "Te responderemos muy pronto.");
      setValues({ name: "", email: "", subject: "", message: "" });
    } catch {
      setError("Error de conexión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="glass-strong space-y-4 rounded-2xl p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nombre" required>
          <Input value={values.name} onChange={(event) => setValues({ ...values, name: event.target.value })} required />
        </Field>
        <Field label="Correo" required>
          <Input
            type="email"
            value={values.email}
            onChange={(event) => setValues({ ...values, email: event.target.value })}
            required
          />
        </Field>
      </div>
      <Field label="Asunto" required>
        <Input value={values.subject} onChange={(event) => setValues({ ...values, subject: event.target.value })} required />
      </Field>
      <Field label="Mensaje" required error={error}>
        <Textarea
          value={values.message}
          onChange={(event) => setValues({ ...values, message: event.target.value })}
          required
        />
      </Field>
      <Button type="submit" size="lg" className="w-full" loading={loading}>
        <Send className="size-4" /> Enviar mensaje
      </Button>
    </form>
  );
}
