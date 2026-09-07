import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();

    if (!email || !code || code.length !== 6) {
      return NextResponse.json({ ok: false, error: "Ingresa un código de 6 dígitos válido." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ ok: false, error: "Usuario no encontrado." }, { status: 404 });
    }

    const tokenRecord = await prisma.passwordReset.findUnique({
      where: { tokenHash: `VERIFY_${code}_${user.id}` },
    });

    if (!tokenRecord) {
      return NextResponse.json({ ok: false, error: "El código ingresado es incorrecto." }, { status: 400 });
    }

    if (new Date() > tokenRecord.expiresAt) {
      return NextResponse.json({ ok: false, error: "El código ha expirado. Solicita uno nuevo." }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { status: "ACTIVE" },
    });

    await prisma.passwordReset.delete({ where: { id: tokenRecord.id } });

    const userRole = (user.role === "ADMIN" || user.role === "STAFF") ? user.role : "CUSTOMER";
    await createSession({ id: user.id, email: user.email, name: user.name, role: userRole });

    return NextResponse.json({ ok: true, role: userRole });
  } catch (err) {
    console.error("Error en verificación:", err);
    return NextResponse.json({ ok: false, error: "Error al verificar el código." }, { status: 500 });
  }
}
