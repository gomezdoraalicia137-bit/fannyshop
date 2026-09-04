import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  compact = false,
  src,
  storeName = "FannyShop",
}: {
  className?: string;
  compact?: boolean;
  src?: string;
  storeName?: string;
}) {
  const match = storeName.match(/^(.*?)(shop|store|market)$/i);
  const base = match ? match[1] : storeName;
  const highlight = match ? match[2] : "";

  return (
    <Link
      href="/"
      className={cn("group inline-flex items-center gap-2.5", className)}
      aria-label={`${storeName} inicio`}
    >
      <span className="relative grid size-9 shrink-0 place-items-center transition-transform duration-300 group-hover:scale-105">
        <span className="absolute inset-1 rounded-xl bg-neon-violet/30 opacity-70 blur-md transition-opacity duration-300 group-hover:opacity-100" />
        <Image
          src={src || "/logo-mark.svg"}
          alt=""
          width={36}
          height={36}
          priority
          unoptimized
          className="relative size-9"
        />
      </span>
      {!compact ? (
        <span className="font-display text-base font-semibold tracking-tight text-white">
          {base}
          {highlight ? <span className="neon-text">{highlight}</span> : null}
        </span>
      ) : null}
    </Link>
  );
}
