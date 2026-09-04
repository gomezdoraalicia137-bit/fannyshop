import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/shop/password-forms";

export const metadata: Metadata = { title: "Restablecer contraseña", robots: { index: false, follow: false } };

export default async function ResetPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  return <ResetPasswordForm token={token ?? ""} />;
}
