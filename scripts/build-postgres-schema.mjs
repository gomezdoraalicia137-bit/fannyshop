import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(root, "prisma", "schema.prisma");
const target = join(root, "prisma", "schema.postgres.prisma");

const schema = readFileSync(source, "utf8");

if (!schema.includes('provider = "sqlite"')) {
  console.error("El esquema base ya no usa sqlite; revisa prisma/schema.prisma.");
  process.exit(1);
}

const converted = schema
  .replace('provider = "sqlite"', 'provider = "postgresql"')
  .replace(
    /^generator client \{/m,
    "// Generado por scripts/build-postgres-schema.mjs — no editar a mano.\ngenerator client {",
  );

writeFileSync(target, converted, "utf8");
console.log("prisma/schema.postgres.prisma actualizado.");
