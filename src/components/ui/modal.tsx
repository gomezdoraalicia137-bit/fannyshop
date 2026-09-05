"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  const widths = { sm: "max-w-md", md: "max-w-2xl", lg: "max-w-4xl" };

  return createPortal(
    <div className="fixed inset-0 z-[110] flex items-end justify-center overflow-y-auto bg-void/80 p-0 backdrop-blur-sm sm:items-center sm:p-6">
      <button type="button" aria-label="Cerrar" className="fixed inset-0 cursor-default" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "glass-strong relative z-10 my-auto max-h-[92dvh] w-full animate-rise overflow-y-auto rounded-t-3xl border shadow-2xl sm:rounded-2xl",
          widths[size],
        )}
      >
        <div className="glass-strong sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-line/60 p-5">
          <div className="space-y-1">
            <h2 className="font-display text-lg font-semibold text-white">{title}</h2>
            {description ? <p className="text-sm text-muted">{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="cursor-pointer rounded-lg p-1.5 text-muted transition-colors hover:bg-white/5 hover:text-white"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="p-5">{children}</div>
        {footer ? <div className="flex flex-wrap justify-end gap-3 border-t border-line/60 p-5">{footer}</div> : null}
      </div>
    </div>,
    document.body,
  );
}
