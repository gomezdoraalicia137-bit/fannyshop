import { Header } from "@/components/shop/header";
import { Footer } from "@/components/shop/footer";
import { AuroraBackground } from "@/components/effects/background";
import { getCurrentUser } from "@/lib/auth";
import { getSettings } from "@/lib/services/settings";
import { getCategories } from "@/lib/services/catalog";
import type { Role } from "@/lib/constants";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const [user, settings, categories] = await Promise.all([getCurrentUser(), getSettings(), getCategories()]);

  return (
    <div className="flex min-h-dvh flex-col">
      <AuroraBackground />
      <Header
        user={user ? { name: user.name, role: user.role as Role } : null}
        store={{ name: settings.storeName, logoUrl: settings.logoUrl }}
      />
      <main className="flex-1 pt-16">{children}</main>
      <Footer settings={settings} categories={categories} />
    </div>
  );
}
