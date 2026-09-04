import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/states";

export const metadata: Metadata = {
  title: "Preguntas frecuentes",
  description: "Resolvemos las dudas más comunes sobre compras de tarjetas y códigos digitales.",
};

const faqs = [
  {
    question: "¿Cuánto tarda la entrega de mi código?",
    answer:
      "Las órdenes con pago aprobado se entregan de forma inmediata. Si tu método de pago requiere validación manual, nuestro equipo la procesa en minutos durante el horario de atención.",
  },
  {
    question: "¿Dónde veo mis códigos comprados?",
    answer:
      "Ingresa a tu cuenta y abre el detalle de la orden. Los códigos aparecen ocultos por seguridad y puedes mostrarlos o copiarlos cuando lo necesites.",
  },
  {
    question: "¿Los precios incluyen impuestos?",
    answer:
      "Sí. Todos los precios mostrados son finales e incluyen IVA, comisiones y las reglas de redondeo configuradas por la tienda.",
  },
  {
    question: "¿Puedo pedir un reembolso?",
    answer:
      "Aceptamos reembolsos cuando el código aún no ha sido entregado o si presenta un defecto verificable dentro de las 48 horas posteriores a la compra.",
  },
  {
    question: "¿Qué métodos de pago aceptan?",
    answer:
      "Aceptamos transferencia bancaria, tarjeta de crédito o débito, PayPal y criptomonedas, según la configuración activa de la tienda.",
  },
  {
    question: "¿Las tarjetas funcionan en mi región?",
    answer:
      "Cada producto indica su región válida. Verifica ese dato antes de comprar, ya que los códigos solo se canjean en cuentas de la región indicada.",
  },
];

export default function FaqPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-10 px-4 py-14 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <SectionHeading
        eyebrow="Soporte"
        title="Preguntas frecuentes"
        description="Todo lo que necesitas saber antes y después de tu compra."
      />
      <div className="space-y-3">
        {faqs.map((faq) => (
          <details key={faq.question} className="glass group rounded-2xl p-5 transition-colors hover:border-neon-blue/35">
            <summary className="cursor-pointer list-none font-display text-sm font-semibold text-white marker:hidden">
              {faq.question}
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-muted">{faq.answer}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
