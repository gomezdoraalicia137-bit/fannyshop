"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LogOut, Menu, Search, ShoppingCart, User, X } from "lucide-react";
import { Logo } from "@/components/shop/logo";
import { useCart } from "@/components/shop/cart-provider";
import { Button, LinkButton } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/constants";

const navigation = [
  { href: "/", label: "Inicio" },
  { href: "/tarjetas", label: "Tarjetas" },
  { href: "/categorias", label: "Categorías" },
  { href: "/ofertas", label: "Ofertas" },
  { href: "/faq", label: "Preguntas frecuentes" },
  { href: "/contacto", label: "Contacto" },
];

export function Header({
  user,
  store,
}: {
  user: { name: string; role: Role } | null;
  store: { name: string; logoUrl: string };
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { itemCount } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const value = query.trim();
    router.push(value ? `/tarjetas?q=${encodeURIComponent(value)}` : "/tarjetas");
    setSearchOpen(false);
  };

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-[100] transition-all duration-300",
        scrolled ? "glass-strong border-b shadow-[0_10px_40px_-24px_#000]" : "border-b border-transparent",
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Logo storeName={store.name} src={store.logoUrl} />

        <nav className="ml-4 hidden items-center gap-1 lg:flex" aria-label="Navegación principal">
          {navigation.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active ? "text-white" : "text-muted hover:text-white",
                )}
              >
                {item.label}
                {active ? (
                  <span className="absolute inset-x-3 -bottom-0.5 h-px bg-gradient-to-r from-neon-cyan via-neon-blue to-neon-violet" />
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            aria-label="Buscar productos"
            onClick={() => setSearchOpen((open) => !open)}
            className="grid size-10 cursor-pointer place-items-center rounded-xl text-muted transition-colors hover:bg-white/5 hover:text-white"
          >
            <Search className="size-5" />
          </button>

          <Link
            href="/carrito"
            aria-label="Ver carrito"
            className="relative grid size-10 place-items-center rounded-xl text-muted transition-colors hover:bg-white/5 hover:text-white"
          >
            <ShoppingCart className="size-5" />
            {itemCount > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 grid min-w-5 place-items-center rounded-full bg-gradient-to-r from-neon-magenta to-neon-violet px-1.5 text-[10px] font-bold text-white">
                {itemCount}
              </span>
            ) : null}
          </Link>

          {user ? (
            <div className="hidden items-center gap-1.5 sm:flex">
              <LinkButton
                href={user.role === "CUSTOMER" ? "/cuenta" : "/admin"}
                variant="secondary"
                size="sm"
                className="max-w-40"
              >
                <User className="size-4" />
                <span className="truncate">{user.name.split(" ")[0]}</span>
              </LinkButton>
              <form action="/api/auth/logout" method="post">
                <Button type="submit" variant="ghost" size="icon" aria-label="Cerrar sesión">
                  <LogOut className="size-4" />
                </Button>
              </form>
            </div>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <LinkButton href="/login" variant="ghost" size="sm">
                Iniciar sesión
              </LinkButton>
              <LinkButton href="/registro" size="sm">
                Crear cuenta
              </LinkButton>
            </div>
          )}

          <button
            type="button"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="grid size-10 cursor-pointer place-items-center rounded-xl text-white transition-colors hover:bg-white/5 lg:hidden"
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {searchOpen ? (
        <div className="glass-strong border-t border-line/50">
          <form onSubmit={submitSearch} className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
            <Search className="size-5 shrink-0 text-muted" />
            <input
              ref={searchRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Busca Apple, Steam, Netflix, Binance..."
              aria-label="Buscar productos"
              className="h-10 w-full bg-transparent text-sm text-white placeholder:text-muted/70 focus:outline-none"
            />
            <Button type="submit" size="sm">
              Buscar
            </Button>
          </form>
        </div>
      ) : null}

      <div
        className={cn(
          "glass-strong overflow-hidden border-t border-line/50 transition-[max-height,opacity] duration-300 lg:hidden",
          menuOpen ? "max-h-[32rem] opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <nav className="flex flex-col gap-1 px-4 py-4" aria-label="Navegación móvil">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-white/85 transition-colors hover:bg-white/5"
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-3 flex flex-col gap-2 border-t border-line/60 pt-4">
            {user ? (
              <>
                <LinkButton href={user.role === "CUSTOMER" ? "/cuenta" : "/admin"} variant="secondary" size="sm">
                  <User className="size-4" /> Mi cuenta
                </LinkButton>
                <form action="/api/auth/logout" method="post">
                  <Button type="submit" variant="outline" size="sm" className="w-full">
                    <LogOut className="size-4" /> Cerrar sesión
                  </Button>
                </form>
              </>
            ) : (
              <>
                <LinkButton href="/login" variant="secondary" size="sm">
                  Iniciar sesión
                </LinkButton>
                <LinkButton href="/registro" size="sm">
                  Crear cuenta
                </LinkButton>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
