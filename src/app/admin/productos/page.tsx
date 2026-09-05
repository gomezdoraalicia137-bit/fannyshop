import { PageHeader } from "@/components/admin/primitives";
import { ProductsTable } from "@/components/admin/products-table";
import { getCategories, getProducts } from "@/lib/services/catalog";
import { getSettings } from "@/lib/services/settings";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const [products, categories, settings, user] = await Promise.all([
    getProducts({ includeInactive: true }),
    getCategories({ includeInactive: true }),
    getSettings(),
    getCurrentUser(),
  ]);

  const rows = products.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    category: product.category.name,
    categorySlug: product.category.slug,
    denominations: product.denominations.length,
    stock: product.stock,
    fromPrice: product.fromPrice,
    active: product.active,
    featured: product.featured,
    tag: product.tag,
    logo: product.logo,
    accent: product.accent,
    sales: product.salesCount,
  }));

  return (
    <>
      <PageHeader title="Productos" description={`${products.length} productos en el catálogo`} />
      <ProductsTable
        products={rows}
        categories={categories.map((category) => ({ slug: category.slug, name: category.name }))}
        currency={settings.currency}
        canDelete={user?.role === "ADMIN"}
      />
    </>
  );
}
