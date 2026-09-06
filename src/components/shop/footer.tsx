import Link from "next/link";
import { Camera, Globe, MessageCircle, Send } from "lucide-react";import { Logo } from "@/components/shop/logo";
import type { StoreSettings } from "@/lib/services/settings";
import type { CategoryView } from "@/types/catalog";

export function Footer({ settings, categories }: { settings: StoreSettings; categories: CategoryView[] }) {
  const social = [
    { href: settings.social.facebook, icon: Globe, label: "Facebook" },
    { href: settings.social.instagram, icon: Camera, label: "Instagram" },
    { href: settings.social.twitter, icon: Send, label: "X" },
    { href: settings.social.discord, icon: MessageCircle, label: "Discord" },
  ].filter((item) => item.href);

  return (
    <footer className="relative mt-24 border-t border-line/60 bg-abyss/60">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-neon-violet/60 to-transparent" />
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-5 lg:px-8">
        <div className="space-y-4 lg:col-span-2">
          <Logo storeName={settings.storeName} src={settings.logoUrl} />
          <p className="max-w-sm text-sm leading-relaxed text-muted">
            {settings.storeName} es la plataforma para comprar tarjetas digitales, gaming y entretenimiento con entrega
            inmediata y soporte real.
          </p>
          {social.length ? (
            <div className="flex gap-2 pt-1">
              {social.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={item.label}
                  className="grid size-9 place-items-center rounded-xl border border-line/70 text-muted transition-colors hover:border-neon-violet/50 hover:text-white"
                >
                  <item.icon className="size-4" />
                </a>
              ))}
            </div>
          ) : null}
        </div>

        <FooterColumn
          title="Tienda"
          links={[
            { href: "/tarjetas", label: "Todas las tarjetas" },
            { href: "/ofertas", label: "Ofertas" },
            { href: "/carrito", label: "Carrito" },
            { href: "/cuenta", label: "Mi cuenta" },
          ]}
        />

        <FooterColumn
          title="Categorías"
          links={categories.slice(0, 5).map((category) => ({
            href: `/categorias/${category.slug}`,
            label: category.name,
          }))}
        />

        <FooterColumn
          title="Soporte"
          links={[
            { href: "/faq", label: "Preguntas frecuentes" },
            { href: "/contacto", label: "Contacto" },
            { href: "/legal/terminos", label: "Términos y condiciones" },
            { href: "/legal/privacidad", label: "Política de privacidad" },
            { href: "/legal/reembolsos", label: "Política de reembolso" },
          ]}
        />
      </div>

      <div className="border-t border-line/60">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>
            © 2025 - {new Date().getFullYear()} {settings.storeName}. Todos los derechos reservados.
          </p>
          <p>
            {settings.supportEmail} · {settings.supportPhone}
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-white">{title}</h3>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-sm text-muted transition-colors hover:text-neon-cyan">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
