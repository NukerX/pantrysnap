"use client";

/**
 * Mascot — a friendly pantry jar character.
 * SVG-based so it scales perfectly and themes via currentColor.
 *
 * To replace with the user's mascot image: drop /public/mascot.png
 * and switch the inner JSX to <img src="/mascot.png" />.
 */
import { type CSSProperties } from "react";

type Mood = "happy" | "wave" | "thinking" | "sleepy";

export function Mascot({
  size = 120,
  mood = "happy",
  className = "",
  style,
}: {
  size?: number;
  mood?: Mood;
  className?: string;
  style?: CSSProperties;
}) {
  const eyeY = mood === "sleepy" ? 60 : 56;
  const mouth =
    mood === "happy" || mood === "wave"
      ? "M 56 72 Q 72 86 88 72"
      : mood === "thinking"
        ? "M 56 76 Q 72 70 88 76"
        : "M 60 76 L 84 76";

  return (
    <div
      className={`inline-block ${className}`}
      style={{ width: size, height: size, ...style }}
      role="img"
      aria-label="PantrySnap mascot"
    >
      <svg viewBox="0 0 144 144" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        {/* lid */}
        <rect x="34" y="14" width="76" height="18" rx="6" fill="#16a34a" />
        <rect x="34" y="14" width="76" height="6" rx="3" fill="#15803d" />
        {/* body */}
        <rect x="28" y="32" width="88" height="98" rx="14" fill="#86efac" />
        <rect x="28" y="32" width="88" height="14" fill="#4ade80" />
        {/* shine */}
        <rect x="38" y="50" width="8" height="60" rx="4" fill="#bbf7d0" opacity="0.9" />
        {/* face */}
        <circle cx="58" cy={eyeY} r={mood === "sleepy" ? 2 : 4} fill="#0f172a" />
        <circle cx="86" cy={eyeY} r={mood === "sleepy" ? 2 : 4} fill="#0f172a" />
        {/* cheeks */}
        <circle cx="50" cy="74" r="4" fill="#fca5a5" opacity="0.7" />
        <circle cx="94" cy="74" r="4" fill="#fca5a5" opacity="0.7" />
        {/* mouth */}
        <path d={mouth} stroke="#0f172a" strokeWidth="3" fill="none" strokeLinecap="round" />
        {/* label */}
        <rect x="40" y="92" width="64" height="22" rx="4" fill="#fefce8" />
        <text
          x="72"
          y="108"
          textAnchor="middle"
          fontFamily="ui-sans-serif, system-ui"
          fontSize="11"
          fontWeight="700"
          fill="#16a34a"
        >
          PANTRY
        </text>
        {mood === "wave" && (
          <g>
            <path d="M 12 60 Q 16 50 26 54 L 30 70 Q 22 78 14 72 Z" fill="#86efac" />
            <path d="M 12 60 Q 16 50 26 54" stroke="#15803d" strokeWidth="2" fill="none" />
          </g>
        )}
      </svg>
    </div>
  );
}
