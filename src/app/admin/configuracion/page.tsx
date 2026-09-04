import { redirect } from "next/navigation";
import { PageHeader } from "@/components/admin/primitives";
import { SettingsForm } from "@/components/admin/settings-form";
import { getSettings } from "@/lib/services/settings";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/admin");

  const settings = await getSettings();

  return (
    <>
      <PageHeader
        title="Configuración general"
        description="Todos estos valores se aplican en la tienda sin necesidad de modificar código."
      />
      <SettingsForm settings={settings} />
    </>
  );
}
