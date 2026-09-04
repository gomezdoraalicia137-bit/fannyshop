import type { Metadata } from "next";
import { CatalogBrowser } from "@/components/shop/catalog-browser";
import { SectionHeading } from "@/components/ui/states";
import { getCategories, getProducts } from "@/lib/services/catalog";
import { getSettings } from "@/lib/services/settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tarjetas digitales",
  description: "Catálogo completo de tarjetas regalo y códigos digitales con entrega inmediata.",
};

export default async function CardsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; categoria?: string }>;
}) {
  const params = await searchParams;
  const [products, categories, settings] = await Promise.all([getProducts(), getCategories(), getSettings()]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-10 px-4 py-14 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Catálogo"
        title="Tarjetas y códigos digitales"
        description="Todo nuestro inventario disponible, con precios finales calculados automáticamente e impuestos incluidos."
      />
      <CatalogBrowser
        products={products}
        categories={categories}
        currency={settings.currency}
        initialQuery={params.q ?? ""}
        initialCategory={params.categoria ?? "all"}
      />
    </div>
  );
}
