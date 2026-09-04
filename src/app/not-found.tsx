import { LinkButton } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70dvh] w-full max-w-2xl flex-col items-center justify-center gap-6 px-4 text-center">
      <p className="font-display text-7xl font-bold neon-text">404</p>
      <h1 className="font-display text-2xl font-semibold text-white">No encontramos esta página</h1>
      <p className="text-sm text-muted">
        Puede que el producto haya sido retirado o que la dirección sea incorrecta.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <LinkButton href="/">Ir al inicio</LinkButton>
        <LinkButton href="/tarjetas" variant="secondary">
          Ver catálogo
        </LinkButton>
      </div>
    </div>
  );
}
