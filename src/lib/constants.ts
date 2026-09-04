export const ROLES = ["ADMIN", "STAFF", "CUSTOMER"] as const;
export type Role = (typeof ROLES)[number];

export const ORDER_STATUSES = [
  "PENDING",
  "AWAITING_PAYMENT",
  "PAID",
  "PROCESSING",
  "DELIVERED",
  "COMPLETED",
  "CANCELLED",
  "REFUNDED",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_STATUSES = ["PENDING", "APPROVED", "REJECTED", "REFUNDED"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const CODE_STATUSES = ["AVAILABLE", "RESERVED", "SOLD", "DELIVERED", "CANCELLED"] as const;
export type CodeStatus = (typeof CODE_STATUSES)[number];

export const ROUNDING_RULES = ["NONE", "END_00", "END_49", "END_99", "NEXT_UNIT"] as const;
export type RoundingRule = (typeof ROUNDING_RULES)[number];

export const PAYMENT_METHODS = [
  { id: "MANUAL_TRANSFER", label: "Transferencia bancaria" },
  { id: "CARD", label: "Tarjeta de crédito / débito" },
  { id: "PAYPAL", label: "PayPal" },
  { id: "CRYPTO", label: "Criptomonedas" },
] as const;

export const PRODUCT_TAGS = ["NUEVO", "POPULAR", "MAS_VENDIDO", "OFERTA"] as const;
export type ProductTag = (typeof PRODUCT_TAGS)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Pendiente",
  AWAITING_PAYMENT: "Pago pendiente",
  PAID: "Pagado",
  PROCESSING: "Procesando",
  DELIVERED: "Entregado",
  COMPLETED: "Completado",
  CANCELLED: "Cancelado",
  REFUNDED: "Reembolsado",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: "Pendiente",
  APPROVED: "Aprobado",
  REJECTED: "Rechazado",
  REFUNDED: "Reembolsado",
};

export const CODE_STATUS_LABELS: Record<CodeStatus, string> = {
  AVAILABLE: "Disponible",
  RESERVED: "Reservado",
  SOLD: "Vendido",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
};

export const ROUNDING_RULE_LABELS: Record<RoundingRule, string> = {
  NONE: "Sin redondeo",
  END_00: "Redondear a .00",
  END_49: "Redondear a .49",
  END_99: "Redondear a .99",
  NEXT_UNIT: "Redondear al siguiente dólar",
};

export const PRODUCT_TAG_LABELS: Record<ProductTag, string> = {
  NUEVO: "Nuevo",
  POPULAR: "Popular",
  MAS_VENDIDO: "Más vendido",
  OFERTA: "Oferta",
};

export const ACCENTS = ["blue", "violet", "cyan", "magenta", "emerald"] as const;
export type Accent = (typeof ACCENTS)[number];
