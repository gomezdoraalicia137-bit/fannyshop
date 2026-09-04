import type { Metadata } from "next";
import { CategoryGrid } from "@/components/shop/category-grid";
import { SectionHeading } from "@/components/ui/states";
import { getCategories } from "@/lib/services/catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Categorías",
  description: "Explora las categorías de productos digitales disponibles en FannyShop.",
};

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="mx-auto w-full max-w-7xl space-y-10 px-4 py-14 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Categorías"
        title="Explora todo el universo digital"
        description="Gaming, streaming, música, apps, compras y criptomonedas en un mismo lugar."
      />
      <CategoryGrid categories={categories} />
    </div>
  );
}
