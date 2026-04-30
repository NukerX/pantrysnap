"use client";

import { type PantryItem } from "@/lib/types";

export function PantryItemCard({
  item,
  onIncrement,
  onDecrement,
  onEdit,
  onDelete,
}: {
  item: PantryItem;
  onIncrement: () => void;
  onDecrement: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="bg-white dark:bg-ink-900 rounded-2xl shadow-card p-4 flex items-center gap-3">
      <div className="w-11 h-11 rounded-xl bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 flex items-center justify-center font-bold text-sm">
        {item.name.slice(0, 2).toUpperCase()}
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="flex-1 min-w-0 text-left"
      >
        <div className="font-semibold text-ink-900 dark:text-ink-50 truncate">{item.name}</div>
        <div className="text-xs text-ink-500 dark:text-ink-400">
          {item.quantity}
          {item.unit ? ` ${item.unit}` : ""} • {item.category}
        </div>
      </button>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={onDecrement}
          aria-label="Decrement quantity"
          className="w-9 h-9 rounded-full bg-ink-100 dark:bg-ink-800 text-ink-700 dark:text-ink-200 hover:bg-ink-200 dark:hover:bg-ink-700 font-bold transition"
        >
          −
        </button>
        <span className="w-7 text-center font-bold text-ink-900 dark:text-ink-50 tabular-nums">
          {item.quantity}
        </span>
        <button
          type="button"
          onClick={onIncrement}
          aria-label="Increment quantity"
          className="w-9 h-9 rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 hover:bg-brand-200 dark:hover:bg-brand-900/60 font-bold transition"
        >
          +
        </button>
        <button
          type="button"
          onClick={onDelete}
          aria-label="Delete item"
          className="w-9 h-9 rounded-full text-ink-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition flex items-center justify-center"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
