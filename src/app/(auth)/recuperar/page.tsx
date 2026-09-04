import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/shop/password-forms";

export const metadata: Metadata = { title: "Recuperar contraseña", robots: { index: false, follow: false } };

export default function ForgotPage() {
  return <ForgotPasswordForm />;
}
