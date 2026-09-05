import { z } from "zod";

export const emailSchema = z.string().trim().toLowerCase().email("Correo inválido.");

export const passwordSchema = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres.")
  .max(72, "La contraseña es demasiado larga.");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Ingresa tu contraseña."),
});

export const registerSchema = z.object({
  name: z.string().trim().min(3, "Ingresa tu nombre completo.").max(80),
  email: emailSchema,
  password: passwordSchema,
});

export const forgotSchema = z.object({ email: emailSchema });

export const resetSchema = z.object({
  token: z.string().min(10, "Token inválido."),
  password: passwordSchema,
});

export const cartLineSchema = z.object({
  productId: z.string().min(1),
  denominationId: z.string().min(1),
  quantity: z.number().int().min(1).max(25),
});

export const createOrderSchema = z.object({
  lines: z.array(cartLineSchema).min(1, "Tu carrito está vacío."),
  customer: z.object({
    fullName: z.string().trim().min(3, "Ingresa tu nombre completo.").max(90),
    email: emailSchema,
    phone: z.string().trim().max(30).optional().nullable(),
    notes: z.string().trim().max(500).optional().nullable(),
  }),
  paymentMethod: z.string().min(1),
  couponCode: z.string().trim().max(40).optional().nullable(),
});

export const contactSchema = z.object({
  name: z.string().trim().min(3).max(80),
  email: emailSchema,
  subject: z.string().trim().min(3).max(120),
  message: z.string().trim().min(10).max(1200),
});

export const productSchema = z.object({
  name: z.string().trim().min(2).max(90),
  slug: z.string().trim().min(2).max(90),
  categoryId: z.string().min(1),
  brand: z.string().trim().max(90).optional().nullable(),
  description: z.string().trim().max(1500).default(""),
  terms: z.string().trim().max(1500).default(""),
  region: z.string().trim().max(60).default("Global"),
  accent: z.string().trim().max(20).default("blue"),
  tag: z.string().trim().max(20).optional().nullable(),
  logo: z.string().trim().max(80000).optional().nullable(),
  image: z.string().trim().max(80000).optional().nullable(),
  deliveryInfo: z.string().trim().max(400).default(""),
  active: z.boolean().default(true),
  featured: z.boolean().default(false),
  taxRate: z.number().min(0).max(5).nullable().optional(),
  marginRate: z.number().min(0).max(5).nullable().optional(),
  commissionRate: z.number().min(0).max(5).nullable().optional(),
  roundingRule: z.string().nullable().optional(),
  metaTitle: z.string().trim().max(120).optional().nullable(),
  metaDescription: z.string().trim().max(200).optional().nullable(),
});

export const denominationSchema = z.object({
  productId: z.string().min(1),
  label: z.string().trim().min(1).max(40),
  faceValue: z.number().min(0),
  cost: z.number().min(0),
  active: z.boolean().default(true),
  taxRate: z.number().min(0).max(5).nullable().optional(),
  marginRate: z.number().min(0).max(5).nullable().optional(),
  commissionRate: z.number().min(0).max(5).nullable().optional(),
  roundingRule: z.string().nullable().optional(),
});

export const categorySchema = z.object({
  name: z.string().trim().min(2).max(60),
  slug: z.string().trim().min(2).max(60),
  description: z.string().trim().max(400).optional().nullable(),
  icon: z.string().trim().max(40).default("Sparkles"),
  accent: z.string().trim().max(20).default("blue"),
  position: z.number().int().min(0).default(0),
  active: z.boolean().default(true),
});

export const couponSchema = z.object({
  code: z.string().trim().min(3).max(40),
  type: z.enum(["PERCENT", "FIXED"]),
  value: z.number().min(0),
  startsAt: z.string().optional().nullable(),
  endsAt: z.string().optional().nullable(),
  maxUses: z.number().int().min(0).nullable().optional(),
  minTotal: z.number().min(0).nullable().optional(),
  productIds: z.string().default(""),
  categoryIds: z.string().default(""),
  active: z.boolean().default(true),
});

export function firstError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Datos inválidos.";
}
