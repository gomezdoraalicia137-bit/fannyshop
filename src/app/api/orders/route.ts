import { NextResponse } from "next/server";
import { createOrder } from "@/lib/services/orders";
import { createOrderSchema, firstError } from "@/lib/validators";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: firstError(parsed.error) }, { status: 400 });
  }

  const user = await getCurrentUser();

  const result = await createOrder({
    lines: parsed.data.lines,
    customer: parsed.data.customer,
    paymentMethod: parsed.data.paymentMethod,
    couponCode: parsed.data.couponCode ?? null,
    userId: user?.id ?? null,
  });

  if (!result.ok) return NextResponse.json(result, { status: 409 });
  return NextResponse.json(result, { status: 201 });
}
