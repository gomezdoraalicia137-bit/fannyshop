import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Globe2, PackageCheck, ShieldCheck } from "lucide-react";
import { BrandTile } from "@/components/shop/brand-tile";
import { ProductPurchasePanel } from "@/components/shop/product-purchase-panel";
import { ProductCard } from "@/components/shop/product-card";
import { ProductTagBadge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/ui/states";
import { getProductBySlug, getProducts, getProductSlugs } from "@/lib/services/catalog";
import { getSettings } from "@/lib/services/settings";
import { formatMoney } from "@/lib/money";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const slugs = await getProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Producto no encontrado" };

  return {
    title: product.metaTitle ?? product.name,
    description: product.metaDescription ?? product.description.slice(0, 155),
    alternates: { canonical: `/producto/${product.slug}` },
    openGraph: {
      title: product.name,
      description: product.description.slice(0, 155),
      type: "website",
      url: `/producto/${product.slug}`,
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [product, settings] = await Promise.all([getProductBySlug(slug), getSettings()]);
  if (!product || !product.active) notFound();

  const related = (await getProducts())
    .filter((item) => item.category.slug === product.category.slug && item.id !== product.id)
    .slice(0, 4);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    category: product.category.name,
    brand: { "@type": "Brand", name: product.brand ?? product.name },
    offers: product.denominations.map((denomination) => ({
      "@type": "Offer",
      name: `${product.name} ${denomination.label}`,
      price: denomination.price.toFixed(2),
      priceCurrency: settings.currency,
      availability: denomination.available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    })),
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <nav aria-label="Ruta de navegación" className="flex flex-wrap items-center gap-1.5 text-xs text-muted">
        <Link href="/" className="hover:text-white">Inicio</Link>
        <ChevronRight className="size-3.5" />
        <Link href="/tarjetas" className="hover:text-white">Tarjetas</Link>
        <ChevronRight className="size-3.5" />
        <Link href={`/categorias/${product.category.slug}`} className="hover:text-white">
          {product.category.name}
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="text-white/85">{product.name}</span>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_1.05fr]">
        <div className="space-y-6">
          <BrandTile name={product.name} accent={product.accent} icon={product.category.icon} size="lg" />

          <div className="grid gap-3 sm:grid-cols-3">
            <InfoTile icon={<PackageCheck className="size-4" />} label="Entrega" value="Inmediata" />
            <InfoTile icon={<Globe2 className="size-4" />} label="Región" value={product.region} />
            <InfoTile icon={<ShieldCheck className="size-4" />} label="Garantía" value="Código verificado" />
          </div>

          <div className="glass space-y-3 rounded-2xl p-5">
            <h2 className="font-display text-base font-semibold text-white">Descripción</h2>
            <p className="text-sm leading-relaxed text-muted">{product.description}</p>
          </div>

          <div className="glass space-y-3 rounded-2xl p-5">
            <h2 className="font-display text-base font-semibold text-white">Información de entrega</h2>
            <p className="text-sm leading-relaxed text-muted">{product.deliveryInfo}</p>
          </div>

          <div className="glass space-y-3 rounded-2xl p-5">
            <h2 className="font-display text-base font-semibold text-white">Términos de uso</h2>
            <p className="text-sm leading-relaxed text-muted">{product.terms}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-line/70 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
                {product.category.name}
              </span>
              {product.tag ? <ProductTagBadge tag={product.tag} /> : null}
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">{product.name}</h1>
            <p className="text-sm text-muted">
              Desde <span className="font-semibold text-white">{formatMoney(product.fromPrice, settings.currency)}</span> ·{" "}
              {product.inStock ? `${product.stock} códigos en inventario` : "Sin inventario"}
            </p>
          </div>

          <ProductPurchasePanel product={product} currency={settings.currency} />
        </div>
      </div>

      {related.length ? (
        <section className="mt-20 space-y-8">
          <SectionHeading eyebrow="También te puede interesar" title="Productos relacionados" />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} currency={settings.currency} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function InfoTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="glass flex items-center gap-3 rounded-xl p-4">
      <span className="text-neon-cyan">{icon}</span>
      <div>
        <p className="text-[10px] uppercase tracking-[0.16em] text-muted">{label}</p>
        <p className="text-sm font-medium text-white">{value}</p>
      </div>
    </div>
  );
}
