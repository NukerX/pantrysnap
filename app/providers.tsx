"use client";

import { type ReactNode } from "react";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { PantryProvider } from "@/contexts/PantryContext";
import { PreferencesProvider } from "@/contexts/PreferencesContext";
import { RatingsProvider } from "@/contexts/RatingsContext";
import { ShoppingProvider } from "@/contexts/ShoppingContext";
import { ToastProvider } from "@/components/Toast";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <PreferencesProvider>
        <PantryProvider>
          <RatingsProvider>
            <ShoppingProvider>
              <ToastProvider>{children}</ToastProvider>
            </ShoppingProvider>
          </RatingsProvider>
        </PantryProvider>
      </PreferencesProvider>
    </ThemeProvider>
  );
}
