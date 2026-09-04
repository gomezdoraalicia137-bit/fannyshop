import * as Icons from "lucide-react";
import { cn } from "@/lib/utils";
import { accentClasses } from "@/lib/utils";

export function CategoryIcon({ name, className }: { name: string; className?: string }) {
  const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[name] ?? Icons.Sparkles;
  return <Icon className={className} />;
}

export function BrandTile({
  name,
  accent,
  icon,
  size = "md",
}: {
  name: string;
  accent: string;
  icon: string;
  size?: "sm" | "md" | "lg";
}) {
  const styles = accentClasses(accent);
  const heights = { sm: "h-20", md: "h-32", lg: "h-52" };
  const iconSize = { sm: "size-6", md: "size-9", lg: "size-14" };

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
      <div className="relative flex flex-col items-center gap-2 px-3 text-center">
        <CategoryIcon name={icon} className={cn(iconSize[size], styles.text)} />
        <span className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-white/90">{name}</span>
      </div>
    </div>
  );
}
