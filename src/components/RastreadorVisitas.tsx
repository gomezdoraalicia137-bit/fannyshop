"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function RastreadorVisitas() {
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/visitas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ruta: pathname }),
    }).catch(console.error);
  }, [pathname]);

  return null; 
}
