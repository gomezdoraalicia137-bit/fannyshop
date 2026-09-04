import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/admin/primitives";
import { ProductForm, type DenominationRow, type ProductFormValues } from "@/components/admin/product-form";
import { prisma } from "@/lib/prisma";
import { getGlobalPricingRules, getSettings } from "@/lib/services/settings";
import { priceDenomination } from "@/lib/pricing";

export const dynamic = "force-dynamic";

const emptyProduct: ProductFormValues = {
  name: "",
  slug: "",
  brand: "",
  categoryId: "",
  description: "",
  terms: "",
  region: "Global",
  accent: "blue",
  tag: "",
  deliveryInfo: "Entrega digital inmediata en tu cuenta y por correo.",
  active: true,
  featured: false,
  taxRate: null,
  marginRate: null,
  commissionRate: null,
  roundingRule: null,
  metaTitle: "",
  metaDescription: "",
};

export default async function AdminProductEditor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isNew = id === "nuevo";

  const [categories, rules, settings] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    getGlobalPricingRules(),
    getSettings(),
  ]);

  let values = emptyProduct;
  let denominations: DenominationRow[] = [];

  if (!isNew) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        denominations: {
          orderBy: [{ position: "asc" }, { faceValue: "asc" }],
          include: { _count: { select: { codes: { where: { status: "AVAILABLE" } } } } },
        },
      },
    });

    if (!product) notFound();

    values = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      brand: product.brand ?? "",
      categoryId: product.categoryId,
      description: product.description,
      terms: product.terms,
      region: product.region,
      accent: product.accent,
      tag: product.tag ?? "",
      deliveryInfo: product.deliveryInfo,
      active: product.active,
      featured: product.featured,
      taxRate: product.taxRate,
      marginRate: product.marginRate,
      commissionRate: product.commissionRate,
      roundingRule: product.roundingRule,
      metaTitle: product.metaTitle ?? "",
      metaDescription: product.metaDescription ?? "",
    };

    denominations = product.denominations.map((denomination) => ({
      id: denomination.id,
      label: denomination.label,
      faceValue: denomination.faceValue,
      cost: denomination.cost,
      active: denomination.active,
      stock: denomination._count.codes,
      price: priceDenomination(denomination, product, rules).finalPrice,
      taxRate: denomination.taxRate,
      marginRate: denomination.marginRate,
      commissionRate: denomination.commissionRate,
      roundingRule: denomination.roundingRule,
    }));
  }

  return (
    <>
      <Link href="/admin/productos" className="mb-4 inline-flex items-center gap-2 text-sm text-muted hover:text-white">
        <ArrowLeft className="size-4" /> Volver a productos
      </Link>
      <PageHeader
        title={isNew ? "Nuevo producto" : values.name}
        description={isNew ? "Crea un producto digital y sus denominaciones." : "Edita la información, precios y denominaciones."}
      />
      <ProductForm
        product={values}
        categories={categories.map((category) => ({ id: category.id, name: category.name }))}
        denominations={denominations}
        globalRules={rules}
        currency={settings.currency}
      />
    </>
  );
}
