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
import { PantryItemSchema, type PantryItem, type DetectedItem } from "@/lib/types";
import { ingredientsMatch } from "@/lib/normalize";
import { id } from "@/lib/id";

const PantryArraySchema = z.array(PantryItemSchema);

type PantryContextValue = {
  items: PantryItem[];
  hydrated: boolean;
  add: (input: Omit<PantryItem, "id" | "updatedAt">) => PantryItem;
  upsertMany: (items: DetectedItem[]) => void;
  update: (id: string, patch: Partial<PantryItem>) => void;
  remove: (id: string) => PantryItem | null;
  adjustQuantity: (id: string, delta: number) => void;
  loadDemo: () => void;
  reset: () => void;
};

const PantryContext = createContext<PantryContextValue | null>(null);

const DEMO_ITEMS: Omit<PantryItem, "id" | "updatedAt">[] = [
  { name: "Tomato", quantity: 4, unit: "count", category: "Produce" },
  { name: "Onion", quantity: 2, unit: "count", category: "Produce" },
  { name: "Garlic", quantity: 1, unit: "head", category: "Produce" },
  { name: "Olive Oil", quantity: 1, unit: "bottle", category: "Pantry" },
  { name: "Pasta", quantity: 1, unit: "box", category: "Grains" },
  { name: "Eggs", quantity: 6, unit: "count", category: "Dairy" },
  { name: "Salt", quantity: 1, unit: "container", category: "Spices" },
  { name: "Black Pepper", quantity: 1, unit: "container", category: "Spices" },
  { name: "Rice", quantity: 1, unit: "bag", category: "Grains" },
  { name: "Cheddar Cheese", quantity: 1, unit: "block", category: "Dairy" },
  { name: "Butter", quantity: 1, unit: "stick", category: "Dairy" },
  { name: "Cilantro", quantity: 1, unit: "bunch", category: "Produce" },
  { name: "Lime", quantity: 3, unit: "count", category: "Produce" },
];

export function PantryProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<PantryItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const loaded = loadValue(STORAGE_KEYS.pantry, PantryArraySchema, []);
    setItems(loaded);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveValue(STORAGE_KEYS.pantry, items);
  }, [items, hydrated]);

  const add = useCallback((input: Omit<PantryItem, "id" | "updatedAt">) => {
    const item: PantryItem = {
      id: id("itm"),
      name: input.name.trim(),
      quantity: Math.max(0, input.quantity),
      unit: input.unit ?? "",
      category: input.category ?? "Other",
      updatedAt: Date.now(),
    };
    setItems((prev) => [item, ...prev]);
    return item;
  }, []);

  const upsertMany = useCallback((detected: DetectedItem[]) => {
    setItems((prev) => {
      const next = prev.slice();
      for (const d of detected) {
        const existingIdx = next.findIndex((p) => ingredientsMatch(p.name, d.name));
        if (existingIdx >= 0) {
          const existing = next[existingIdx];
          next[existingIdx] = {
            ...existing,
            quantity: existing.quantity + d.quantity,
            unit: existing.unit || d.unit,
            updatedAt: Date.now(),
          };
        } else {
          next.unshift({
            id: id("itm"),
            name: d.name,
            quantity: d.quantity,
            unit: d.unit,
            category: d.category,
            updatedAt: Date.now(),
          });
        }
      }
      return next;
    });
  }, []);

  const update = useCallback((itemId: string, patch: Partial<PantryItem>) => {
    setItems((prev) =>
      prev.map((p) => (p.id === itemId ? { ...p, ...patch, updatedAt: Date.now() } : p)),
    );
  }, []);

  const remove = useCallback(
    (itemId: string): PantryItem | null => {
      const found = items.find((p) => p.id === itemId);
      if (!found) return null;
      setItems((prev) => prev.filter((p) => p.id !== itemId));
      return found;
    },
    [items],
  );

  const adjustQuantity = useCallback((itemId: string, delta: number) => {
    setItems((prev) =>
      prev.map((p) =>
        p.id === itemId
          ? { ...p, quantity: Math.max(0, p.quantity + delta), updatedAt: Date.now() }
          : p,
      ),
    );
  }, []);

  const loadDemo = useCallback(() => {
    const now = Date.now();
    setItems(
      DEMO_ITEMS.map((d) => ({
        ...d,
        id: id("itm"),
        updatedAt: now,
      })),
    );
  }, []);

  const reset = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({ items, hydrated, add, upsertMany, update, remove, adjustQuantity, loadDemo, reset }),
    [items, hydrated, add, upsertMany, update, remove, adjustQuantity, loadDemo, reset],
  );

  return <PantryContext.Provider value={value}>{children}</PantryContext.Provider>;
}

export function usePantry() {
  const ctx = useContext(PantryContext);
  if (!ctx) throw new Error("usePantry must be inside PantryProvider");
  return ctx;
}
