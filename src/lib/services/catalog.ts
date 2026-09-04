import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getGlobalPricingRules } from "@/lib/services/settings";
import { priceDenomination } from "@/lib/pricing";
import type { CategoryView, DenominationView, ProductView } from "@/types/catalog";

const productInclude = {
  category: true,
  denominations: {
    where: { active: true },
    orderBy: [{ position: "asc" }, { faceValue: "asc" }],
    include: {
      _count: { select: { codes: { where: { status: "AVAILABLE" } } } },
    },
  },
} satisfies Prisma.ProductInclude;

type ProductRecord = Prisma.ProductGetPayload<{ include: typeof productInclude }>;

export async function getProducts(options: { includeInactive?: boolean } = {}): Promise<ProductView[]> {
  const rules = await getGlobalPricingRules();
  const products = await prisma.product.findMany({
    where: options.includeInactive ? {} : { active: true },
    include: productInclude,
    orderBy: [{ featured: "desc" }, { salesCount: "desc" }, { name: "asc" }],
  });
  return products.map((product) => mapProduct(product, rules));
}

export async function getProductBySlug(slug: string): Promise<ProductView | null> {
  const rules = await getGlobalPricingRules();
  const product = await prisma.product.findUnique({ where: { slug }, include: productInclude });
  if (!product) return null;
  return mapProduct(product, rules);
}

export async function getCategories(options: { includeInactive?: boolean } = {}): Promise<CategoryView[]> {
  const categories = await prisma.category.findMany({
    where: options.includeInactive ? {} : { active: true },
    orderBy: [{ position: "asc" }, { name: "asc" }],
    include: { _count: { select: { products: { where: { active: true } } } } },
  });

  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    icon: category.icon,
    accent: category.accent,
    productCount: category._count.products,
  }));
}

export async function getProductSlugs(): Promise<string[]> {
  const rows = await prisma.product.findMany({ where: { active: true }, select: { slug: true } });
  return rows.map((row) => row.slug);
}

function mapProduct(
  product: ProductRecord,
  rules: Awaited<ReturnType<typeof getGlobalPricingRules>>,
): ProductView {
  const denominations: DenominationView[] = product.denominations.map((denomination) => {
    const breakdown = priceDenomination(denomination, product, rules);
    const stock = denomination._count.codes;
    return {
      id: denomination.id,
      label: denomination.label,
      faceValue: denomination.faceValue,
      price: breakdown.finalPrice,
      breakdown,
      stock,
      available: stock > 0,
    };
  });

  const stock = denominations.reduce((total, item) => total + item.stock, 0);
  const prices = denominations.map((item) => item.price);

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    brand: product.brand,
    description: product.description,
    terms: product.terms,
    region: product.region,
    image: product.image,
    logo: product.logo,
    accent: product.accent,
    tag: product.tag,
    featured: product.featured,
    active: product.active,
    deliveryInfo: product.deliveryInfo,
    salesCount: product.salesCount,
    createdAt: product.createdAt.toISOString(),
    metaTitle: product.metaTitle,
    metaDescription: product.metaDescription,
    category: {
      id: product.category.id,
      name: product.category.name,
      slug: product.category.slug,
      icon: product.category.icon,
      accent: product.category.accent,
    },
    denominations,
    fromPrice: prices.length ? Math.min(...prices) : 0,
    stock,
    inStock: stock > 0,
  };
}
