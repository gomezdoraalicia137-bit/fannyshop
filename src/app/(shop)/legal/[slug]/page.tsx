import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SectionHeading } from "@/components/ui/states";
import { getSettings } from "@/lib/services/settings";

const pages = {
  terminos: { title: "Términos y condiciones", key: "termsContent" as const },
  privacidad: { title: "Política de privacidad", key: "privacyContent" as const },
  reembolsos: { title: "Política de reembolso", key: "refundContent" as const },
};

export async function generateStaticParams() {
  return Object.keys(pages).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = pages[slug as keyof typeof pages];
  return { title: page?.title ?? "Información legal" };
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = pages[slug as keyof typeof pages];
  if (!page) notFound();

  const settings = await getSettings();
  const content = settings[page.key];

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8 px-4 py-14 sm:px-6 lg:px-8">
      <SectionHeading eyebrow="Legal" title={page.title} />
      <div className="glass space-y-4 rounded-2xl p-6">
        {content.split("\n").filter(Boolean).map((paragraph, index) => (
          <p key={index} className="text-sm leading-relaxed text-muted">
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );
}
