"use client";

import { Mascot } from "./Mascot";

export function EmptyState({
  title,
  message,
  cta,
  mood = "happy",
}: {
  title: string;
  message?: string;
  cta?: React.ReactNode;
  mood?: "happy" | "thinking" | "sleepy" | "wave";
}) {
  return (
    <div className="flex flex-col items-center text-center py-16 px-6 animate-slideUp">
      <Mascot mood={mood} size={140} />
      <h2 className="mt-4 text-xl font-bold text-ink-900 dark:text-ink-50">{title}</h2>
      {message && (
        <p className="mt-2 text-ink-600 dark:text-ink-400 max-w-xs">{message}</p>
      )}
      {cta && <div className="mt-6">{cta}</div>}
    </div>
  );
}
