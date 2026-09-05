"use server";

import { revalidatePath, updateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireStaff, hashPassword } from "@/lib/auth";
import { recordAudit } from "@/lib/services/audit";
import { saveSettings } from "@/lib/services/settings";
import { addCodes } from "@/lib/services/inventory";
import { assignCodeToItem, deliverOrder, markOrderPaid, updateOrderStatus } from "@/lib/services/orders";
import { isRoundingRule } from "@/lib/pricing";
import { isValidImageValue } from "@/lib/media";
import { CATALOG_TAG, SETTINGS_TAG } from "@/lib/cache";
import { slugify } from "@/lib/utils";
import { categorySchema, couponSchema, denominationSchema, firstError, productSchema } from "@/lib/validators";
import type { OrderStatus, Role } from "@/lib/constants";

export type ActionState = { ok: boolean; message: string } | null;

const ADMIN_PATHS = [
  "/admin",
  "/admin/ordenes",
  "/admin/productos",
  "/admin/categorias",
  "/admin/inventario",
  "/admin/clientes",
  "/admin/pagos",
  "/admin/precios",
  "/admin/promociones",
  "/admin/reportes",
  "/admin/administradores",
  "/admin/configuracion",
];

function revalidateAdmin() {
  updateTag(CATALOG_TAG);
  updateTag(SETTINGS_TAG);
  for (const path of ADMIN_PATHS) revalidatePath(path);
  revalidatePath("/", "layout");
}

function optionalRate(value: FormDataEntryValue | null): number | null {
  if (value === null || String(value).trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed / 100 : null;
}

function optionalString(value: FormDataEntryValue | null): string | null {
  const text = String(value ?? "").trim();
  return text ? text : null;
}

export async function saveProductAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const staff = await requireStaff();
  const id = optionalString(formData.get("id"));
  const name = String(formData.get("name") ?? "").trim();

  const parsed = productSchema.safeParse({
    name,
    slug: slugify(String(formData.get("slug") ?? "") || name),
    categoryId: String(formData.get("categoryId") ?? ""),
    brand: optionalString(formData.get("brand")),
    description: String(formData.get("description") ?? ""),
    terms: String(formData.get("terms") ?? ""),
    region: String(formData.get("region") ?? "Global"),
    accent: String(formData.get("accent") ?? "blue"),
    tag: optionalString(formData.get("tag")),
    logo: optionalString(formData.get("logo")),
    image: optionalString(formData.get("image")),
    deliveryInfo: String(formData.get("deliveryInfo") ?? ""),
    active: formData.get("active") === "on",
    featured: formData.get("featured") === "on",
    taxRate: optionalRate(formData.get("taxRate")),
    marginRate: optionalRate(formData.get("marginRate")),
    commissionRate: optionalRate(formData.get("commissionRate")),
    roundingRule: optionalString(formData.get("roundingRule")),
    metaTitle: optionalString(formData.get("metaTitle")),
    metaDescription: optionalString(formData.get("metaDescription")),
  });

  if (!parsed.success) return { ok: false, message: firstError(parsed.error) };

  if (!isValidImageValue(parsed.data.logo) || !isValidImageValue(parsed.data.image)) {
    return {
      ok: false,
      message: "La imagen debe ser una URL https, un SVG pegado o una imagen en base64.",
    };
  }

  const data = {
    ...parsed.data,
    roundingRule: isRoundingRule(parsed.data.roundingRule) ? parsed.data.roundingRule : null,
  };

  try {
    const product = id ? await prisma.product.update({ where: { id }, data }) : await prisma.product.create({ data });

    await recordAudit({
      actorId: staff.id,
      actorEmail: staff.email,
      action: id ? "product.updated" : "product.created",
      entity: "product",
      entityId: product.id,
    });

    revalidateAdmin();
    return { ok: true, message: id ? "Producto actualizado." : "Producto creado." };
  } catch {
    return { ok: false, message: "No se pudo guardar el producto. Verifica que el slug sea único." };
  }
}

export async function toggleProductAction(id: string, active: boolean) {
  const staff = await requireStaff();
  await prisma.product.update({ where: { id }, data: { active } });
  await recordAudit({ actorId: staff.id, actorEmail: staff.email, action: "product.toggled", entity: "product", entityId: id });
  revalidateAdmin();
}

export async function deleteProductAction(id: string) {
  const admin = await requireAdmin();
  await prisma.product.delete({ where: { id } });
  await recordAudit({ actorId: admin.id, actorEmail: admin.email, action: "product.deleted", entity: "product", entityId: id });
  revalidateAdmin();
}

export async function saveDenominationAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const staff = await requireStaff();
  const id = optionalString(formData.get("id"));

  const parsed = denominationSchema.safeParse({
    productId: String(formData.get("productId") ?? ""),
    label: String(formData.get("label") ?? ""),
    faceValue: Number(formData.get("faceValue") ?? 0),
    cost: Number(formData.get("cost") ?? 0),
    active: formData.get("active") !== "off",
    taxRate: optionalRate(formData.get("taxRate")),
    marginRate: optionalRate(formData.get("marginRate")),
    commissionRate: optionalRate(formData.get("commissionRate")),
    roundingRule: optionalString(formData.get("roundingRule")),
  });

  if (!parsed.success) return { ok: false, message: firstError(parsed.error) };

  const data = {
    ...parsed.data,
    roundingRule: isRoundingRule(parsed.data.roundingRule) ? parsed.data.roundingRule : null,
  };

  const denomination = id
    ? await prisma.denomination.update({ where: { id }, data })
    : await prisma.denomination.create({ data });

  await recordAudit({
    actorId: staff.id,
    actorEmail: staff.email,
    action: id ? "denomination.updated" : "denomination.created",
    entity: "denomination",
    entityId: denomination.id,
  });

  revalidateAdmin();
  return { ok: true, message: id ? "Denominación actualizada." : "Denominación creada." };
}

export async function deleteDenominationAction(id: string) {
  const admin = await requireAdmin();
  await prisma.denomination.delete({ where: { id } });
  await recordAudit({ actorId: admin.id, actorEmail: admin.email, action: "denomination.deleted", entity: "denomination", entityId: id });
  revalidateAdmin();
}

export async function saveCategoryAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const staff = await requireStaff();
  const id = optionalString(formData.get("id"));
  const name = String(formData.get("name") ?? "").trim();

  const parsed = categorySchema.safeParse({
    name,
    slug: slugify(String(formData.get("slug") ?? "") || name),
    description: optionalString(formData.get("description")),
    icon: String(formData.get("icon") ?? "Sparkles"),
    accent: String(formData.get("accent") ?? "blue"),
    position: Number(formData.get("position") ?? 0),
    active: formData.get("active") === "on",
  });

  if (!parsed.success) return { ok: false, message: firstError(parsed.error) };

  try {
    const category = id
      ? await prisma.category.update({ where: { id }, data: parsed.data })
      : await prisma.category.create({ data: parsed.data });

    await recordAudit({
      actorId: staff.id,
      actorEmail: staff.email,
      action: id ? "category.updated" : "category.created",
      entity: "category",
      entityId: category.id,
    });

    revalidateAdmin();
    return { ok: true, message: id ? "Categoría actualizada." : "Categoría creada." };
  } catch {
    return { ok: false, message: "No se pudo guardar la categoría. El nombre o slug ya existe." };
  }
}

export async function deleteCategoryAction(id: string) {
  const admin = await requireAdmin();
  const products = await prisma.product.count({ where: { categoryId: id } });
  if (products > 0) return;
  await prisma.category.delete({ where: { id } });
  await recordAudit({ actorId: admin.id, actorEmail: admin.email, action: "category.deleted", entity: "category", entityId: id });
  revalidateAdmin();
}

export async function saveCouponAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const staff = await requireStaff();
  const id = optionalString(formData.get("id"));

  const parsed = couponSchema.safeParse({
    code: String(formData.get("code") ?? "").toUpperCase(),
    type: String(formData.get("type") ?? "PERCENT"),
    value: Number(formData.get("value") ?? 0),
    startsAt: optionalString(formData.get("startsAt")),
    endsAt: optionalString(formData.get("endsAt")),
    maxUses: formData.get("maxUses") ? Number(formData.get("maxUses")) : null,
    minTotal: formData.get("minTotal") ? Number(formData.get("minTotal")) : null,
    productIds: String(formData.get("productIds") ?? ""),
    categoryIds: String(formData.get("categoryIds") ?? ""),
    active: formData.get("active") === "on",
  });

  if (!parsed.success) return { ok: false, message: firstError(parsed.error) };

  const data = {
    ...parsed.data,
    startsAt: parsed.data.startsAt ? new Date(parsed.data.startsAt) : null,
    endsAt: parsed.data.endsAt ? new Date(parsed.data.endsAt) : null,
  };

  try {
    const coupon = id ? await prisma.coupon.update({ where: { id }, data }) : await prisma.coupon.create({ data });

    await recordAudit({
      actorId: staff.id,
      actorEmail: staff.email,
      action: id ? "coupon.updated" : "coupon.created",
      entity: "coupon",
      entityId: coupon.id,
    });

    revalidateAdmin();
    return { ok: true, message: id ? "Cupón actualizado." : "Cupón creado." };
  } catch {
    return { ok: false, message: "El código de cupón ya existe." };
  }
}

export async function deleteCouponAction(id: string) {
  const admin = await requireAdmin();
  await prisma.coupon.delete({ where: { id } });
  await recordAudit({ actorId: admin.id, actorEmail: admin.email, action: "coupon.deleted", entity: "coupon", entityId: id });
  revalidateAdmin();
}

export async function saveSettingsAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const paymentMethods = formData.getAll("paymentMethods").map(String);
  const roundingRule = String(formData.get("roundingRule") ?? "END_49");

  await saveSettings({
    storeName: String(formData.get("storeName") ?? "FannyShop"),
    tagline: String(formData.get("tagline") ?? ""),
    logoUrl: String(formData.get("logoUrl") ?? ""),
    faviconUrl: String(formData.get("faviconUrl") ?? ""),
    supportEmail: String(formData.get("supportEmail") ?? ""),
    supportPhone: String(formData.get("supportPhone") ?? ""),
    currency: String(formData.get("currency") ?? "USD"),
    locale: String(formData.get("locale") ?? "es-SV"),
    taxRate: Number(formData.get("taxRate") ?? 13) / 100,
    marginRate: Number(formData.get("marginRate") ?? 10) / 100,
    commissionRate: Number(formData.get("commissionRate") ?? 0) / 100,
    roundingRule: isRoundingRule(roundingRule) ? roundingRule : "END_49",
    paymentMethods: paymentMethods.length ? paymentMethods : ["MANUAL_TRANSFER"],
    autoDelivery: formData.get("autoDelivery") === "on",
    termsContent: String(formData.get("termsContent") ?? ""),
    privacyContent: String(formData.get("privacyContent") ?? ""),
    refundContent: String(formData.get("refundContent") ?? ""),
    social: {
      facebook: String(formData.get("facebook") ?? ""),
      instagram: String(formData.get("instagram") ?? ""),
      twitter: String(formData.get("twitter") ?? ""),
      discord: String(formData.get("discord") ?? ""),
      whatsapp: String(formData.get("whatsapp") ?? ""),
    },
  });

  await recordAudit({ actorId: admin.id, actorEmail: admin.email, action: "settings.updated", entity: "settings" });
  revalidateAdmin();
  return { ok: true, message: "Configuración guardada correctamente." };
}

export async function savePricingAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const roundingRule = String(formData.get("roundingRule") ?? "END_49");

  await saveSettings({
    taxRate: Number(formData.get("taxRate") ?? 13) / 100,
    marginRate: Number(formData.get("marginRate") ?? 10) / 100,
    commissionRate: Number(formData.get("commissionRate") ?? 0) / 100,
    roundingRule: isRoundingRule(roundingRule) ? roundingRule : "END_49",
  });

  await recordAudit({ actorId: admin.id, actorEmail: admin.email, action: "pricing.updated", entity: "settings" });
  revalidateAdmin();
  return { ok: true, message: "Reglas de precios actualizadas." };
}

export async function importCodesAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const staff = await requireStaff();
  const denominationId = String(formData.get("denominationId") ?? "");
  const raw = String(formData.get("codes") ?? "");
  const batch = optionalString(formData.get("batch"));

  const denomination = await prisma.denomination.findUnique({ where: { id: denominationId } });
  if (!denomination) return { ok: false, message: "Selecciona una denominación válida." };

  const codes = raw
    .split(/[\r\n,;]+/)
    .map((code) => code.trim())
    .filter(Boolean);

  if (!codes.length) return { ok: false, message: "Agrega al menos un código." };

  const result = await addCodes({ productId: denomination.productId, denominationId, codes, batch });

  await recordAudit({
    actorId: staff.id,
    actorEmail: staff.email,
    action: "inventory.imported",
    entity: "denomination",
    entityId: denominationId,
    metadata: { inserted: result.inserted, duplicates: result.duplicates, batch: result.batch },
  });

  revalidateAdmin();
  return {
    ok: true,
    message: `${result.inserted} códigos agregados${result.duplicates ? `, ${result.duplicates} duplicados ignorados` : ""}.`,
  };
}

export async function deleteCodeAction(id: string) {
  const staff = await requireStaff();
  const code = await prisma.digitalCode.findUnique({ where: { id } });
  if (!code || code.status !== "AVAILABLE") return;
  await prisma.digitalCode.delete({ where: { id } });
  await recordAudit({ actorId: staff.id, actorEmail: staff.email, action: "inventory.deleted", entity: "digital_code", entityId: id });
  revalidateAdmin();
}

export async function orderStatusAction(orderId: string, status: OrderStatus) {
  const staff = await requireStaff();
  const actor = { id: staff.id, email: staff.email };

  if (status === "PAID") {
    await markOrderPaid(orderId, actor);
  } else if (status === "DELIVERED") {
    await deliverOrder(orderId, actor);
  } else {
    await updateOrderStatus(orderId, status, actor);
  }

  revalidateAdmin();
  revalidatePath(`/admin/ordenes/${orderId}`);
}

export async function assignCodeAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const staff = await requireStaff();
  const orderItemId = String(formData.get("orderItemId") ?? "");
  const codeId = String(formData.get("codeId") ?? "");

  const result = await assignCodeToItem(orderItemId, codeId, { id: staff.id, email: staff.email });
  revalidateAdmin();
  return { ok: result.ok, message: result.ok ? "Código asignado a la orden." : result.error };
}

export async function saveStaffAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const id = optionalString(formData.get("id"));
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const name = String(formData.get("name") ?? "").trim();
  const role = String(formData.get("role") ?? "STAFF") as Role;
  const password = String(formData.get("password") ?? "");

  if (name.length < 3) return { ok: false, message: "Ingresa un nombre válido." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return { ok: false, message: "Ingresa un correo válido." };
  if (!id && password.length < 8) return { ok: false, message: "La contraseña debe tener al menos 8 caracteres." };

  try {
    const user = id
      ? await prisma.user.update({
          where: { id },
          data: {
            name,
            email,
            role,
            ...(password.length >= 8 ? { passwordHash: await hashPassword(password) } : {}),
          },
        })
      : await prisma.user.create({ data: { name, email, role, passwordHash: await hashPassword(password) } });

    await recordAudit({
      actorId: admin.id,
      actorEmail: admin.email,
      action: id ? "staff.updated" : "staff.created",
      entity: "user",
      entityId: user.id,
      metadata: { role },
    });

    revalidateAdmin();
    return { ok: true, message: id ? "Usuario actualizado." : "Usuario creado." };
  } catch {
    return { ok: false, message: "Ya existe un usuario con ese correo." };
  }
}

export async function toggleUserStatusAction(id: string, status: "ACTIVE" | "BLOCKED") {
  const admin = await requireAdmin();
  if (admin.id === id) return;
  await prisma.user.update({ where: { id }, data: { status } });
  await recordAudit({
    actorId: admin.id,
    actorEmail: admin.email,
    action: "user.status",
    entity: "user",
    entityId: id,
    metadata: { status },
  });
  revalidateAdmin();
}
