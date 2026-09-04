import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession, hashPassword, verifyPassword } from "@/lib/auth";
import { isLegacyHash } from "@/lib/password";
import { firstError, loginSchema } from "@/lib/validators";
import { recordAudit } from "@/lib/services/audit";
import type { Role } from "@/lib/constants";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: firstError(parsed.error) }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  const valid = user ? await verifyPassword(parsed.data.password, user.passwordHash) : false;

  if (!user || !valid || user.status !== "ACTIVE") {
    return NextResponse.json({ ok: false, error: "Credenciales inválidas." }, { status: 401 });
  }

  if (isLegacyHash(user.passwordHash)) {
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: await hashPassword(parsed.data.password) },
    });
  }

  await createSession({ id: user.id, email: user.email, name: user.name, role: user.role as Role });
  await recordAudit({ actorId: user.id, actorEmail: user.email, action: "auth.login", entity: "user", entityId: user.id });

  return NextResponse.json({ ok: true, role: user.role });
}
