import type { RoundingRule } from "./constants";

export function toCents(value: number): number {
  return Math.round(value * 100);
}

export function fromCents(value: number): number {
  return Math.round(value) / 100;
}

export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function applyRounding(value: number, rule: RoundingRule): number {
  const cents = toCents(value);
  const unit = 100;

  switch (rule) {
    case "NONE":
      return fromCents(cents);
    case "NEXT_UNIT":
      return fromCents(Math.ceil(cents / unit) * unit);
    case "END_00": {
      const target = Math.round(cents / unit) * unit;
      return fromCents(target);
    }
    case "END_49":
      return fromCents(nextEnding(cents, 49));
    case "END_99":
      return fromCents(nextEnding(cents, 99));
    default:
      return fromCents(cents);
  }
}

function nextEnding(cents: number, ending: number): number {
  const base = Math.floor(cents / 100) * 100;
  const candidate = base + ending;
  return candidate >= cents ? candidate : candidate + 100;
}

export function formatMoney(value: number, currency = "USD", locale = "es-SV"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);
}

export function formatPercent(rate: number): string {
  return `${round2(rate * 100)}%`;
}
