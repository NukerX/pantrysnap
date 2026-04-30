"use client";

export function Chip({
  label,
  active,
  onClick,
  size = "md",
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
  size?: "sm" | "md";
}) {
  const padding = size === "sm" ? "px-3 py-1 text-xs" : "px-4 py-2 text-sm";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${padding} rounded-full border font-medium transition ${
        active
          ? "bg-brand-500 text-white border-brand-500 shadow-card"
          : "bg-white dark:bg-ink-900 text-ink-700 dark:text-ink-200 border-ink-200 dark:border-ink-700 hover:border-brand-400"
      }`}
    >
      {label}
    </button>
  );
}
