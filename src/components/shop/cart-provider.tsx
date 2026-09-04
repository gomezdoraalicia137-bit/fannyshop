"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { CartLine, CartSummary } from "@/types/catalog";

const STORAGE_KEY = "fannyshop-cart";
const COUPON_KEY = "fannyshop-coupon";

type CartContextValue = {
  lines: CartLine[];
  summary: CartSummary | null;
  loading: boolean;
  itemCount: number;
  couponInput: string;
  add: (line: CartLine) => void;
  setQuantity: (productId: string, denominationId: string, quantity: number) => void;
  remove: (productId: string, denominationId: string) => void;
  clear: () => void;
  applyCoupon: (code: string) => void;
  removeCoupon: () => void;
  refresh: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [summary, setSummary] = useState<CartSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const hydrated = useRef(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      const coupon = window.localStorage.getItem(COUPON_KEY);
      if (stored) setLines(JSON.parse(stored) as CartLine[]);
      if (coupon) setCouponInput(coupon);
    } catch {
      setLines([]);
    }
    hydrated.current = true;
  }, []);

  const fetchSummary = useCallback(async (currentLines: CartLine[], coupon: string) => {
    if (!currentLines.length) {
      setSummary(null);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/cart/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lines: currentLines, couponCode: coupon || null }),
      });
      if (!response.ok) throw new Error("summary");
      const data = (await response.json()) as CartSummary;
      setSummary(data);
      setLines((current) => reconcile(current, data));
    } catch {
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    void fetchSummary(lines, couponInput);
  }, [lines, couponInput, fetchSummary]);

  const add = useCallback((line: CartLine) => {
    setLines((current) => {
      const index = current.findIndex(
        (item) => item.productId === line.productId && item.denominationId === line.denominationId,
      );
      if (index === -1) return [...current, { ...line, quantity: Math.max(1, line.quantity) }];
      const next = [...current];
      next[index] = { ...next[index], quantity: Math.min(next[index].quantity + line.quantity, 25) };
      return next;
    });
  }, []);

  const setQuantity = useCallback((productId: string, denominationId: string, quantity: number) => {
    setLines((current) =>
      current
        .map((item) =>
          item.productId === productId && item.denominationId === denominationId
            ? { ...item, quantity: Math.max(0, Math.min(quantity, 25)) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }, []);

  const remove = useCallback((productId: string, denominationId: string) => {
    setLines((current) =>
      current.filter((item) => !(item.productId === productId && item.denominationId === denominationId)),
    );
  }, []);

  const clear = useCallback(() => {
    setLines([]);
    setSummary(null);
    setCouponInput("");
    window.localStorage.removeItem(COUPON_KEY);
  }, []);

  const applyCoupon = useCallback((code: string) => {
    const value = code.trim().toUpperCase();
    setCouponInput(value);
    window.localStorage.setItem(COUPON_KEY, value);
  }, []);

  const removeCoupon = useCallback(() => {
    setCouponInput("");
    window.localStorage.removeItem(COUPON_KEY);
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      summary,
      loading,
      itemCount: summary?.itemCount ?? lines.reduce((total, line) => total + line.quantity, 0),
      couponInput,
      add,
      setQuantity,
      remove,
      clear,
      applyCoupon,
      removeCoupon,
      refresh: () => fetchSummary(lines, couponInput),
    }),
    [lines, summary, loading, couponInput, add, setQuantity, remove, clear, applyCoupon, removeCoupon, fetchSummary],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

function reconcile(current: CartLine[], summary: CartSummary): CartLine[] {
  const next = summary.lines.map((line) => ({
    productId: line.productId,
    denominationId: line.denominationId,
    quantity: line.quantity,
  }));
  const same =
    current.length === next.length &&
    current.every((line, index) => {
      const candidate = next[index];
      return (
        candidate &&
        candidate.productId === line.productId &&
        candidate.denominationId === line.denominationId &&
        candidate.quantity === line.quantity
      );
    });
  return same ? current : next;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart debe usarse dentro de CartProvider");
  return context;
}
