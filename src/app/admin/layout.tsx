import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { getCurrentUser } from "@/lib/auth";
import { getSettings } from "@/lib/services/settings";
import type { Role } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const settings = await getSettings();
  return {
    title: `Panel administrativo | ${settings.storeName}`,
    robots: { index: false, follow: false },
  };
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN" && user.role !== "STAFF") redirect("/cuenta");

  const settings = await getSettings();

  return (
    <AdminShell
      user={{ name: user.name, email: user.email, role: user.role as Role }}
      store={{ name: settings.storeName, logoUrl: settings.logoUrl }}
    >
      {children}
    </AdminShell>
  );
}
