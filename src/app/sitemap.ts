import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { getCategories, getProductSlugs } from "@/lib/services/catalog";

export const dynamic = "force-dynamic";

async function resolveBaseUrl(): Promise<string> {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  const headerList = await headers();
  const host = headerList.get("host");
  if (!host) return "http://localhost:3000";
  const protocol = headerList.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  return `${protocol}://${host}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = await resolveBaseUrl();

  const staticRoutes = ["", "/tarjetas", "/categorias", "/ofertas", "/faq", "/contacto", "/legal/terminos", "/legal/privacidad", "/legal/reembolsos"];

  const entries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.7,
  }));

  try {
    const [slugs, categories] = await Promise.all([getProductSlugs(), getCategories()]);

    entries.push(
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
    );
  } catch {
    return entries;
  }

  return entries;
}
