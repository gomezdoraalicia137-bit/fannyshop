import type { Metadata } from "next";
import { CartView } from "@/components/shop/cart-view";
import { SectionHeading } from "@/components/ui/states";
import { getSettings } from "@/lib/services/settings";

export const metadata: Metadata = {
  title: "Carrito",
  description: "Revisa los productos digitales de tu carrito antes de pagar.",
  robots: { index: false, follow: false },
};

export default async function CartPage() {
  const settings = await getSettings();

  return (
    <div className="mx-auto w-full max-w-7xl space-y-10 px-4 py-14 sm:px-6 lg:px-8">
      <SectionHeading eyebrow="Carrito" title="Tu carrito" description="Modifica cantidades o aplica un cupón antes de pagar." />
      <CartView currency={settings.currency} />
    </div>
  );
}
