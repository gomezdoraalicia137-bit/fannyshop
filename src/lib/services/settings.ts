import { prisma } from "@/lib/prisma";
import { DEFAULT_PRICING_RULES, isRoundingRule, type PricingRules } from "@/lib/pricing";
import type { RoundingRule } from "@/lib/constants";

export type StoreSettings = {
  storeName: string;
  tagline: string;
  logoUrl: string;
  faviconUrl: string;
  supportEmail: string;
  supportPhone: string;
  currency: string;
  locale: string;
  taxRate: number;
  marginRate: number;
  commissionRate: number;
  roundingRule: RoundingRule;
  paymentMethods: string[];
  autoDelivery: boolean;
  termsContent: string;
  privacyContent: string;
  refundContent: string;
  social: { facebook: string; instagram: string; twitter: string; discord: string; whatsapp: string };
};

export const DEFAULT_SETTINGS: StoreSettings = {
  storeName: "FannyShop",
  tagline: "Tu mundo digital, en un solo lugar.",
  logoUrl: "",
  faviconUrl: "",
  supportEmail: "soporte@fannyshop.app",
  supportPhone: "+503 0000 0000",
  currency: "USD",
  locale: "es-SV",
  taxRate: DEFAULT_PRICING_RULES.taxRate,
  marginRate: DEFAULT_PRICING_RULES.marginRate,
  commissionRate: DEFAULT_PRICING_RULES.commissionRate,
  roundingRule: DEFAULT_PRICING_RULES.roundingRule,
  paymentMethods: ["MANUAL_TRANSFER", "CARD", "PAYPAL", "CRYPTO"],
  autoDelivery: true,
  termsContent:
    "Los productos digitales vendidos en FannyShop son códigos de un solo uso. Una vez entregado el código, la compra se considera consumida.",
  privacyContent:
    "Únicamente almacenamos los datos necesarios para procesar tus órdenes. Nunca guardamos datos completos de tarjetas bancarias.",
  refundContent:
    "Aceptamos reembolsos cuando el código no ha sido entregado o presenta un defecto verificable dentro de las 48 horas posteriores a la compra.",
  social: { facebook: "", instagram: "", twitter: "", discord: "", whatsapp: "" },
};

const SETTINGS_KEY = "store";

export async function getSettings(): Promise<StoreSettings> {
  try {
    const record = await prisma.setting.findUnique({ where: { key: SETTINGS_KEY } });
    if (!record) return DEFAULT_SETTINGS;
    return normalize(JSON.parse(record.value));
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(patch: Partial<StoreSettings>): Promise<StoreSettings> {
  const current = await getSettings();
  const next = normalize({ ...current, ...patch, social: { ...current.social, ...patch.social } });
  await prisma.setting.upsert({
    where: { key: SETTINGS_KEY },
    create: { key: SETTINGS_KEY, value: JSON.stringify(next) },
    update: { value: JSON.stringify(next) },
  });
  return next;
}

export async function getGlobalPricingRules(): Promise<PricingRules> {
  const settings = await getSettings();
  return {
    taxRate: settings.taxRate,
    marginRate: settings.marginRate,
    commissionRate: settings.commissionRate,
    roundingRule: settings.roundingRule,
  };
}

function normalize(raw: Partial<StoreSettings>): StoreSettings {
  return {
    ...DEFAULT_SETTINGS,
    ...raw,
    taxRate: clampRate(raw.taxRate, DEFAULT_SETTINGS.taxRate),
    marginRate: clampRate(raw.marginRate, DEFAULT_SETTINGS.marginRate),
    commissionRate: clampRate(raw.commissionRate, DEFAULT_SETTINGS.commissionRate),
    roundingRule: isRoundingRule(raw.roundingRule) ? raw.roundingRule : DEFAULT_SETTINGS.roundingRule,
    paymentMethods:
      Array.isArray(raw.paymentMethods) && raw.paymentMethods.length
        ? raw.paymentMethods
        : DEFAULT_SETTINGS.paymentMethods,
    social: { ...DEFAULT_SETTINGS.social, ...(raw.social ?? {}) },
  };
}

function clampRate(value: unknown, fallback: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.min(Math.max(value, 0), 5);
}
