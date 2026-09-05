import { cache } from "react";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import { requireEnv } from "@/lib/env";

neonConfig.poolQueryViaFetch = true;

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const isDevelopment = process.env.NODE_ENV === "development";

function createClient(): PrismaClient {
  return new PrismaClient({
    adapter: new PrismaNeon({ connectionString: requireEnv("DATABASE_URL") }),
    log: isDevelopment ? ["error", "warn"] : ["error"],
  });
}

const getRequestClient = cache(createClient);

export function getPrisma(): PrismaClient {
  if (isDevelopment) {
    if (!globalForPrisma.prisma) globalForPrisma.prisma = createClient();
    return globalForPrisma.prisma;
  }
  if (!globalForPrisma.prisma) globalForPrisma.prisma = getRequestClient();
  return globalForPrisma.prisma;
}

export async function withTransaction<T>(
  run: (tx: Parameters<Parameters<PrismaClient["$transaction"]>[0]>[0]) => Promise<T>,
): Promise<T> {
  if (isDevelopment) return getPrisma().$transaction(run);

  const client = createClient();
  try {
    return await client.$transaction(run);
  } finally {
    await client.$disconnect().catch(() => undefined);
  }
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property, receiver) {
    return Reflect.get(getPrisma() as object, property, receiver);
  },
}) as PrismaClient;
