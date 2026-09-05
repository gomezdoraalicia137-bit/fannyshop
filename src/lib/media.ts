const MAX_SVG_LENGTH = 60_000;

function sanitizeSvg(markup: string): string | null {
  const cleaned = markup
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<foreignObject[\s\S]*?<\/foreignObject>/gi, "")
    .replace(/\son[a-z]+\s*=\s*"[^"]*"/gi, "")
    .replace(/\son[a-z]+\s*=\s*'[^']*'/gi, "")
    .replace(/javascript:/gi, "")
    .trim();

  if (!cleaned.toLowerCase().startsWith("<svg") || !cleaned.toLowerCase().includes("</svg>")) return null;
  if (cleaned.length > MAX_SVG_LENGTH) return null;
  return cleaned;
}

export function toImageSrc(value: string | null | undefined): string | null {
  const raw = value?.trim();
  if (!raw) return null;

  if (raw.toLowerCase().startsWith("<svg")) {
    const svg = sanitizeSvg(raw);
    if (!svg) return null;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  if (/^data:image\/(png|jpe?g|gif|webp|avif);base64,[a-z0-9+/=]+$/i.test(raw)) return raw;

  if (/^data:image\/svg\+xml/i.test(raw)) return raw;

  if (/^https?:\/\//i.test(raw)) {
    try {
      const url = new URL(raw);
      return url.protocol === "https:" || url.protocol === "http:" ? raw : null;
    } catch {
      return null;
    }
  }

  if (raw.startsWith("/")) return raw;

  return null;
}

export function isValidImageValue(value: string | null | undefined): boolean {
  if (!value?.trim()) return true;
  return toImageSrc(value) !== null;
}
