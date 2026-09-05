import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { createOrder } from "@/lib/services/orders";
import { createOrderSchema, firstError } from "@/lib/validators";
import { CATALOG_TAG } from "@/lib/cache";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: firstError(parsed.error) }, { status: 400 });
  }

  const user = await getCurrentUser();

  try {
    const result = await createOrder({
      lines: parsed.data.lines,
      customer: parsed.data.customer,
      paymentMethod: parsed.data.paymentMethod,
      couponCode: parsed.data.couponCode ?? null,
      userId: user?.id ?? null,
    });

    if (!result.ok) return NextResponse.json(result, { status: 409 });
    revalidateTag(CATALOG_TAG, { expire: 0 });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    console.error("order.create.failed", detail);
    return NextResponse.json(
      {
        ok: false,
        error: "No pudimos crear la orden. Intenta nuevamente en unos segundos.",
        detail: detail.replace(/postgres(ql)?:\/\/[^\s"']+/gi, "[oculto]").slice(0, 300),
      },
      { status: 500 },
    );
  }
}
