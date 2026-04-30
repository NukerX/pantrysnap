"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/contexts/ThemeContext";
import { Mascot } from "@/components/Mascot";

export default function RootRedirect() {
  const router = useRouter();
  const { appState, hydrated } = useTheme();

  useEffect(() => {
    if (!hydrated) return;
    if (appState.onboarded) {
      router.replace("/pantry");
    } else {
      router.replace("/onboarding");
    }
  }, [appState.onboarded, hydrated, router]);

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center gap-4">
      <Mascot mood="wave" size={120} className="animate-bounceSoft" />
      <p className="text-ink-500 dark:text-ink-400 text-sm">Loading PantrySnap…</p>
    </div>
  );
}
