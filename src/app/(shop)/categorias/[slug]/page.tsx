import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogBrowser } from "@/components/shop/catalog-browser";
import { SectionHeading } from "@/components/ui/states";
import { getCategories, getProducts } from "@/lib/services/catalog";
import { getSettings } from "@/lib/services/settings";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const categories = await getCategories();
  const category = categories.find((item) => item.slug === slug);
  if (!category) return { title: "Categoría" };
  return {
    title: category.name,
    description: category.description ?? `Productos digitales de la categoría ${category.name}.`,
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [categories, products, settings] = await Promise.all([getCategories(), getProducts(), getSettings()]);
  const category = categories.find((item) => item.slug === slug);
  if (!category) notFound();

  const filtered = products.filter((product) => product.category.slug === slug);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-10 px-4 py-14 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow={`${category.productCount} productos`}
        title={category.name}
        description={category.description ?? undefined}
      />
      <CatalogBrowser
        products={filtered}
        categories={categories.filter((item) => item.slug === slug)}
        currency={settings.currency}
        initialCategory={slug}
      />
    </div>
  );
}
