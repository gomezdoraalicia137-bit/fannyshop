import { PageHeader } from "@/components/admin/primitives";
import { CategoriesManager } from "@/components/admin/categories-manager";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const [categories, user] = await Promise.all([
    prisma.category.findMany({
      orderBy: [{ position: "asc" }, { name: "asc" }],
      include: { _count: { select: { products: true } } },
    }),
    getCurrentUser(),
  ]);

  const rows = categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    icon: category.icon,
    accent: category.accent,
    position: category.position,
    active: category.active,
    products: category._count.products,
  }));

  return (
    <>
      <PageHeader title="Categorías" description="Organiza el catálogo y define el orden de aparición." />
      <CategoriesManager categories={rows} canDelete={user?.role === "ADMIN"} />
    </>
  );
}
