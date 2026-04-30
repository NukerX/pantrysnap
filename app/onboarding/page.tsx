"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Mascot } from "@/components/Mascot";
import { Chip } from "@/components/Chip";
import { Button } from "@/components/Button";
import { CUISINES, DIETARY_FLAGS } from "@/lib/types";
import { usePreferences } from "@/contexts/PreferencesContext";
import { useTheme } from "@/contexts/ThemeContext";
import { usePantry } from "@/contexts/PantryContext";

type Step = "welcome" | "cuisines" | "dietary" | "demo";

export default function OnboardingPage() {
  const router = useRouter();
  const { preferences, setCuisines, setDietary, hydrated } = usePreferences();
  const { setOnboarded, appState } = useTheme();
  const { loadDemo } = usePantry();
  const [step, setStep] = useState<Step>("welcome");
  const [picked, setPicked] = useState<string[]>([]);
  const [pickedDietary, setPickedDietary] = useState<string[]>([]);
  const [loadDemoData, setLoadDemoData] = useState(true);

  useEffect(() => {
    if (hydrated && appState.onboarded) {
      router.replace("/pantry");
    }
  }, [hydrated, appState.onboarded, router]);

  useEffect(() => {
    if (hydrated) {
      setPicked(preferences.cuisines);
      setPickedDietary(preferences.dietary);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  const togglePick = (c: string) =>
    setPicked((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c]));

  const togglePickDietary = (d: string) =>
    setPickedDietary((p) => (p.includes(d) ? p.filter((x) => x !== d) : [...p, d]));

  const finish = () => {
    setCuisines(picked);
    setDietary(pickedDietary);
    if (loadDemoData) loadDemo();
    setOnboarded(true);
    router.replace("/pantry");
  };

  return (
    <main className="min-h-[100dvh] max-w-lg mx-auto px-6 py-8 flex flex-col">
      {step === "welcome" && (
        <div className="flex-1 flex flex-col items-center justify-center text-center animate-slideUp">
          <Mascot mood="wave" size={180} className="animate-bounceSoft" />
          <h1 className="mt-6 text-4xl font-extrabold text-ink-900 dark:text-ink-50 tracking-tight">
            Welcome to PantrySnap
          </h1>
          <p className="mt-3 text-ink-600 dark:text-ink-400 max-w-sm">
            Snap a photo of your pantry and we&apos;ll suggest recipes you can actually cook tonight.
          </p>
          <div className="mt-8 w-full max-w-xs">
            <Button size="lg" fullWidth onClick={() => setStep("cuisines")}>
              Get started
            </Button>
          </div>
          <p className="mt-3 text-xs text-ink-400">No account needed — your data stays on this device.</p>
        </div>
      )}

      {step === "cuisines" && (
        <div className="flex-1 flex flex-col animate-slideUp">
          <div className="flex items-center gap-3 mb-6">
            <Mascot size={56} mood="happy" />
            <div>
              <div className="text-xs uppercase font-semibold text-brand-600 dark:text-brand-400 tracking-wider">
                Step 1 of 3
              </div>
              <h2 className="text-2xl font-bold text-ink-900 dark:text-ink-50">What do you love?</h2>
            </div>
          </div>
          <p className="text-ink-600 dark:text-ink-400 mb-6">
            Pick the cuisines you cook most often. We&apos;ll surface those first.
          </p>
          <div className="flex flex-wrap gap-2">
            {CUISINES.map((c) => (
              <Chip key={c} label={c} active={picked.includes(c)} onClick={() => togglePick(c)} />
            ))}
          </div>
          <div className="mt-auto pt-8 flex gap-3">
            <Button variant="secondary" onClick={() => setStep("welcome")}>
              Back
            </Button>
            <Button fullWidth onClick={() => setStep("dietary")}>
              Continue
            </Button>
          </div>
        </div>
      )}

      {step === "dietary" && (
        <div className="flex-1 flex flex-col animate-slideUp">
          <div className="flex items-center gap-3 mb-6">
            <Mascot size={56} mood="thinking" />
            <div>
              <div className="text-xs uppercase font-semibold text-brand-600 dark:text-brand-400 tracking-wider">
                Step 2 of 3
              </div>
              <h2 className="text-2xl font-bold text-ink-900 dark:text-ink-50">Any preferences?</h2>
            </div>
          </div>
          <p className="text-ink-600 dark:text-ink-400 mb-6">
            Optional — skip if none apply. You can always update this in settings.
          </p>
          <div className="flex flex-wrap gap-2">
            {DIETARY_FLAGS.map((d) => (
              <Chip
                key={d}
                label={d}
                active={pickedDietary.includes(d)}
                onClick={() => togglePickDietary(d)}
              />
            ))}
          </div>
          <div className="mt-auto pt-8 flex gap-3">
            <Button variant="secondary" onClick={() => setStep("cuisines")}>
              Back
            </Button>
            <Button fullWidth onClick={() => setStep("demo")}>
              Continue
            </Button>
          </div>
        </div>
      )}

      {step === "demo" && (
        <div className="flex-1 flex flex-col animate-slideUp">
          <div className="flex items-center gap-3 mb-6">
            <Mascot size={56} mood="wave" />
            <div>
              <div className="text-xs uppercase font-semibold text-brand-600 dark:text-brand-400 tracking-wider">
                Step 3 of 3
              </div>
              <h2 className="text-2xl font-bold text-ink-900 dark:text-ink-50">Want to start with a demo pantry?</h2>
            </div>
          </div>
          <p className="text-ink-600 dark:text-ink-400 mb-6">
            We can pre-fill your pantry with common staples so you can see recipe suggestions
            immediately. You can clear it anytime.
          </p>
          <label className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-ink-900 shadow-card cursor-pointer">
            <input
              type="checkbox"
              checked={loadDemoData}
              onChange={(e) => setLoadDemoData(e.target.checked)}
              className="w-5 h-5 accent-brand-500"
            />
            <div className="flex-1">
              <div className="font-semibold text-ink-900 dark:text-ink-50">
                Load demo pantry
              </div>
              <div className="text-xs text-ink-500 dark:text-ink-400">
                ~13 staple items (oil, pasta, eggs, etc.)
              </div>
            </div>
          </label>
          <div className="mt-auto pt-8 flex gap-3">
            <Button variant="secondary" onClick={() => setStep("dietary")}>
              Back
            </Button>
            <Button fullWidth onClick={finish}>
              Let&apos;s cook
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}
