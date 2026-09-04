"use client";

import { useState } from "react";
import { Copy, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export function CodeReveal({ code }: { code: string }) {
  const toast = useToast();
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex items-center gap-2 rounded-xl border border-line/70 bg-abyss/70 px-3 py-2.5">
      <code className="flex-1 truncate font-mono text-sm tracking-wider text-neon-cyan">
        {visible ? code : "•••• •••• •••• ••••"}
      </code>
      <button
        type="button"
        onClick={() => setVisible((value) => !value)}
        aria-label={visible ? "Ocultar código" : "Mostrar código"}
        className="cursor-pointer rounded-lg p-1.5 text-muted transition-colors hover:bg-white/5 hover:text-white"
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
      <button
        type="button"
        aria-label="Copiar código"
        onClick={async () => {
          await navigator.clipboard.writeText(code);
          toast.success("Código copiado.");
        }}
        className="cursor-pointer rounded-lg p-1.5 text-muted transition-colors hover:bg-white/5 hover:text-white"
      >
        <Copy className="size-4" />
      </button>
    </div>
  );
}
