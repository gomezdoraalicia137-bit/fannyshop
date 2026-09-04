import type { PriceBreakdown } from "@/lib/pricing";

export type DenominationView = {
  id: string;
  label: string;
  faceValue: number;
  price: number;
  breakdown: PriceBreakdown;
  stock: number;
  available: boolean;
};

export type ProductView = {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  description: string;
  terms: string;
  region: string;
  image: string | null;
  logo: string | null;
  accent: string;
  tag: string | null;
  featured: boolean;
  active: boolean;
  deliveryInfo: string;
  salesCount: number;
  createdAt: string;
  metaTitle: string | null;
  metaDescription: string | null;
  category: { id: string; name: string; slug: string; icon: string; accent: string };
  denominations: DenominationView[];
  fromPrice: number;
  stock: number;
  inStock: boolean;
};

export type CategoryView = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string;
  accent: string;
  productCount: number;
};

export type CartLine = {
  productId: string;
  denominationId: string;
  quantity: number;
};

export type CartLineView = CartLine & {
  productName: string;
  productSlug: string;
  denominationLabel: string;
  logo: string | null;
  accent: string;
  unitPrice: number;
  unitTax: number;
  lineTotal: number;
  stock: number;
};

export type CartSummary = {
  lines: CartLineView[];
  subtotal: number;
  taxTotal: number;
  discount: number;
  total: number;
  itemCount: number;
  couponCode: string | null;
  couponError: string | null;
};
