import type { Metadata } from "next";
import { CheckoutFlow } from "@/components/shop/checkout-flow";
import { SectionHeading } from "@/components/ui/states";
import { getSettings } from "@/lib/services/settings";
import { getCurrentUser } from "@/lib/auth";
import { PAYMENT_METHODS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Completa tu compra de productos digitales.",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const [settings, user] = await Promise.all([getSettings(), getCurrentUser()]);
  const methods = PAYMENT_METHODS.filter((method) => settings.paymentMethods.includes(method.id)).map((method) => ({
    id: method.id,
    label: method.label,
  }));

  return (
    <div className="mx-auto w-full max-w-7xl space-y-10 px-4 py-14 sm:px-6 lg:px-8">
      <SectionHeading eyebrow="Checkout" title="Finaliza tu compra" description="Tres pasos rápidos y tus códigos quedan reservados." />
      <CheckoutFlow
        currency={settings.currency}
        methods={methods}
        defaults={{ fullName: user?.name ?? "", email: user?.email ?? "", phone: user?.phone ?? "" }}
      />
    </div>
  );
}
