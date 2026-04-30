"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/Button";
import { Chip } from "@/components/Chip";
import { Modal } from "@/components/Modal";
import { useToast } from "@/components/Toast";
import { useTheme } from "@/contexts/ThemeContext";
import { usePreferences } from "@/contexts/PreferencesContext";
import { usePantry } from "@/contexts/PantryContext";
import { useShopping } from "@/contexts/ShoppingContext";
import { useRatings } from "@/contexts/RatingsContext";
import { CUISINES, DIETARY_FLAGS } from "@/lib/types";
import { clearAll } from "@/lib/storage";

export default function SettingsPage() {
  const router = useRouter();
  const { appState, setTheme, reset: resetApp } = useTheme();
  const { preferences, toggleCuisine, toggleDietary, setDislikedIngredients, reset: resetPrefs } =
    usePreferences();
  const { reset: resetPantry, loadDemo } = usePantry();
  const { reset: resetShopping } = useShopping();
  const { reset: resetRatings } = useRatings();
  const { show } = useToast();
  const [confirmReset, setConfirmReset] = useState(false);
  const [dislikedDraft, setDislikedDraft] = useState(
    preferences.dislikedIngredients.join(", "),
  );

  const handleReset = () => {
    clearAll();
    resetPrefs();
    resetPantry();
    resetShopping();
    resetRatings();
    resetApp();
    setConfirmReset(false);
    show("All data cleared");
    router.replace("/onboarding");
  };

  const saveDisliked = () => {
    const list = dislikedDraft
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    setDislikedIngredients(list);
    show("Disliked ingredients updated");
  };

  return (
    <>
      <AppHeader
        title="Settings"
        right={
          <Link
            href="/shopping"
            className="text-sm font-semibold text-brand-600 dark:text-brand-400 px-2"
          >
            🛒 List
          </Link>
        }
      />
      <main className="px-4 py-4 flex flex-col gap-6">
        <Section title="Appearance">
          <div className="bg-white dark:bg-ink-900 rounded-2xl shadow-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-ink-900 dark:text-ink-50">Theme</div>
                <div className="text-xs text-ink-500 dark:text-ink-400">
                  Switch between light and dark mode
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTheme("light")}
                  className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
                    appState.theme === "light"
                      ? "bg-brand-500 text-white"
                      : "bg-ink-100 dark:bg-ink-800 text-ink-700 dark:text-ink-200"
                  }`}
                >
                  Light
                </button>
                <button
                  type="button"
                  onClick={() => setTheme("dark")}
                  className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
                    appState.theme === "dark"
                      ? "bg-brand-500 text-white"
                      : "bg-ink-100 dark:bg-ink-800 text-ink-700 dark:text-ink-200"
                  }`}
                >
                  Dark
                </button>
              </div>
            </div>
          </div>
        </Section>

        <Section title="Cuisines you love">
          <div className="bg-white dark:bg-ink-900 rounded-2xl shadow-card p-4">
            <div className="flex flex-wrap gap-2">
              {CUISINES.map((c) => (
                <Chip
                  key={c}
                  label={c}
                  active={preferences.cuisines.includes(c)}
                  onClick={() => toggleCuisine(c)}
                  size="sm"
                />
              ))}
            </div>
          </div>
        </Section>

        <Section title="Dietary preferences">
          <div className="bg-white dark:bg-ink-900 rounded-2xl shadow-card p-4">
            <div className="flex flex-wrap gap-2">
              {DIETARY_FLAGS.map((d) => (
                <Chip
                  key={d}
                  label={d}
                  active={preferences.dietary.includes(d)}
                  onClick={() => toggleDietary(d)}
                  size="sm"
                />
              ))}
            </div>
          </div>
        </Section>

        <Section title="Disliked ingredients">
          <div className="bg-white dark:bg-ink-900 rounded-2xl shadow-card p-4">
            <p className="text-xs text-ink-500 dark:text-ink-400 mb-3">
              Recipes containing these will be hidden. Comma separated.
            </p>
            <input
              type="text"
              value={dislikedDraft}
              onChange={(e) => setDislikedDraft(e.target.value)}
              placeholder="e.g. cilantro, mushroom"
              className="w-full px-3 py-2.5 rounded-xl bg-ink-50 dark:bg-ink-800 border border-ink-200 dark:border-ink-700 text-ink-900 dark:text-ink-50 focus:outline-none focus:border-brand-500"
            />
            <div className="mt-3">
              <Button size="sm" onClick={saveDisliked}>
                Save
              </Button>
            </div>
          </div>
        </Section>

        <Section title="Pantry">
          <div className="bg-white dark:bg-ink-900 rounded-2xl shadow-card p-4 flex flex-col gap-2">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => {
                loadDemo();
                show("Demo pantry loaded");
              }}
            >
              Load demo pantry
            </Button>
            <Button
              variant="secondary"
              fullWidth
              onClick={() => {
                resetPantry();
                show("Pantry cleared");
              }}
            >
              Clear pantry
            </Button>
          </div>
        </Section>

        <Section title="Danger zone">
          <div className="bg-white dark:bg-ink-900 rounded-2xl shadow-card p-4">
            <Button variant="danger" fullWidth onClick={() => setConfirmReset(true)}>
              Reset all data
            </Button>
            <p className="text-xs text-ink-500 dark:text-ink-400 mt-2 text-center">
              Wipes pantry, preferences, ratings, and shopping list.
            </p>
          </div>
        </Section>

        <p className="text-center text-xs text-ink-400 mt-4">
          PantrySnap • Data stays on this device
        </p>
      </main>

      <Modal open={confirmReset} onClose={() => setConfirmReset(false)} title="Reset everything?">
        <p className="text-sm text-ink-600 dark:text-ink-300 mb-5">
          This permanently clears all PantrySnap data on this device. You&apos;ll be sent back to onboarding.
        </p>
        <div className="flex gap-2">
          <Button variant="secondary" fullWidth onClick={() => setConfirmReset(false)}>
            Cancel
          </Button>
          <Button variant="danger" fullWidth onClick={handleReset}>
            Yes, wipe it
          </Button>
        </div>
      </Modal>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xs uppercase tracking-wider font-semibold text-ink-500 dark:text-ink-400 mb-2 px-1">
        {title}
      </h2>
      {children}
    </section>
  );
}
