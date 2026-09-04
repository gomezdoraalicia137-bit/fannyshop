import { ImageResponse } from "next/og";
import { getSettings } from "@/lib/services/settings";

export const alt = "FannyShop | Tarjetas digitales, gaming y entretenimiento";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const settings = await getSettings();
  const match = settings.storeName.match(/^(.*?)(shop|store|market)$/i);
  const base = match ? match[1] : settings.storeName;
  const highlight = match ? match[2] : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #05060d 0%, #0d1022 45%, #1a1040 100%)",
          color: "#f2f5ff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 108,
              height: 108,
              borderRadius: 28,
              background: "linear-gradient(140deg, #22e3ff, #2b6bff 40%, #8b3dff 75%, #ff3ea5)",
              fontSize: 62,
              fontWeight: 700,
              color: "#05060d",
            }}
          >
            F
          </div>
          <div style={{ display: "flex", fontSize: 78, fontWeight: 700, letterSpacing: -1 }}>
            <span>{base}</span>
            <span style={{ color: "#22e3ff" }}>{highlight}</span>
          </div>
        </div>

        <div style={{ display: "flex", marginTop: 42, fontSize: 44, color: "#c7d2ff", maxWidth: 950 }}>
          {settings.tagline}
        </div>

        <div style={{ display: "flex", marginTop: 30, gap: 18, fontSize: 26, color: "#9aa3c7" }}>
          <span>Apple</span>
          <span>·</span>
          <span>Steam</span>
          <span>·</span>
          <span>PlayStation</span>
          <span>·</span>
          <span>Netflix</span>
          <span>·</span>
          <span>Binance</span>
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 56,
            padding: "16px 34px",
            borderRadius: 999,
            background: "linear-gradient(90deg, #2b6bff, #8b3dff)",
            fontSize: 28,
            fontWeight: 600,
          }}
        >
          Entrega digital inmediata
        </div>
      </div>
    ),
    size,
  );
}
