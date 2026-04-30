"use client";

import { useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/Button";
import { useShopping } from "@/contexts/ShoppingContext";

export default function ShoppingListPage() {
  const { items, hydrated, add, toggle, remove, clearChecked } = useShopping();
  const [name, setName] = useState("");

  if (!hydrated) return null;

  const checkedCount = items.filter((i) => i.checked).length;
  const remaining = items.filter((i) => !i.checked);
  const checked = items.filter((i) => i.checked);

  return (
    <>
      <AppHeader
        title="Shopping list"
        right={
          checkedCount > 0 ? (
            <button
              type="button"
              onClick={clearChecked}
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 px-2 py-1"
            >
              Clear checked
            </button>
          ) : null
        }
      />
      <main className="px-4 py-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return;
            add(name.trim());
            setName("");
          }}
          className="flex gap-2 mb-4"
        >
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Add item…"
            className="flex-1 px-4 py-2.5 rounded-2xl bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-700 text-ink-900 dark:text-ink-50 placeholder-ink-400 focus:outline-none focus:border-brand-500"
          />
          <Button type="submit" disabled={!name.trim()}>
            Add
          </Button>
        </form>

        {items.length === 0 ? (
          <EmptyState
            title="Nothing on your list"
            message="Add items here when you spot what's missing for a recipe."
            mood="happy"
          />
        ) : (
          <>
            <ul className="flex flex-col gap-2 mb-6">
              {remaining.map((item) => (
                <li
                  key={item.id}
                  className="bg-white dark:bg-ink-900 rounded-2xl shadow-card p-3 flex items-center gap-3"
                >
                  <button
                    type="button"
                    onClick={() => toggle(item.id)}
                    aria-label={`Mark ${item.name} as bought`}
                    className="w-6 h-6 rounded-full border-2 border-ink-300 dark:border-ink-600 hover:border-brand-500 transition shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-ink-900 dark:text-ink-50 truncate">
                      {item.name}
                    </div>
                    {(item.quantity > 1 || item.unit) && (
                      <div className="text-xs text-ink-500 dark:text-ink-400">
                        {item.quantity > 0 ? item.quantity : ""}
                        {item.unit ? ` ${item.unit}` : ""}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(item.id)}
                    aria-label="Remove"
                    className="w-8 h-8 rounded-full text-ink-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition flex items-center justify-center"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>

            {checked.length > 0 && (
              <>
                <h3 className="text-xs uppercase tracking-wider font-semibold text-ink-500 dark:text-ink-400 mb-2 px-1">
                  Bought ({checked.length})
                </h3>
                <ul className="flex flex-col gap-2">
                  {checked.map((item) => (
                    <li
                      key={item.id}
                      className="bg-ink-50 dark:bg-ink-900/50 rounded-2xl p-3 flex items-center gap-3 opacity-70"
                    >
                      <button
                        type="button"
                        onClick={() => toggle(item.id)}
                        aria-label={`Unmark ${item.name}`}
                        className="w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center shrink-0"
                      >
                        <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      <span className="flex-1 line-through text-ink-500 dark:text-ink-400">
                        {item.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => remove(item.id)}
                        aria-label="Remove"
                        className="w-8 h-8 rounded-full text-ink-400 hover:text-red-600 transition flex items-center justify-center"
                      >
                        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </>
        )}
      </main>
    </>
  );
}
