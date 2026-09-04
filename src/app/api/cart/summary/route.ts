import { NextResponse } from "next/server";
import { buildCartSummary, normalizeCart } from "@/lib/services/cart";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const lines = normalizeCart(body?.lines);
    const couponCode = typeof body?.couponCode === "string" ? body.couponCode : null;
    const summary = await buildCartSummary(lines, couponCode);
    return NextResponse.json(summary);
  } catch {
    return NextResponse.json({ error: "No se pudo calcular el carrito." }, { status: 400 });
  }
}
