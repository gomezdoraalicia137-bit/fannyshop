"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Pencil, Plus, Power, Search, Trash2 } from "lucide-react";
import { DataTable, Td } from "@/components/admin/primitives";
import { Badge, ProductTagBadge } from "@/components/ui/badge";
import { BrandThumb } from "@/components/shop/brand-tile";
import { Button, LinkButton } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";
import { Select } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { deleteProductAction, toggleProductAction } from "@/lib/actions/admin";
import { formatMoney } from "@/lib/money";

export type AdminProductRow = {
  id: string;
  name: string;
  slug: string;
  category: string;
  categorySlug: string;
  denominations: number;
  stock: number;
  fromPrice: number;
  active: boolean;
  featured: boolean;
  tag: string | null;
  logo: string | null;
  accent: string;
  sales: number;
};

export function ProductsTable({
  products,
  categories,
  currency,
  canDelete,
}: {
  products: AdminProductRow[];
  categories: { slug: string; name: string }[];
  currency: string;
  canDelete: boolean;
}) {
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("ALL");

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return products.filter((product) => {
      const matchesTerm = !term || product.name.toLowerCase().includes(term);
      const matchesCategory = category === "ALL" || product.categorySlug === category;
      return matchesTerm && matchesCategory;
    });
  }, [products, query, category]);

  const toggle = (id: string, active: boolean) => {
    startTransition(async () => {
      await toggleProductAction(id, active);
      toast.success(active ? "Producto activado." : "Producto desactivado.");
    });
  };

  const remove = (id: string) => {
    startTransition(async () => {
      await deleteProductAction(id);
      toast.success("Producto eliminado.");
    });
  };

  return (
    <div className="space-y-4">
      <div className="glass flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center">
        <div className="flex h-11 flex-1 items-center gap-2.5 rounded-xl border border-line/80 bg-abyss/70 px-4">
          <Search className="size-4 text-muted" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar producto"
            aria-label="Buscar productos"
            className="h-full w-full bg-transparent text-sm text-white placeholder:text-muted/70 focus:outline-none"
          />
        </div>
        <Select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filtrar por categoría" className="sm:w-56">
          <option value="ALL">Todas las categorías</option>
          {categories.map((item) => (
            <option key={item.slug} value={item.slug}>
              {item.name}
            </option>
          ))}
        </Select>
        <LinkButton href="/admin/productos/nuevo" size="sm">
          <Plus className="size-4" /> Nuevo producto
        </LinkButton>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="Sin productos" description="Crea tu primer producto para comenzar a vender." />
      ) : (
        <>
          <div className="hidden lg:block">
            <DataTable headers={["Producto", "Categoría", "Denominaciones", "Stock", "Desde", "Ventas", "Estado", "Acciones"]}>
              {filtered.map((product) => (
                <tr key={product.id} className="transition-colors hover:bg-white/[0.03]">
                  <Td>
                    <div className="flex items-center gap-3">
                      <BrandThumb
                        name={product.name}
                        accent={product.accent}
                        logo={product.logo}
                        fallback={product.name.slice(0, 2).toUpperCase()}
                        className="size-10"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <Link href={`/admin/productos/${product.id}`} className="text-sm font-medium text-white hover:text-neon-cyan">
                            {product.name}
                          </Link>
                          {product.tag ? <ProductTagBadge tag={product.tag} /> : null}
                        </div>
                        <p className="text-xs text-muted">/{product.slug}</p>
                      </div>
                    </div>
                  </Td>
                  <Td className="text-sm">{product.category}</Td>
                  <Td>{product.denominations}</Td>
                  <Td>
                    <Badge tone={product.stock > 10 ? "emerald" : product.stock > 0 ? "amber" : "rose"}>
                      {product.stock}
                    </Badge>
                  </Td>
                  <Td className="font-semibold">{formatMoney(product.fromPrice, currency)}</Td>
                  <Td>{product.sales}</Td>
                  <Td>
                    <Badge tone={product.active ? "emerald" : "slate"}>{product.active ? "Activo" : "Inactivo"}</Badge>
                  </Td>
                  <Td>
                    <div className="flex gap-1.5">
                      <LinkButton href={`/admin/productos/${product.id}`} variant="secondary" size="icon" aria-label="Editar">
                        <Pencil className="size-4" />
                      </LinkButton>
                      <Button
                        variant="outline"
                        size="icon"
                        aria-label={product.active ? "Desactivar" : "Activar"}
                        disabled={pending}
                        onClick={() => toggle(product.id, !product.active)}
                      >
                        <Power className="size-4" />
                      </Button>
                      {canDelete ? (
                        <Button
                          variant="danger"
                          size="icon"
                          aria-label="Eliminar"
                          disabled={pending}
                          onClick={() => remove(product.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      ) : null}
                    </div>
                  </Td>
                </tr>
              ))}
            </DataTable>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:hidden">
            {filtered.map((product) => (
              <div key={product.id} className="glass space-y-3 rounded-2xl p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <BrandThumb
                      name={product.name}
                      accent={product.accent}
                      logo={product.logo}
                      fallback={product.name.slice(0, 2).toUpperCase()}
                      className="size-10"
                    />
                    <div>
                      <Link href={`/admin/productos/${product.id}`} className="text-sm font-semibold text-white">
                        {product.name}
                      </Link>
                      <p className="text-xs text-muted">{product.category}</p>
                    </div>
                  </div>
                  <Badge tone={product.active ? "emerald" : "slate"}>{product.active ? "Activo" : "Inactivo"}</Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-muted">
                  <span>Stock: {product.stock}</span>
                  <span className="font-display text-sm font-semibold text-white">
                    {formatMoney(product.fromPrice, currency)}
                  </span>
                </div>
                <div className="flex gap-2">
                  <LinkButton href={`/admin/productos/${product.id}`} variant="secondary" size="sm" className="flex-1">
                    Editar
                  </LinkButton>
                  <Button variant="outline" size="sm" disabled={pending} onClick={() => toggle(product.id, !product.active)}>
                    <Power className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
