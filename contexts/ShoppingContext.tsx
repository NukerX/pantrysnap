"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { z } from "zod";
import { loadValue, saveValue, STORAGE_KEYS } from "@/lib/storage";
import { ShoppingItemSchema, type ShoppingItem } from "@/lib/types";
import { id } from "@/lib/id";

const ShoppingArraySchema = z.array(ShoppingItemSchema);

type ShoppingContextValue = {
  items: ShoppingItem[];
  hydrated: boolean;
  add: (name: string, quantity?: number, unit?: string) => void;
  addMany: (items: Array<{ name: string; quantity?: number; unit?: string }>) => void;
  toggle: (id: string) => void;
  remove: (id: string) => void;
  clearChecked: () => void;
  reset: () => void;
};

const ShoppingContext = createContext<ShoppingContextValue | null>(null);

export function ShoppingProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const loaded = loadValue(STORAGE_KEYS.shopping, ShoppingArraySchema, []);
    setItems(loaded);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveValue(STORAGE_KEYS.shopping, items);
  }, [items, hydrated]);

  const add = useCallback((name: string, quantity = 1, unit = "") => {
    setItems((prev) => {
      // de-dupe by name
      const exists = prev.some((p) => p.name.trim().toLowerCase() === name.trim().toLowerCase());
      if (exists) return prev;
      return [
        { id: id("shp"), name: name.trim(), quantity, unit, checked: false },
        ...prev,
      ];
    });
  }, []);

  const addMany = useCallback(
    (incoming: Array<{ name: string; quantity?: number; unit?: string }>) => {
      setItems((prev) => {
        const next = prev.slice();
        for (const item of incoming) {
          const exists = next.some(
            (p) => p.name.trim().toLowerCase() === item.name.trim().toLowerCase(),
          );
          if (!exists) {
            next.unshift({
              id: id("shp"),
              name: item.name.trim(),
              quantity: item.quantity ?? 1,
              unit: item.unit ?? "",
              checked: false,
            });
          }
        }
        return next;
      });
    },
    [],
  );

  const toggle = useCallback((itemId: string) => {
    setItems((prev) => prev.map((p) => (p.id === itemId ? { ...p, checked: !p.checked } : p)));
  }, []);

  const remove = useCallback((itemId: string) => {
    setItems((prev) => prev.filter((p) => p.id !== itemId));
  }, []);

  const clearChecked = useCallback(() => {
    setItems((prev) => prev.filter((p) => !p.checked));
  }, []);

  const reset = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({ items, hydrated, add, addMany, toggle, remove, clearChecked, reset }),
    [items, hydrated, add, addMany, toggle, remove, clearChecked, reset],
  );

  return <ShoppingContext.Provider value={value}>{children}</ShoppingContext.Provider>;
}

export function useShopping() {
  const ctx = useContext(ShoppingContext);
  if (!ctx) throw new Error("useShopping must be inside ShoppingProvider");
  return ctx;
}
