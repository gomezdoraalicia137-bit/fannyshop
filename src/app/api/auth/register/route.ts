import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { firstError, registerSchema } from "@/lib/validators";
import { sendVerificationEmail } from "@/lib/mail";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: firstError(parsed.error) }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  
  if (existing && existing.status === "ACTIVE") {
    return NextResponse.json({ ok: false, error: "Ya existe una cuenta con este correo." }, { status: 409 });
  }

  let user = existing;

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: parsed.data.email,
        name: parsed.data.name,
        passwordHash: await hashPassword(parsed.data.password),
        role: "CUSTOMER",
        status: "PENDING_VERIFICATION",
      },
    });
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();

  await prisma.passwordReset.deleteMany({ where: { userId: user.id } });

  await prisma.passwordReset.create({
    data: {
      userId: user.id,
      tokenHash: `VERIFY_${code}_${user.id}`,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    },
  });

  await sendVerificationEmail(parsed.data.email, code);

  return NextResponse.json({
    ok: true,
    requiresVerification: true,
    email: parsed.data.email,
  }, { status: 201 });
}
