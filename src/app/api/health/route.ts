import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function sanitize(message: string): string {
  return message.replace(/postgres(ql)?:\/\/[^\s"']+/gi, "postgresql://[oculto]");
}

export async function GET() {
  const url = process.env.DATABASE_URL;

  const report: Record<string, unknown> = {
    hasDatabaseUrl: Boolean(url),
    hasAuthSecret: Boolean(process.env.AUTH_SECRET),
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? null,
    runtime: typeof WebSocket === "undefined" ? "sin WebSocket" : "con WebSocket",
  };

  if (url) {
    try {
      const parsed = new URL(url);
      report.dbHost = parsed.hostname;
      report.usesPooler = parsed.hostname.includes("-pooler");
    } catch {
      report.dbHost = "cadena inválida";
    }
  }

  try {
    report.products = await prisma.product.count();
    report.dbConnection = "ok";
  } catch (error) {
    report.dbConnection = "fallo";
    report.dbError = sanitize(error instanceof Error ? error.message : String(error));
    report.dbErrorName = error instanceof Error ? error.name : "desconocido";
  }

  return NextResponse.json(report, { status: 200 });
}
