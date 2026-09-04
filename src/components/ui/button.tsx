import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger" | "success";
type Size = "sm" | "md" | "lg" | "icon";

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-neon-blue via-neon-violet to-neon-magenta text-white shadow-[0_10px_40px_-14px_var(--color-neon-violet)] hover:brightness-115 hover:shadow-[0_16px_50px_-14px_var(--color-neon-violet)]",
  secondary:
    "glass-strong text-white hover:border-neon-cyan/45 hover:text-neon-cyan",
  ghost: "text-muted hover:text-white hover:bg-white/5",
  outline:
    "border border-line/80 bg-transparent text-white/85 hover:border-neon-blue/60 hover:text-white",
  danger:
    "bg-gradient-to-r from-rose-500 to-neon-magenta text-white hover:brightness-110",
  success:
    "bg-gradient-to-r from-neon-emerald to-neon-cyan text-void font-semibold hover:brightness-110",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-xs",
  md: "h-11 px-5 text-sm",
  lg: "h-13 px-7 text-base",
  icon: "h-10 w-10",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-medium tracking-tight transition-all duration-200 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-45 cursor-pointer";

type ButtonProps = ComponentProps<"button"> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
};

export function Button({ className, variant = "primary", size = "md", loading, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={props.disabled || loading}
      {...props}
    >
      {loading ? <Spinner /> : null}
      {children}
    </button>
  );
}

type LinkButtonProps = ComponentProps<typeof Link> & {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
};

export function LinkButton({ className, variant = "primary", size = "md", children, ...props }: LinkButtonProps) {
  return (
    <Link className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </Link>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "size-4 shrink-0 animate-spin rounded-full border-2 border-white/25 border-t-white",
        className,
      )}
    />
  );
}
