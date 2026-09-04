import Link from "next/link";
import { AuroraBackground } from "@/components/effects/background";
import { Logo } from "@/components/shop/logo";
import { getSettings } from "@/lib/services/settings";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();

  return (
    <div className="relative flex min-h-dvh flex-col">
      <AuroraBackground />
      <header className="flex items-center justify-between px-6 py-6">
        <Logo storeName={settings.storeName} src={settings.logoUrl} />
        <Link href="/" className="text-sm text-muted transition-colors hover:text-white">
          Volver a la tienda
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
