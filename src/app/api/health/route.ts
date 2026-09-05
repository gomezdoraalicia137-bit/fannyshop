import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function sanitize(message: string): string {
  return message.replace(/postgres(ql)?:\/\/[^\s"']+/gi, "postgresql://[oculto]");
}

async function readCloudflareEnv(): Promise<Record<string, unknown> | null> {
  try {
    const mod = await import("@opennextjs/cloudflare");
    const context = mod.getCloudflareContext();
    return (context?.env ?? null) as Record<string, unknown> | null;
  } catch {
    return null;
  }
}

export async function GET() {
  const cfEnv = await readCloudflareEnv();

  const report: Record<string, unknown> = {
    processEnv: {
      databaseUrl: Boolean(process.env.DATABASE_URL),
      authSecret: Boolean(process.env.AUTH_SECRET),
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? null,
    },
    cloudflareEnv: cfEnv
      ? {
          disponible: true,
          databaseUrl: Boolean(cfEnv.DATABASE_URL),
          authSecret: Boolean(cfEnv.AUTH_SECRET),
          claves: Object.keys(cfEnv).sort(),
        }
      : { disponible: false },
  };

  try {
    report.products = await prisma.product.count();
    report.dbConnection = "ok";
  } catch (error) {
    report.dbConnection = "fallo";
    report.dbError = sanitize(error instanceof Error ? error.message : String(error));
  }

  return NextResponse.json(report, { status: 200 });
}

