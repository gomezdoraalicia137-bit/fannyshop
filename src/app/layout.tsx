import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Orbitron, Space_Grotesk } from "next/font/google";
import { ToastProvider } from "@/components/ui/toast";
import { CartProvider } from "@/components/shop/cart-provider";
import { getSettings } from "@/lib/services/settings";
import "./globals.css";
import RastreadorVisitas from "@/components/RastreadorVisitas";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const [settings, headerList] = await Promise.all([getSettings(), headers()]);

  const host = headerList.get("host");
  const protocol = headerList.get("x-forwarded-proto") ?? (host?.includes("localhost") ? "http" : "https");
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || (host ? `${protocol}://${host}` : "http://localhost:3000");

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: `${settings.storeName} | Tarjetas digitales, gaming y entretenimiento`,
      template: `%s | ${settings.storeName}`,
    },
    description:
      "Compra tarjetas regalo, códigos digitales y suscripciones con entrega inmediata: Apple, Google Play, Steam, PlayStation, Xbox, Netflix, Binance y más.",
    keywords: ["tarjetas regalo", "gift cards", "códigos digitales", "gaming", "streaming", "criptomonedas"],
    icons: settings.faviconUrl ? { icon: settings.faviconUrl } : undefined,
    openGraph: {
      type: "website",
      locale: "es_ES",
      siteName: settings.storeName,
      title: `${settings.storeName} | ${settings.tagline}`,
      description: "Tarjetas digitales, gaming, entretenimiento y mucho más con entrega inmediata.",
      url: siteUrl,
    },
    twitter: {
      card: "summary_large_image",
      title: settings.storeName,
      description: "Tarjetas digitales, gaming y entretenimiento con entrega inmediata.",
    },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: "#05060d",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${spaceGrotesk.variable} ${orbitron.variable}`}>
      <body className="antialiased">
        <RastreadorVisitas />
        <ToastProvider>
          <CartProvider>{children}</CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
