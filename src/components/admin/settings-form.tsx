"use client";

import { useActionState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { saveSettingsAction, type ActionState } from "@/lib/actions/admin";
import { PAYMENT_METHODS, ROUNDING_RULES, ROUNDING_RULE_LABELS } from "@/lib/constants";
import type { StoreSettings } from "@/lib/services/settings";

export function SettingsForm({ settings }: { settings: StoreSettings }) {
  const toast = useToast();

  const [state, action, pending] = useActionState<ActionState, FormData>(async (prev, formData) => {
    const result = await saveSettingsAction(prev, formData);
    if (result?.ok) toast.success(result.message);
    else if (result) toast.error(result.message);
    return result;
  }, null);

  return (
    <form action={action} className="grid gap-5 xl:grid-cols-2">
      <Card>
        <CardHeader title="Identidad de la tienda" />
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre de la tienda" required>
            <Input name="storeName" defaultValue={settings.storeName} required />
          </Field>
          <Field label="Eslogan">
            <Input name="tagline" defaultValue={settings.tagline} />
          </Field>
          <Field label="URL del logo">
            <Input name="logoUrl" defaultValue={settings.logoUrl} placeholder="https://" />
          </Field>
          <Field label="URL del favicon">
            <Input name="faviconUrl" defaultValue={settings.faviconUrl} placeholder="https://" />
          </Field>
          <Field label="Correo de soporte" required>
            <Input name="supportEmail" type="email" defaultValue={settings.supportEmail} required />
          </Field>
          <Field label="Teléfono de soporte">
            <Input name="supportPhone" defaultValue={settings.supportPhone} />
          </Field>
          <Field label="Moneda">
            <Input name="currency" defaultValue={settings.currency} maxLength={3} />
          </Field>
          <Field label="Idioma / formato">
            <Input name="locale" defaultValue={settings.locale} />
          </Field>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Precios y pagos" />
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <Field label="IVA global (%)">
            <Input name="taxRate" type="number" step="0.01" min="0" defaultValue={(settings.taxRate * 100).toFixed(2)} />
          </Field>
          <Field label="Margen global (%)">
            <Input name="marginRate" type="number" step="0.01" min="0" defaultValue={(settings.marginRate * 100).toFixed(2)} />
          </Field>
          <Field label="Comisión global (%)">
            <Input name="commissionRate" type="number" step="0.01" min="0" defaultValue={(settings.commissionRate * 100).toFixed(2)} />
          </Field>
          <Field label="Regla de redondeo">
            <Select name="roundingRule" defaultValue={settings.roundingRule}>
              {ROUNDING_RULES.map((rule) => (
                <option key={rule} value={rule}>
                  {ROUNDING_RULE_LABELS[rule]}
                </option>
              ))}
            </Select>
          </Field>

          <div className="space-y-2.5 sm:col-span-2">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">Métodos de pago habilitados</p>
            {PAYMENT_METHODS.map((method) => (
              <Checkbox
                key={method.id}
                name="paymentMethods"
                value={method.id}
                label={method.label}
                defaultChecked={settings.paymentMethods.includes(method.id)}
              />
            ))}
          </div>

          <div className="sm:col-span-2">
            <Checkbox
              name="autoDelivery"
              label="Entregar códigos automáticamente al aprobar el pago"
              defaultChecked={settings.autoDelivery}
            />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Contenido legal" />
        <CardBody className="grid gap-4">
          <Field label="Términos y condiciones">
            <Textarea name="termsContent" defaultValue={settings.termsContent} />
          </Field>
          <Field label="Política de privacidad">
            <Textarea name="privacyContent" defaultValue={settings.privacyContent} />
          </Field>
          <Field label="Política de reembolso">
            <Textarea name="refundContent" defaultValue={settings.refundContent} />
          </Field>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Redes sociales" />
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <Field label="Facebook">
            <Input name="facebook" defaultValue={settings.social.facebook} placeholder="https://" />
          </Field>
          <Field label="Instagram">
            <Input name="instagram" defaultValue={settings.social.instagram} placeholder="https://" />
          </Field>
          <Field label="X / Twitter">
            <Input name="twitter" defaultValue={settings.social.twitter} placeholder="https://" />
          </Field>
          <Field label="Discord">
            <Input name="discord" defaultValue={settings.social.discord} placeholder="https://" />
          </Field>
          <Field label="WhatsApp" className="sm:col-span-2">
            <Input name="whatsapp" defaultValue={settings.social.whatsapp} placeholder="https://" />
          </Field>
        </CardBody>
      </Card>

      <div className="xl:col-span-2">
        {state ? (
          <p className={state.ok ? "mb-3 text-sm text-neon-emerald" : "mb-3 text-sm text-rose-300"}>{state.message}</p>
        ) : null}
        <Button type="submit" size="lg" loading={pending}>
          <Save className="size-4" /> Guardar configuración
        </Button>
      </div>
    </form>
  );
}
