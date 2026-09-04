import { PrismaClient } from "@prisma/client";
import { createHash, pbkdf2Sync, randomBytes } from "crypto";

const prisma = new PrismaClient();

type SeedDenomination = { label: string; faceValue: number; cost: number };
type SeedProduct = {
  name: string;
  slug: string;
  category: string;
  accent: string;
  tag?: string;
  featured?: boolean;
  region: string;
  description: string;
  terms: string;
  marginRate?: number;
  denominations: SeedDenomination[];
};

const categories = [
  { name: "Gaming", slug: "gaming", icon: "Gamepad2", accent: "violet", description: "Recargas y saldo para tus plataformas de videojuegos." },
  { name: "Streaming", slug: "streaming", icon: "MonitorPlay", accent: "magenta", description: "Series, películas y entretenimiento sin límites." },
  { name: "Música", slug: "musica", icon: "Music4", accent: "cyan", description: "Suscripciones y saldo para plataformas de música." },
  { name: "Apps", slug: "apps", icon: "Smartphone", accent: "blue", description: "Créditos para tiendas de aplicaciones." },
  { name: "Compras", slug: "compras", icon: "ShoppingBag", accent: "emerald", description: "Tarjetas para comercios digitales." },
  { name: "Criptomonedas", slug: "criptomonedas", icon: "Bitcoin", accent: "cyan", description: "Recarga tus exchanges favoritos." },
  { name: "Entretenimiento", slug: "entretenimiento", icon: "Sparkles", accent: "violet", description: "Comunidad, contenido y experiencias digitales." },
];

const products: SeedProduct[] = [
  {
    name: "Apple Gift Card",
    slug: "apple-gift-card",
    category: "apps",
    accent: "blue",
    tag: "POPULAR",
    featured: true,
    region: "Estados Unidos",
    description:
      "Saldo para App Store, iTunes, iCloud+, Apple Music, Apple TV+ y compras dentro de aplicaciones. Se acredita al instante en tu cuenta Apple.",
    terms: "Válido únicamente para cuentas de la región Estados Unidos. No es canjeable por efectivo.",
    denominations: [
      { label: "$10", faceValue: 10, cost: 10 },
      { label: "$25", faceValue: 25, cost: 24.5 },
      { label: "$50", faceValue: 50, cost: 48.5 },
      { label: "$100", faceValue: 100, cost: 96 },
    ],
  },
  {
    name: "Google Play",
    slug: "google-play",
    category: "apps",
    accent: "emerald",
    tag: "MAS_VENDIDO",
    featured: true,
    region: "Estados Unidos",
    marginRate: 0.12,
    description:
      "Recarga tu cuenta de Google Play para comprar apps, juegos, libros, películas y suscripciones dentro de Android.",
    terms: "Un código solo puede canjearse una vez y en cuentas de la región indicada.",
    denominations: [
      { label: "$10", faceValue: 10, cost: 9.8 },
      { label: "$25", faceValue: 25, cost: 24.2 },
      { label: "$50", faceValue: 50, cost: 48 },
      { label: "$100", faceValue: 100, cost: 95.5 },
    ],
  },
  {
    name: "Binance Gift Card",
    slug: "binance-gift-card",
    category: "criptomonedas",
    accent: "cyan",
    tag: "NUEVO",
    featured: true,
    region: "Global",
    marginRate: 0.15,
    description:
      "Tarjeta regalo cripto canjeable en Binance por USDT. Ideal para iniciar en el ecosistema cripto sin transferencias complejas.",
    terms: "Requiere cuenta Binance verificada. El saldo se acredita en USDT.",
    denominations: [
      { label: "$10", faceValue: 10, cost: 10 },
      { label: "$25", faceValue: 25, cost: 25 },
      { label: "$50", faceValue: 50, cost: 50 },
      { label: "$100", faceValue: 100, cost: 100 },
    ],
  },
  {
    name: "Steam Wallet",
    slug: "steam-wallet",
    category: "gaming",
    accent: "violet",
    tag: "MAS_VENDIDO",
    featured: true,
    region: "Global",
    description:
      "Añade saldo a tu monedero de Steam y compra juegos, DLC, objetos del mercado y contenido dentro del juego.",
    terms: "El saldo de Steam no es transferible ni reembolsable una vez acreditado.",
    denominations: [
      { label: "$10", faceValue: 10, cost: 9.9 },
      { label: "$20", faceValue: 20, cost: 19.6 },
      { label: "$50", faceValue: 50, cost: 48.9 },
      { label: "$100", faceValue: 100, cost: 97 },
    ],
  },
  {
    name: "PlayStation Store",
    slug: "playstation-store",
    category: "gaming",
    accent: "blue",
    tag: "POPULAR",
    region: "Estados Unidos",
    description:
      "Fondos para PlayStation Store: juegos, expansiones, PS Plus y contenido adicional para PS4 y PS5.",
    terms: "Válido para cuentas PSN de Estados Unidos. Un código por cuenta.",
    denominations: [
      { label: "$10", faceValue: 10, cost: 9.85 },
      { label: "$25", faceValue: 25, cost: 24.4 },
      { label: "$50", faceValue: 50, cost: 48.4 },
      { label: "$100", faceValue: 100, cost: 96.5 },
    ],
  },
  {
    name: "Xbox Gift Card",
    slug: "xbox-gift-card",
    category: "gaming",
    accent: "emerald",
    region: "Estados Unidos",
    description: "Saldo para Microsoft Store: juegos de Xbox, Game Pass, aplicaciones y entretenimiento.",
    terms: "Aplica para cuentas Microsoft de la región Estados Unidos.",
    denominations: [
      { label: "$10", faceValue: 10, cost: 9.85 },
      { label: "$25", faceValue: 25, cost: 24.4 },
      { label: "$50", faceValue: 50, cost: 48.4 },
    ],
  },
  {
    name: "Amazon Gift Card",
    slug: "amazon-gift-card",
    category: "compras",
    accent: "emerald",
    tag: "OFERTA",
    region: "Estados Unidos",
    marginRate: 0.08,
    description: "Compra millones de productos en Amazon con saldo acreditado directamente en tu cuenta.",
    terms: "No aplica para compras con proveedores externos que no acepten saldo Amazon.",
    denominations: [
      { label: "$10", faceValue: 10, cost: 9.9 },
      { label: "$25", faceValue: 25, cost: 24.6 },
      { label: "$50", faceValue: 50, cost: 49 },
      { label: "$100", faceValue: 100, cost: 97.5 },
    ],
  },
  {
    name: "Netflix",
    slug: "netflix",
    category: "streaming",
    accent: "magenta",
    tag: "POPULAR",
    featured: true,
    region: "Latinoamérica",
    description: "Recarga tu cuenta Netflix y disfruta series, películas y documentales en todos tus dispositivos.",
    terms: "El saldo se aplica automáticamente a tu ciclo de facturación.",
    denominations: [
      { label: "$15", faceValue: 15, cost: 14.6 },
      { label: "$30", faceValue: 30, cost: 29.2 },
      { label: "$60", faceValue: 60, cost: 58 },
    ],
  },
  {
    name: "Spotify Premium",
    slug: "spotify-premium",
    category: "musica",
    accent: "emerald",
    region: "Latinoamérica",
    description: "Música sin anuncios, descargas offline y calidad superior con saldo Spotify Premium.",
    terms: "No puede combinarse con planes familiares gestionados por terceros.",
    denominations: [
      { label: "1 mes", faceValue: 10, cost: 9.5 },
      { label: "3 meses", faceValue: 30, cost: 28 },
      { label: "6 meses", faceValue: 60, cost: 55 },
    ],
  },
  {
    name: "Roblox",
    slug: "roblox",
    category: "gaming",
    accent: "magenta",
    tag: "NUEVO",
    region: "Global",
    description: "Robux para personalizar tu avatar, comprar accesorios y desbloquear experiencias premium.",
    terms: "Los Robux se acreditan a la cuenta que canjea el código.",
    denominations: [
      { label: "800 Robux", faceValue: 10, cost: 9.7 },
      { label: "1700 Robux", faceValue: 20, cost: 19.2 },
      { label: "4500 Robux", faceValue: 50, cost: 47.5 },
    ],
  },
  {
    name: "Nintendo eShop",
    slug: "nintendo-eshop",
    category: "gaming",
    accent: "magenta",
    region: "Estados Unidos",
    description: "Saldo para Nintendo Switch: juegos digitales, DLC y Nintendo Switch Online.",
    terms: "Válido para cuentas Nintendo de la región Estados Unidos.",
    denominations: [
      { label: "$10", faceValue: 10, cost: 9.85 },
      { label: "$20", faceValue: 20, cost: 19.5 },
      { label: "$35", faceValue: 35, cost: 34 },
    ],
  },
  {
    name: "Discord Nitro",
    slug: "discord-nitro",
    category: "entretenimiento",
    accent: "violet",
    region: "Global",
    description: "Mejora tu experiencia en Discord con emojis globales, mejor calidad de streaming y perfiles únicos.",
    terms: "No acumulable con promociones activas de Discord.",
    denominations: [
      { label: "1 mes", faceValue: 10, cost: 9.6 },
      { label: "3 meses", faceValue: 30, cost: 28.5 },
      { label: "12 meses", faceValue: 100, cost: 96 },
    ],
  },
];

async function main() {
  await prisma.$transaction([
    prisma.auditLog.deleteMany(),
    prisma.digitalCode.deleteMany(),
    prisma.payment.deleteMany(),
    prisma.orderItem.deleteMany(),
    prisma.order.deleteMany(),
    prisma.denomination.deleteMany(),
    prisma.product.deleteMany(),
    prisma.category.deleteMany(),
    prisma.coupon.deleteMany(),
    prisma.passwordReset.deleteMany(),
    prisma.user.deleteMany(),
    prisma.setting.deleteMany(),
  ]);

  const users = [
    { email: "admin@fannyshop.app", name: "Administrador", role: "ADMIN", password: "Admin123!" },
    { email: "staff@fannyshop.app", name: "Equipo Soporte", role: "STAFF", password: "Staff123!" },
    { email: "cliente@fannyshop.app", name: "Cliente Demo", role: "CUSTOMER", password: "Cliente123!" },
  ];

  for (const user of users) {
    await prisma.user.create({
      data: {
        email: user.email,
        name: user.name,
        role: user.role,
        passwordHash: hashPassword(user.password),
      },
    });
  }

  const categoryMap = new Map<string, string>();
  for (const [index, category] of categories.entries()) {
    const created = await prisma.category.create({
      data: { ...category, position: index },
    });
    categoryMap.set(category.slug, created.id);
  }

  for (const product of products) {
    const created = await prisma.product.create({
      data: {
        name: product.name,
        slug: product.slug,
        brand: product.name,
        description: product.description,
        terms: product.terms,
        region: product.region,
        accent: product.accent,
        tag: product.tag ?? null,
        featured: product.featured ?? false,
        marginRate: product.marginRate ?? null,
        categoryId: categoryMap.get(product.category)!,
        salesCount: Math.floor(Math.random() * 400) + 40,
        metaTitle: `${product.name} | FannyShop`,
        metaDescription: product.description.slice(0, 155),
      },
    });

    for (const [index, denomination] of product.denominations.entries()) {
      const createdDenomination = await prisma.denomination.create({
        data: {
          productId: created.id,
          label: denomination.label,
          faceValue: denomination.faceValue,
          cost: denomination.cost,
          position: index,
        },
      });

      const quantity = 12;
      for (let i = 0; i < quantity; i += 1) {
        const secret = buildCode(product.slug, denomination.label, i);
        await prisma.digitalCode.create({
          data: {
            productId: created.id,
            denominationId: createdDenomination.id,
            secret,
            fingerprint: createHash("sha256")
              .update(`${created.id}:${createdDenomination.id}:${secret}`)
              .digest("hex"),
            batch: "LOTE-INICIAL",
          },
        });
      }
    }
  }

  await prisma.coupon.createMany({
    data: [
      { code: "GAMER10", type: "PERCENT", value: 10, active: true, maxUses: 200 },
      { code: "BIENVENIDO5", type: "FIXED", value: 5, active: true, minTotal: 25, maxUses: 500 },
    ],
  });

  console.log("Seed completado.");
}

function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = pbkdf2Sync(password, salt, 100_000, 32, "sha256");
  return `pbkdf2$100000$${salt.toString("base64")}$${hash.toString("base64")}`;
}

function buildCode(slug: string, label: string, index: number): string {
  const base = `${slug}-${label}-${index}`.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const hash = createHash("sha1").update(base).digest("hex").toUpperCase();
  return `${hash.slice(0, 4)}-${hash.slice(4, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}`;
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
