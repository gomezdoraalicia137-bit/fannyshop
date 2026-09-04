import { cn } from "@/lib/utils";

export function AuroraBackground({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none fixed inset-0 -z-10 overflow-hidden", className)}>
      <div className="absolute inset-0 grid-lines opacity-40" />
      <div className="absolute -left-40 top-[-12rem] size-[36rem] rounded-full bg-neon-violet/22 blur-[140px] animate-drift" />
      <div className="absolute -right-32 top-24 size-[30rem] rounded-full bg-neon-blue/22 blur-[130px] animate-drift [animation-delay:-6s]" />
      <div className="absolute bottom-[-14rem] left-1/3 size-[34rem] rounded-full bg-neon-cyan/14 blur-[150px] animate-drift [animation-delay:-12s]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-neon-cyan/50 to-transparent" />
    </div>
  );
}

export function ParticleField({ count = 26 }: { count?: number }) {
  const particles = Array.from({ length: count }, (_, index) => {
    const seed = (index * 9301 + 49297) % 233280;
    const random = seed / 233280;
    return {
      left: `${(random * 100).toFixed(2)}%`,
      top: `${((index * 37) % 100).toFixed(2)}%`,
      size: 1 + ((index % 4) * 0.9),
      delay: `${(index % 9) * 0.7}s`,
      duration: `${7 + (index % 6)}s`,
      opacity: 0.25 + (index % 5) * 0.12,
    };
  });

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((particle, index) => (
        <span
          key={index}
          className="absolute rounded-full bg-neon-cyan animate-float"
          style={{
            left: particle.left,
            top: particle.top,
            width: particle.size,
            height: particle.size,
            opacity: particle.opacity,
            animationDelay: particle.delay,
            animationDuration: particle.duration,
          }}
        />
      ))}
    </div>
  );
}

export function GlowOrb({
  className,
  color = "violet",
}: {
  className?: string;
  color?: "violet" | "blue" | "cyan" | "magenta";
}) {
  const colors = {
    violet: "bg-neon-violet/30",
    blue: "bg-neon-blue/30",
    cyan: "bg-neon-cyan/25",
    magenta: "bg-neon-magenta/25",
  };
  return <div aria-hidden className={cn("absolute rounded-full blur-[110px] animate-pulse-glow", colors[color], className)} />;
}
