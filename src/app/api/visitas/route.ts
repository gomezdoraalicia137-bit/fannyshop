import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { ruta } = await req.json();
    await prisma.visita.create({
      data: { ruta: ruta || "/" },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Error registrando visita" }, { status: 500 });
  }
}
