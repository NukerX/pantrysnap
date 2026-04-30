/**
 * Mock vision service.
 * Returns fake but realistic detection results after a simulated delay.
 *
 * To plug in a real vision API later (e.g. Google Vision, AWS Rekognition,
 * OpenAI Vision), replace the body of `detectItems` with a real call.
 * Keep the signature the same and the rest of the app won't change.
 */
import type { DetectedItem } from "@/lib/types";

const SCENARIOS: Record<string, DetectedItem[]> = {
  fridge: [
    { name: "Milk", quantity: 1, unit: "carton", category: "Dairy", confidence: 0.94 },
    { name: "Eggs", quantity: 8, unit: "count", category: "Dairy", confidence: 0.91 },
    { name: "Cheddar Cheese", quantity: 1, unit: "block", category: "Dairy", confidence: 0.87 },
    { name: "Spinach", quantity: 1, unit: "bunch", category: "Produce", confidence: 0.82 },
    { name: "Greek Yogurt", quantity: 2, unit: "cup", category: "Dairy", confidence: 0.79 },
  ],
  produce: [
    { name: "Tomato", quantity: 4, unit: "count", category: "Produce", confidence: 0.93 },
    { name: "Onion", quantity: 2, unit: "count", category: "Produce", confidence: 0.9 },
    { name: "Garlic", quantity: 1, unit: "head", category: "Produce", confidence: 0.88 },
    { name: "Bell Pepper", quantity: 2, unit: "count", category: "Produce", confidence: 0.85 },
    { name: "Cilantro", quantity: 1, unit: "bunch", category: "Produce", confidence: 0.78 },
    { name: "Lime", quantity: 3, unit: "count", category: "Produce", confidence: 0.84 },
  ],
  spices: [
    { name: "Salt", quantity: 1, unit: "container", category: "Spices", confidence: 0.95 },
    { name: "Black Pepper", quantity: 1, unit: "container", category: "Spices", confidence: 0.92 },
    { name: "Cumin", quantity: 1, unit: "container", category: "Spices", confidence: 0.84 },
    { name: "Paprika", quantity: 1, unit: "container", category: "Spices", confidence: 0.82 },
    { name: "Oregano", quantity: 1, unit: "container", category: "Spices", confidence: 0.78 },
  ],
  pantry: [
    { name: "Olive Oil", quantity: 1, unit: "bottle", category: "Pantry", confidence: 0.91 },
    { name: "Pasta", quantity: 2, unit: "box", category: "Grains", confidence: 0.89 },
    { name: "Rice", quantity: 1, unit: "bag", category: "Grains", confidence: 0.88 },
    { name: "Black Beans", quantity: 2, unit: "can", category: "Pantry", confidence: 0.86 },
    { name: "Tomato Sauce", quantity: 1, unit: "jar", category: "Pantry", confidence: 0.83 },
  ],
};

const SCENARIO_KEYS = Object.keys(SCENARIOS);

function pickScenario(): DetectedItem[] {
  const key = SCENARIO_KEYS[Math.floor(Math.random() * SCENARIO_KEYS.length)];
  // Slightly shuffle and randomize to feel less canned
  const items = SCENARIOS[key]
    .slice()
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.floor(Math.random() * 2) + 4); // 4-5 items
  return items.map((i) => ({
    ...i,
    confidence: Math.max(0.6, Math.min(0.99, i.confidence + (Math.random() * 0.1 - 0.05))),
  }));
}

export type DetectOptions = {
  /** Override the simulated delay (ms). Default 2500. */
  simulatedDelayMs?: number;
};

/**
 * Run mock detection on an image file.
 * Replace this implementation to plug in a real vision API.
 */
export async function detectItems(
  _file: File | Blob | null,
  options: DetectOptions = {},
): Promise<DetectedItem[]> {
  const delay = options.simulatedDelayMs ?? 2500;
  await new Promise((resolve) => setTimeout(resolve, delay));
  return pickScenario();
}

/** Read a File/Blob into a base64 data URL. */
export async function fileToDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/** Downscale an image data URL via canvas. Used to keep scan thumbnails small. */
export async function downscaleDataUrl(
  dataUrl: string,
  maxDim = 256,
  quality = 0.7,
): Promise<string> {
  if (typeof window === "undefined") return dataUrl;
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(dataUrl);
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}
