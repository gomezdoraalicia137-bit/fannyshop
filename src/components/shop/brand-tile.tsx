import * as Icons from "lucide-react";
import { cn } from "@/lib/utils";
import { accentClasses } from "@/lib/utils";
import { toImageSrc } from "@/lib/media";

export function CategoryIcon({ name, className }: { name: string; className?: string }) {
  const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[name] ?? Icons.Sparkles;
  return <Icon className={className} />;
}

export function BrandTile({
  name,
  accent,
  icon,
  logo,
  size = "md",
}: {
  name: string;
  accent: string;
  icon: string;
  logo?: string | null;
  size?: "sm" | "md" | "lg";
}) {
  const styles = accentClasses(accent);
  const heights = { sm: "h-24", md: "h-36", lg: "h-56" };
  const iconSize = { sm: "size-6", md: "size-9", lg: "size-14" };
  const padding = { sm: "p-2.5", md: "p-4", lg: "p-6" };
  const src = toImageSrc(logo);

  return (
    <div
      className={cn(
        "relative grid place-items-center overflow-hidden rounded-xl border border-line/70 bg-gradient-to-br",
        styles.bg,
        heights[size],
      )}
    >
      <div className="absolute inset-0 grid-lines opacity-25" />
      <div className={cn("absolute -right-6 -top-8 size-24 rounded-full blur-2xl", styles.glow)} />

      {src ? (
        <img
          src={src}
          alt={name}
          loading="lazy"
          decoding="async"
          className={cn("relative size-full object-contain drop-shadow-lg", padding[size])}
        />
      ) : (
        <div className="relative flex flex-col items-center gap-2 px-3 text-center">
          <CategoryIcon name={icon} className={cn(iconSize[size], styles.text)} />
          <span className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-white/90">{name}</span>
        </div>
      )}
    </div>
  );
}

export function BrandThumb({
  name,
  accent,
  logo,
  fallback,
  className,
}: {
  name: string;
  accent: string;
  logo?: string | null;
  fallback: string;
  className?: string;
}) {
  const styles = accentClasses(accent);
  const src = toImageSrc(logo);

  return (
    <div
      className={cn(
        "grid size-14 shrink-0 place-items-center overflow-hidden rounded-xl border border-line/70 bg-gradient-to-br",
        styles.bg,
        className,
      )}
    >
      {src ? (
        <img src={src} alt={name} loading="lazy" decoding="async" className="size-full object-contain p-1" />
      ) : (
        <span className="font-display text-sm font-bold text-white">{fallback}</span>
      )}
    </div>
  );
}
