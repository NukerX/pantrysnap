"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

type Toast = {
  id: number;
  message: string;
  action?: { label: string; onClick: () => void };
};

type ToastContextValue = {
  show: (message: string, options?: { action?: { label: string; onClick: () => void }; durationMs?: number }) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const show = useCallback<ToastContextValue["show"]>((message, options = {}) => {
    counter.current += 1;
    const toast: Toast = { id: counter.current, message, action: options.action };
    setToasts((t) => [...t, toast]);
    setTimeout(() => dismiss(toast.id), options.durationMs ?? 3500);
  }, [dismiss]);

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-24 left-0 right-0 z-50 flex flex-col items-center gap-2 px-4 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="bg-ink-900 dark:bg-ink-100 text-ink-50 dark:text-ink-900 rounded-full px-4 py-2.5 shadow-cardHover flex items-center gap-3 animate-slideUp pointer-events-auto"
          >
            <span className="text-sm font-medium">{t.message}</span>
            {t.action && (
              <button
                type="button"
                onClick={() => {
                  t.action?.onClick();
                  dismiss(t.id);
                }}
                className="text-sm font-bold text-brand-300 dark:text-brand-600"
              >
                {t.action.label}
              </button>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be inside ToastProvider");
  return ctx;
}
