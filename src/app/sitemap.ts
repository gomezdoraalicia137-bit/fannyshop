import type { MetadataRoute } from "next";
import { getCategories, getProductSlugs } from "@/lib/services/catalog";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const [slugs, categories] = await Promise.all([getProductSlugs(), getCategories()]);

  const staticRoutes = ["", "/tarjetas", "/categorias", "/ofertas", "/faq", "/contacto", "/legal/terminos", "/legal/privacidad", "/legal/reembolsos"];

  return [
    ...staticRoutes.map((route) => ({
      url: `${base}${route}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1 : 0.7,
    })),
    ...categories.map((category) => ({
      url: `${base}/categorias/${category.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...slugs.map((slug) => ({
      url: `${base}/producto/${slug}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
  ];
}
