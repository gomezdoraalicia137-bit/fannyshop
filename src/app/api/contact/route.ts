import { NextResponse } from "next/server";
import { contactSchema, firstError } from "@/lib/validators";
import { recordAudit } from "@/lib/services/audit";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: firstError(parsed.error) }, { status: 400 });
  }

  await recordAudit({
    actorEmail: parsed.data.email,
    action: "contact.message",
    entity: "contact",
    metadata: { subject: parsed.data.subject, message: parsed.data.message, name: parsed.data.name },
  });

  return NextResponse.json({ ok: true });
}
