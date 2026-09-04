import type { Metadata } from "next";
import { Tag } from "lucide-react";
import { CatalogBrowser } from "@/components/shop/catalog-browser";
import { EmptyState, SectionHeading } from "@/components/ui/states";
import { LinkButton } from "@/components/ui/button";
import { getCategories, getProducts } from "@/lib/services/catalog";
import { getSettings } from "@/lib/services/settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ofertas",
  description: "Promociones y descuentos activos en tarjetas digitales.",
};

export default async function OffersPage() {
  const [products, categories, settings] = await Promise.all([getProducts(), getCategories(), getSettings()]);
  const offers = products.filter((product) => product.tag === "OFERTA");

  return (
    <div className="mx-auto w-full max-w-7xl space-y-10 px-4 py-14 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Promociones"
        title="Ofertas activas"
        description="Precios especiales por tiempo limitado en las tarjetas más buscadas."
      />
      {offers.length ? (
        <CatalogBrowser products={offers} categories={categories} currency={settings.currency} onlyOffers />
      ) : (
        <EmptyState
          title="No hay ofertas activas"
          description="Vuelve pronto: publicamos nuevas promociones cada semana."
          icon={<Tag className="size-6" />}
          action={<LinkButton href="/tarjetas" variant="secondary" size="sm">Ver catálogo</LinkButton>}
        />
      )}
    </div>
  );
}
