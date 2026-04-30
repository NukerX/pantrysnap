"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { EmptyState } from "@/components/EmptyState";
import { PantryItemCard } from "@/components/PantryItemCard";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/Button";
import { Chip } from "@/components/Chip";
import { useToast } from "@/components/Toast";
import { usePantry } from "@/contexts/PantryContext";
import { CATEGORIES, type PantryItem } from "@/lib/types";

export default function PantryPage() {
  const { items, hydrated, add, update, remove, adjustQuantity } = usePantry();
  const { show } = useToast();
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const editing: PantryItem | null = useMemo(
    () => items.find((i) => i.id === editingId) ?? null,
    [items, editingId],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((i) => {
      if (filterCategory !== "All" && i.category !== filterCategory) return false;
      if (q && !i.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [items, search, filterCategory]);

  const visibleCategories = useMemo(() => {
    const set = new Set(items.map((i) => i.category));
    return ["All", ...Array.from(set)];
  }, [items]);

  if (!hydrated) return null;

  return (
    <>
      <AppHeader
        title="Pantry"
        right={
          <button
            type="button"
            onClick={() => setAdding(true)}
            aria-label="Add item"
            className="w-9 h-9 rounded-full flex items-center justify-center text-white bg-brand-600 hover:bg-brand-700 transition"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        }
      />
      <main className="px-4 py-4">
        {items.length === 0 ? (
          <EmptyState
            title="Your pantry is empty"
            message="Snap a photo of your shelves or add items manually to get started."
            mood="thinking"
            cta={
              <div className="flex gap-3">
                <Link href="/scan">
                  <Button>Scan a photo</Button>
                </Link>
                <Button variant="secondary" onClick={() => setAdding(true)}>
                  Add manually
                </Button>
              </div>
            }
          />
        ) : (
          <>
            <div className="relative mb-3">
              <svg viewBox="0 0 24 24" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="search"
                placeholder="Search pantry…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-700 text-ink-900 dark:text-ink-50 placeholder-ink-400 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 mb-3">
              {visibleCategories.map((c) => (
                <Chip
                  key={c}
                  label={c}
                  size="sm"
                  active={filterCategory === c}
                  onClick={() => setFilterCategory(c)}
                />
              ))}
            </div>

            {filtered.length === 0 ? (
              <p className="text-center text-ink-500 dark:text-ink-400 py-12 text-sm">
                No items match your filters.
              </p>
            ) : (
              <ul className="flex flex-col gap-2.5">
                {filtered.map((item) => (
                  <li key={item.id}>
                    <PantryItemCard
                      item={item}
                      onIncrement={() => adjustQuantity(item.id, 1)}
                      onDecrement={() => adjustQuantity(item.id, -1)}
                      onEdit={() => setEditingId(item.id)}
                      onDelete={() => {
                        const removed = remove(item.id);
                        if (removed) {
                          show(`Removed "${removed.name}"`, {
                            action: {
                              label: "Undo",
                              onClick: () => {
                                add({
                                  name: removed.name,
                                  quantity: removed.quantity,
                                  unit: removed.unit,
                                  category: removed.category,
                                });
                              },
                            },
                          });
                        }
                      }}
                    />
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </main>

      <ItemFormModal
        open={adding}
        onClose={() => setAdding(false)}
        onSubmit={(input) => {
          add(input);
          show(`Added "${input.name}"`);
          setAdding(false);
        }}
      />
      <ItemFormModal
        open={!!editing}
        onClose={() => setEditingId(null)}
        item={editing ?? undefined}
        onSubmit={(input) => {
          if (editing) update(editing.id, input);
          setEditingId(null);
        }}
      />
    </>
  );
}

function ItemFormModal({
  open,
  onClose,
  item,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  item?: PantryItem;
  onSubmit: (input: { name: string; quantity: number; unit: string; category: string }) => void;
}) {
  const [name, setName] = useState(item?.name ?? "");
  const [quantity, setQuantity] = useState(item?.quantity ?? 1);
  const [unit, setUnit] = useState(item?.unit ?? "count");
  const [category, setCategory] = useState(item?.category ?? "Other");

  // Reset when item changes / modal opens
  useMemo(() => {
    setName(item?.name ?? "");
    setQuantity(item?.quantity ?? 1);
    setUnit(item?.unit ?? "count");
    setCategory(item?.category ?? "Other");
  }, [item, open]);

  const submit = () => {
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), quantity, unit, category });
  };

  return (
    <Modal open={open} onClose={onClose} title={item ? "Edit item" : "Add item"}>
      <div className="flex flex-col gap-3">
        <label className="block">
          <span className="text-xs font-semibold text-ink-600 dark:text-ink-400">Name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Tomato"
            className="mt-1 w-full px-3 py-2.5 rounded-xl bg-ink-50 dark:bg-ink-800 border border-ink-200 dark:border-ink-700 text-ink-900 dark:text-ink-50 focus:outline-none focus:border-brand-500"
            autoFocus
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs font-semibold text-ink-600 dark:text-ink-400">Quantity</span>
            <input
              type="number"
              value={quantity}
              min={0}
              step={1}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="mt-1 w-full px-3 py-2.5 rounded-xl bg-ink-50 dark:bg-ink-800 border border-ink-200 dark:border-ink-700 text-ink-900 dark:text-ink-50 focus:outline-none focus:border-brand-500"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-ink-600 dark:text-ink-400">Unit</span>
            <input
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="cup, can, count"
              className="mt-1 w-full px-3 py-2.5 rounded-xl bg-ink-50 dark:bg-ink-800 border border-ink-200 dark:border-ink-700 text-ink-900 dark:text-ink-50 focus:outline-none focus:border-brand-500"
            />
          </label>
        </div>
        <label className="block">
          <span className="text-xs font-semibold text-ink-600 dark:text-ink-400">Category</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 w-full px-3 py-2.5 rounded-xl bg-ink-50 dark:bg-ink-800 border border-ink-200 dark:border-ink-700 text-ink-900 dark:text-ink-50 focus:outline-none focus:border-brand-500"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <div className="flex gap-2 mt-2">
          <Button variant="secondary" fullWidth onClick={onClose}>
            Cancel
          </Button>
          <Button fullWidth onClick={submit} disabled={!name.trim()}>
            {item ? "Save" : "Add"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
