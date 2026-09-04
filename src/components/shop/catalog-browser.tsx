"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { ProductCard } from "@/components/shop/product-card";
import { EmptyState } from "@/components/ui/states";
import { cn } from "@/lib/utils";
import type { CategoryView, ProductView } from "@/types/catalog";

type SortKey = "best" | "price-asc" | "price-desc" | "recent";

const sortOptions: { key: SortKey; label: string }[] = [
  { key: "best", label: "Más vendidos" },
  { key: "price-asc", label: "Precio menor" },
  { key: "price-desc", label: "Precio mayor" },
  { key: "recent", label: "Más recientes" },
];

export function CatalogBrowser({
  products,
  categories,
  currency,
  initialQuery = "",
  initialCategory = "all",
  onlyOffers = false,
}: {
  products: ProductView[];
  categories: CategoryView[];
  currency: string;
  initialQuery?: string;
  initialCategory?: string;
  onlyOffers?: boolean;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState<SortKey>("best");
  const [inStockOnly, setInStockOnly] = useState(false);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    let list = products.filter((product) => {
      const matchesTerm =
        !term ||
        product.name.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term) ||
        product.category.name.toLowerCase().includes(term);
      const matchesCategory =
        category === "all" || (category === "offers" ? product.tag === "OFERTA" : product.category.slug === category);
      const matchesStock = !inStockOnly || product.inStock;
      const matchesOffers = !onlyOffers || product.tag === "OFERTA";
      return matchesTerm && matchesCategory && matchesStock && matchesOffers;
    });

    list = [...list].sort((a, b) => {
      switch (sort) {
        case "price-asc":
          return a.fromPrice - b.fromPrice;
        case "price-desc":
          return b.fromPrice - a.fromPrice;
        case "recent":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return b.salesCount - a.salesCount;
      }
    });

    return list;
  }, [products, query, category, sort, inStockOnly, onlyOffers]);

  const filters = [
    { key: "all", label: "Todos" },
    ...categories.map((item) => ({ key: item.slug, label: item.name })),
    { key: "offers", label: "Ofertas" },
  ];

  return (
    <div className="space-y-8">
      <div className="glass space-y-4 rounded-2xl p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex h-11 flex-1 items-center gap-2.5 rounded-xl border border-line/80 bg-abyss/70 px-4">
            <Search className="size-4 shrink-0 text-muted" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar tarjeta, marca o categoría"
              aria-label="Buscar en el catálogo"
              className="h-full w-full bg-transparent text-sm text-white placeholder:text-muted/70 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="flex h-11 items-center gap-2 rounded-xl border border-line/80 bg-abyss/70 px-4 text-xs text-muted">
              <SlidersHorizontal className="size-4" />
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value as SortKey)}
                aria-label="Ordenar productos"
                className="bg-transparent text-sm text-white focus:outline-none"
              >
                {sortOptions.map((option) => (
                  <option key={option.key} value={option.key} className="bg-surface">
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              onClick={() => setInStockOnly((value) => !value)}
              className={cn(
                "h-11 cursor-pointer rounded-xl border px-4 text-sm font-medium transition-colors",
                inStockOnly
                  ? "border-neon-emerald/50 bg-neon-emerald/12 text-neon-emerald"
                  : "border-line/80 text-muted hover:text-white",
              )}
            >
              En stock
            </button>
          </div>
        </div>

        <div className="scrollbar-none flex gap-2 overflow-x-auto pb-1">
          {filters.map((filter) => (
            <button
              key={filter.key}
              type="button"
              onClick={() => setCategory(filter.key)}
              className={cn(
                "shrink-0 cursor-pointer rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] transition-all",
                category === filter.key
                  ? "border-neon-violet/60 bg-gradient-to-r from-neon-blue/25 to-neon-violet/25 text-white"
                  : "border-line/70 text-muted hover:border-neon-blue/45 hover:text-white",
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-muted">
        <p>
          <span className="font-semibold text-white">{filtered.length}</span> productos encontrados
        </p>
      </div>

      {filtered.length ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} currency={currency} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No encontramos resultados"
          description="Prueba con otro término de búsqueda, cambia de categoría o quita los filtros aplicados."
          icon={<Search className="size-6" />}
        />
      )}
    </div>
  );
}
