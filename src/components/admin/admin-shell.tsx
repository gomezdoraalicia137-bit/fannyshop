"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BarChart3,
  Boxes,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Percent,
  Receipt,
  Settings,
  ShieldCheck,
  Tags,
  Users,
  X,
} from "lucide-react";
import { Logo } from "@/components/shop/logo";
import { cn, initials } from "@/lib/utils";
import type { Role } from "@/lib/constants";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, roles: ["ADMIN", "STAFF"] },
  { href: "/admin/ordenes", label: "Órdenes", icon: Receipt, roles: ["ADMIN", "STAFF"] },
  { href: "/admin/productos", label: "Productos", icon: Package, roles: ["ADMIN", "STAFF"] },
  { href: "/admin/categorias", label: "Categorías", icon: Tags, roles: ["ADMIN", "STAFF"] },
  { href: "/admin/inventario", label: "Inventario", icon: Boxes, roles: ["ADMIN", "STAFF"] },
  { href: "/admin/clientes", label: "Clientes", icon: Users, roles: ["ADMIN", "STAFF"] },
  { href: "/admin/pagos", label: "Pagos", icon: CreditCard, roles: ["ADMIN"] },
  { href: "/admin/precios", label: "Precios", icon: Percent, roles: ["ADMIN"] },
  { href: "/admin/promociones", label: "Promociones", icon: Tags, roles: ["ADMIN"] },
  { href: "/admin/reportes", label: "Reportes", icon: BarChart3, roles: ["ADMIN"] },
  { href: "/admin/administradores", label: "Administradores", icon: ShieldCheck, roles: ["ADMIN"] },
  { href: "/admin/configuracion", label: "Configuración", icon: Settings, roles: ["ADMIN"] },
];

export function AdminShell({
  user,
  store,
  children,
}: {
  user: { name: string; email: string; role: Role };
  store: { name: string; logoUrl: string };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const visible = links.filter((link) => link.roles.includes(user.role));

  return (
    <div className="flex min-h-dvh bg-void">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-[105] flex w-72 flex-col border-r border-line/60 bg-abyss/95 backdrop-blur-xl transition-transform duration-300 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-line/60 px-5">
          <Logo storeName={store.name} src={store.logoUrl} />
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={() => setOpen(false)}
            className="cursor-pointer rounded-lg p-1.5 text-muted hover:text-white lg:hidden"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4" aria-label="Navegación administrativa">
          {visible.map((link) => {
            const active = link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all",
                  active
                    ? "border border-neon-violet/40 bg-gradient-to-r from-neon-blue/18 to-neon-violet/18 text-white"
                    : "text-muted hover:bg-white/5 hover:text-white",
                )}
              >
                <link.icon className={cn("size-4.5", active && "text-neon-cyan")} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-line/60 p-4">
          <div className="mb-3 flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-neon-blue to-neon-violet font-display text-xs font-bold text-white">
              {initials(user.name)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{user.name}</p>
              <p className="truncate text-xs text-muted">{user.role === "ADMIN" ? "Administrador" : "Empleado"}</p>
            </div>
          </div>
          <form action="/api/auth/logout" method="post">
            <button
              type="submit"
              className="flex w-full cursor-pointer items-center gap-2 rounded-xl border border-line/70 px-3.5 py-2.5 text-sm text-muted transition-colors hover:border-rose-500/40 hover:text-rose-300"
            >
              <LogOut className="size-4" /> Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      {open ? (
        <button
          type="button"
          aria-label="Cerrar menú lateral"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[104] cursor-default bg-void/70 backdrop-blur-sm lg:hidden"
        />
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col lg:pl-72">
        <header className="sticky top-0 z-[100] flex h-16 items-center gap-3 border-b border-line/60 bg-abyss/85 px-4 backdrop-blur-xl sm:px-6">
          <button
            type="button"
            aria-label="Abrir menú"
            onClick={() => setOpen(true)}
            className="grid size-10 cursor-pointer place-items-center rounded-xl text-white hover:bg-white/5 lg:hidden"
          >
            <Menu className="size-5" />
          </button>
          <p className="font-display text-sm font-semibold text-white">Panel administrativo</p>
          <Link href="/" className="ml-auto text-xs text-muted transition-colors hover:text-white">
            Ver tienda
          </Link>
        </header>

        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
