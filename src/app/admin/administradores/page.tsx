import { redirect } from "next/navigation";
import { PageHeader } from "@/components/admin/primitives";
import { StaffManager } from "@/components/admin/staff-manager";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getSettings } from "@/lib/services/settings";
import { listAudit } from "@/lib/services/audit";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminStaffPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/admin");

  const [staff, settings, logs] = await Promise.all([
    prisma.user.findMany({ where: { role: { in: ["ADMIN", "STAFF"] } }, orderBy: { createdAt: "asc" } }),
    getSettings(),
    listAudit(40),
  ]);

  return (
    <>
      <PageHeader title="Administradores" description="Gestiona los accesos del equipo y revisa el registro de auditoría." />

      <StaffManager
        staff={staff.map((member) => ({
          id: member.id,
          name: member.name,
          email: member.email,
          role: member.role,
          status: member.status,
          createdAt: member.createdAt.toISOString(),
        }))}
        locale={settings.locale}
        currentUserId={user.id}
      />

      <Card className="mt-6">
        <CardHeader title="Audit log" description="Últimas acciones administrativas registradas." />
        <CardBody className="space-y-2">
          {logs.map((log) => (
            <div key={log.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line/60 bg-abyss/50 px-3 py-2 text-xs">
              <span className="font-medium text-white">{log.action}</span>
              <span className="text-muted">
                {log.entity}
                {log.entityId ? ` · ${log.entityId.slice(0, 8)}` : ""} · {log.actorEmail ?? "sistema"} ·{" "}
                {formatDateTime(log.createdAt, settings.locale)}
              </span>
            </div>
          ))}
        </CardBody>
      </Card>
    </>
  );
}
