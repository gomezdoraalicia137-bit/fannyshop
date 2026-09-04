import type { Metadata } from "next";
import { Clock, Mail, Phone } from "lucide-react";
import { ContactForm } from "@/components/shop/contact-form";
import { SectionHeading } from "@/components/ui/states";
import { getSettings } from "@/lib/services/settings";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Escríbenos y resolveremos tus dudas sobre productos digitales.",
};

export default async function ContactPage() {
  const settings = await getSettings();

  return (
    <div className="mx-auto w-full max-w-6xl space-y-10 px-4 py-14 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Contacto"
        title="Hablemos"
        description="Nuestro equipo responde dudas sobre productos, entregas, pagos y facturación."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-3">
          <InfoCard icon={<Mail className="size-5" />} title="Correo" value={settings.supportEmail} />
          <InfoCard icon={<Phone className="size-5" />} title="Teléfono" value={settings.supportPhone} />
          <InfoCard icon={<Clock className="size-5" />} title="Horario" value="Lunes a domingo, 8:00 - 22:00" />
        </div>
        <ContactForm />
      </div>
    </div>
  );
}

function InfoCard({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) {
  return (
    <div className="glass flex items-center gap-4 rounded-2xl p-5">
      <span className="rounded-xl border border-line/70 bg-gradient-to-b from-neon-violet/20 to-transparent p-3 text-neon-violet">
        {icon}
      </span>
      <div>
        <p className="text-[11px] uppercase tracking-[0.16em] text-muted">{title}</p>
        <p className="text-sm font-medium text-white">{value}</p>
      </div>
    </div>
  );
}
