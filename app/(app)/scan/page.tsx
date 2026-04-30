"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { Mascot } from "@/components/Mascot";
import { Button } from "@/components/Button";
import { useToast } from "@/components/Toast";
import { usePantry } from "@/contexts/PantryContext";
import { detectItems, downscaleDataUrl, fileToDataUrl } from "@/services/vision";
import { CATEGORIES, type DetectedItem } from "@/lib/types";

type Phase = "idle" | "analyzing" | "review" | "saved";

export default function ScanPage() {
  const router = useRouter();
  const { upsertMany } = usePantry();
  const { show } = useToast();
  const [phase, setPhase] = useState<Phase>("idle");
  const [preview, setPreview] = useState<string | null>(null);
  const [detected, setDetected] = useState<DetectedItem[]>([]);
  const cameraInput = useRef<HTMLInputElement>(null);
  const galleryInput = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setPhase("analyzing");
    try {
      const fullDataUrl = await fileToDataUrl(file);
      const thumb = await downscaleDataUrl(fullDataUrl, 320, 0.7);
      setPreview(thumb);
      const items = await detectItems(file);
      setDetected(items);
      setPhase("review");
    } catch (err) {
      console.error(err);
      show("Couldn't analyze that photo");
      setPhase("idle");
    }
  };

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = ""; // reset so same file can be picked again
  };

  const updateItem = (idx: number, patch: Partial<DetectedItem>) => {
    setDetected((d) => d.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  };

  const removeItem = (idx: number) => {
    setDetected((d) => d.filter((_, i) => i !== idx));
  };

  const save = () => {
    upsertMany(detected);
    show(`Added ${detected.length} item${detected.length === 1 ? "" : "s"} to pantry`);
    setPhase("saved");
    setTimeout(() => router.push("/pantry"), 700);
  };

  const reset = () => {
    setPhase("idle");
    setDetected([]);
    setPreview(null);
  };

  return (
    <>
      <AppHeader title="Scan" />
      <main className="px-4 py-4">
        {phase === "idle" && (
          <div className="flex flex-col items-center text-center py-8 animate-slideUp">
            <Mascot mood="wave" size={140} />
            <h2 className="mt-4 text-xl font-bold text-ink-900 dark:text-ink-50">
              Snap your pantry
            </h2>
            <p className="mt-2 text-ink-600 dark:text-ink-400 max-w-xs">
              Take a photo or upload one. We&apos;ll detect what&apos;s in it. (This is mock detection — swap in a real vision API later.)
            </p>
            <div className="mt-8 w-full max-w-xs flex flex-col gap-3">
              <Button size="lg" fullWidth onClick={() => cameraInput.current?.click()}>
                Take a photo
              </Button>
              <Button
                size="lg"
                variant="secondary"
                fullWidth
                onClick={() => galleryInput.current?.click()}
              >
                Upload from device
              </Button>
            </div>
            <input
              ref={cameraInput}
              type="file"
              accept="image/*"
              capture="environment"
              hidden
              onChange={onPick}
            />
            <input
              ref={galleryInput}
              type="file"
              accept="image/*"
              hidden
              onChange={onPick}
            />
          </div>
        )}

        {phase === "analyzing" && (
          <div className="flex flex-col items-center text-center py-12 animate-slideUp">
            {preview ? (
              <div className="w-40 h-40 rounded-3xl overflow-hidden shadow-card relative">
                <img src={preview} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30" />
              </div>
            ) : (
              <Mascot mood="thinking" size={140} className="animate-bounceSoft" />
            )}
            <h2 className="mt-6 text-xl font-bold text-ink-900 dark:text-ink-50 animate-pulseSoft">
              Analyzing your photo…
            </h2>
            <p className="mt-2 text-ink-500 dark:text-ink-400 text-sm">
              Identifying ingredients
            </p>
            <div className="mt-6 flex gap-1.5">
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}

        {phase === "review" && (
          <div className="animate-slideUp">
            <div className="flex items-start gap-3 mb-4">
              {preview && (
                <img
                  src={preview}
                  alt="Captured"
                  className="w-16 h-16 rounded-2xl object-cover shadow-card shrink-0"
                />
              )}
              <div className="flex-1">
                <h2 className="font-bold text-ink-900 dark:text-ink-50">
                  Found {detected.length} item{detected.length === 1 ? "" : "s"}
                </h2>
                <p className="text-xs text-ink-500 dark:text-ink-400">
                  Review & adjust before saving to your pantry.
                </p>
              </div>
            </div>

            {detected.length === 0 ? (
              <div className="text-center py-8 text-ink-500 dark:text-ink-400">
                Hmm, didn&apos;t catch anything. Try another photo.
              </div>
            ) : (
              <ul className="flex flex-col gap-2 mb-6">
                {detected.map((item, idx) => (
                  <li
                    key={`${item.name}-${idx}`}
                    className="bg-white dark:bg-ink-900 rounded-2xl shadow-card p-3 flex items-center gap-3"
                  >
                    <div className="w-9 h-9 rounded-lg bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 flex items-center justify-center text-xs font-bold shrink-0">
                      {Math.round(item.confidence * 100)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => updateItem(idx, { name: e.target.value })}
                        className="w-full font-semibold text-ink-900 dark:text-ink-50 bg-transparent focus:outline-none"
                      />
                      <div className="flex items-center gap-2 mt-1 text-xs">
                        <input
                          type="number"
                          value={item.quantity}
                          min={0}
                          onChange={(e) => updateItem(idx, { quantity: Number(e.target.value) })}
                          className="w-12 px-1.5 py-0.5 rounded-md bg-ink-50 dark:bg-ink-800 border border-ink-200 dark:border-ink-700 text-ink-900 dark:text-ink-50"
                        />
                        <input
                          type="text"
                          value={item.unit}
                          onChange={(e) => updateItem(idx, { unit: e.target.value })}
                          className="w-16 px-1.5 py-0.5 rounded-md bg-ink-50 dark:bg-ink-800 border border-ink-200 dark:border-ink-700 text-ink-900 dark:text-ink-50"
                        />
                        <select
                          value={item.category}
                          onChange={(e) => updateItem(idx, { category: e.target.value })}
                          className="px-1.5 py-0.5 rounded-md bg-ink-50 dark:bg-ink-800 border border-ink-200 dark:border-ink-700 text-ink-700 dark:text-ink-200 text-xs"
                        >
                          {CATEGORIES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
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
            )}

            <div className="flex gap-3">
              <Button variant="secondary" onClick={reset}>
                Retake
              </Button>
              <Button fullWidth onClick={save} disabled={detected.length === 0}>
                Save to pantry
              </Button>
            </div>
          </div>
        )}

        {phase === "saved" && (
          <div className="flex flex-col items-center text-center py-12 animate-slideUp">
            <Mascot mood="happy" size={140} className="animate-bounceSoft" />
            <h2 className="mt-4 text-xl font-bold text-ink-900 dark:text-ink-50">Saved!</h2>
            <p className="mt-2 text-ink-500 dark:text-ink-400 text-sm">Heading to your pantry…</p>
          </div>
        )}
      </main>
    </>
  );
}
