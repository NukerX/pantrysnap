"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { useTheme } from "@/contexts/ThemeContext";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { appState, hydrated } = useTheme();

  useEffect(() => {
    if (hydrated && !appState.onboarded) {
      router.replace("/onboarding");
    }
  }, [hydrated, appState.onboarded, router]);

  if (!hydrated) {
    return null;
  }

  return (
    <div className="min-h-[100dvh] pb-24">
      <div className="max-w-lg mx-auto">{children}</div>
      <BottomNav />
    </div>
  );
}
