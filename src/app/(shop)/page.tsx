import { ArrowRight, CreditCard, Headphones, Lock, Rocket } from "lucide-react";
import { Hero } from "@/components/shop/hero";
import { CategoryGrid } from "@/components/shop/category-grid";
import { ProductCard } from "@/components/shop/product-card";
import { CatalogBrowser } from "@/components/shop/catalog-browser";
import { SectionHeading } from "@/components/ui/states";
import { LinkButton } from "@/components/ui/button";
import { getCategories, getProducts } from "@/lib/services/catalog";
import { getSettings } from "@/lib/services/settings";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function countCodes(): Promise<number> {
  try {
    return await prisma.digitalCode.count();
  } catch {
    return 0;
  }
}

export default async function HomePage() {
  const [products, categories, settings, deliveredCodes] = await Promise.all([
    getProducts(),
    getCategories(),
    getSettings(),
    countCodes(),
  ]);

  const featured = products.filter((product) => product.featured).slice(0, 4);
  const fromPrice = products.length ? Math.min(...products.map((product) => product.fromPrice)) : 0;

  return (
    <>
      <Hero
        currency={settings.currency}
        stats={{
          products: products.length,
          categories: categories.length,
          delivered: deliveredCodes,
          fromPrice,
        }}
      />

      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Benefit icon={<Rocket className="size-5" />} title="Entrega inmediata" description="Recibe tu código al confirmar el pago." />
          <Benefit icon={<Lock className="size-5" />} title="Compra protegida" description="Códigos cifrados y nunca expuestos." />
          <Benefit icon={<CreditCard className="size-5" />} title="Pagos flexibles" description="Tarjeta, transferencia, PayPal y cripto." />
          <Benefit icon={<Headphones className="size-5" />} title="Soporte real" description="Atención humana cuando la necesites." />
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl space-y-8 px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Categorías"
          title="Explora por categoría"
          description="Encuentra rápido lo que buscas: gaming, streaming, música, apps, compras y criptomonedas."
          action={
            <LinkButton href="/categorias" variant="secondary" size="sm">
              Ver todas <ArrowRight className="size-4" />
            </LinkButton>
          }
        />
        <CategoryGrid categories={categories} />
      </section>

      {featured.length ? (
        <section className="mx-auto w-full max-w-7xl space-y-8 px-4 pb-20 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Destacados"
            title="Los favoritos de la comunidad"
            description="Las tarjetas más compradas esta semana, listas para entrega inmediata."
          />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} currency={settings.currency} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="mx-auto w-full max-w-7xl space-y-8 px-4 pb-24 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Catálogo"
          title="Todas las tarjetas digitales"
          description="Filtra por categoría, busca por marca y ordena según lo que necesitas."
        />
        <CatalogBrowser products={products} categories={categories} currency={settings.currency} />
      </section>
    </>
  );
}

function Benefit({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="glass flex items-start gap-3.5 rounded-2xl p-5 transition-colors hover:border-neon-blue/35">
      <div className="rounded-xl border border-line/70 bg-gradient-to-b from-neon-blue/20 to-transparent p-2.5 text-neon-cyan">
        {icon}
      </div>
      <div className="space-y-1">
        <h3 className="font-display text-sm font-semibold text-white">{title}</h3>
        <p className="text-xs leading-relaxed text-muted">{description}</p>
      </div>
    </div>
  );
}
