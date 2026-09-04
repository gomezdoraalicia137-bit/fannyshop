import { ArrowRight, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { LinkButton } from "@/components/ui/button";
import { GlowOrb, ParticleField } from "@/components/effects/background";
import { formatMoney } from "@/lib/money";

export function Hero({
  stats,
  currency,
}: {
  stats: { products: number; categories: number; delivered: number; fromPrice: number };
  currency: string;
}) {
  return (
    <section className="relative overflow-hidden">
      <ParticleField />
      <GlowOrb className="-left-24 top-10 size-96" color="violet" />
      <GlowOrb className="-right-20 top-32 size-80" color="blue" />

      <div className="mx-auto grid w-full max-w-7xl items-center gap-14 px-4 py-20 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-28">
        <div className="space-y-8 animate-rise">
          <span className="inline-flex items-center gap-2 rounded-full border border-neon-cyan/35 bg-neon-cyan/8 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-neon-cyan">
            <Sparkles className="size-3.5" /> Entrega digital inmediata
          </span>

          <h1 className="font-display text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
            Tu <span className="neon-text">mundo digital</span>,<br className="hidden sm:block" /> en un solo lugar.
          </h1>

          <p className="max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            Tarjetas digitales, gaming, entretenimiento y mucho más. Compra de forma rápida, segura y sencilla.
          </p>

          <div className="flex flex-wrap gap-3">
            <LinkButton href="/tarjetas" size="lg">
              Explorar tarjetas <ArrowRight className="size-4" />
            </LinkButton>
            <LinkButton href="/ofertas" variant="secondary" size="lg">
              Ver ofertas
            </LinkButton>
          </div>

          <dl className="grid max-w-lg grid-cols-2 gap-4 pt-4 sm:grid-cols-4">
            <HeroStat label="Productos" value={`${stats.products}+`} />
            <HeroStat label="Categorías" value={`${stats.categories}`} />
            <HeroStat label="Códigos" value={`${stats.delivered}+`} />
            <HeroStat label="Desde" value={formatMoney(stats.fromPrice, currency)} />
          </dl>
        </div>

        <div className="relative animate-rise [animation-delay:120ms]">
          <div className="relative mx-auto aspect-square w-full max-w-md">
            <div className="absolute inset-0 rounded-[2.5rem] border border-line/70 grid-lines opacity-60" />
            <div className="absolute inset-8 rounded-[2rem] border border-neon-violet/25 animate-spin-slow" />

            <FloatingCard className="left-0 top-6 rotate-[-8deg]" title="Steam Wallet" subtitle="$50 · Global" tone="violet" delay="0s" />
            <FloatingCard className="right-0 top-28 rotate-[7deg]" title="Apple Gift Card" subtitle="$100 · USA" tone="blue" delay="-2.4s" />
            <FloatingCard className="bottom-16 left-8 rotate-[4deg]" title="Binance" subtitle="$25 · USDT" tone="cyan" delay="-4.8s" />
            <FloatingCard className="bottom-0 right-10 rotate-[-5deg]" title="Netflix" subtitle="$30 · LATAM" tone="magenta" delay="-1.2s" />
          </div>

          <div className="glass mx-auto mt-6 flex max-w-md items-center justify-between gap-3 rounded-2xl px-5 py-4">
            <Feature icon={<Zap className="size-4 text-neon-cyan" />} label="Entrega en segundos" />
            <span className="h-8 w-px bg-line/70" />
            <Feature icon={<ShieldCheck className="size-4 text-neon-emerald" />} label="Pago protegido" />
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <dt className="text-[11px] uppercase tracking-[0.16em] text-muted">{label}</dt>
      <dd className="font-display text-xl font-semibold text-white">{value}</dd>
    </div>
  );
}

function Feature({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs font-medium text-white/85">
      {icon}
      {label}
    </div>
  );
}

function FloatingCard({
  className,
  title,
  subtitle,
  tone,
  delay,
}: {
  className: string;
  title: string;
  subtitle: string;
  tone: "violet" | "blue" | "cyan" | "magenta";
  delay: string;
}) {
  const tones = {
    violet: "from-neon-violet/35 to-neon-blue/10 shadow-[0_20px_60px_-30px_var(--color-neon-violet)]",
    blue: "from-neon-blue/35 to-neon-cyan/10 shadow-[0_20px_60px_-30px_var(--color-neon-blue)]",
    cyan: "from-neon-cyan/30 to-neon-blue/10 shadow-[0_20px_60px_-30px_var(--color-neon-cyan)]",
    magenta: "from-neon-magenta/30 to-neon-violet/10 shadow-[0_20px_60px_-30px_var(--color-neon-magenta)]",
  };

  return (
    <div
      className={`absolute w-44 animate-float rounded-2xl border border-white/10 bg-gradient-to-br ${tones[tone]} p-4 backdrop-blur-xl ${className}`}
      style={{ animationDelay: delay }}
    >
      <div className="mb-6 h-1.5 w-10 rounded-full bg-white/40" />
      <p className="font-display text-sm font-semibold text-white">{title}</p>
      <p className="text-[11px] text-white/70">{subtitle}</p>
    </div>
  );
}
