"use client";

import { useEffect, useState } from "react";

const STEPS = [
  { icon: "✦", label: "Thinking about your topic…" },
  { icon: "⟳", label: "Building connections…" },
  { icon: "⬡", label: "Structuring branches…" },
  { icon: "⊕", label: "Laying out your map…" },
];

export default function GeneratingOverlay({ topic }: { topic: string }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [dots, setDots] = useState("");

  // Advance through steps every ~2s
  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Animate dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "" : d + "."));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm">
      {/* Pulsing ring */}
      <div className="relative mb-8">
        <div className="w-20 h-20 rounded-full border-2 border-indigo-500/30 animate-ping absolute inset-0" />
        <div className="w-20 h-20 rounded-full border-2 border-indigo-500/60 animate-pulse absolute inset-0" />
        <div className="w-20 h-20 rounded-full bg-slate-900 border border-indigo-500 flex items-center justify-center relative">
          <span className="text-indigo-400 text-3xl animate-spin" style={{ animationDuration: "3s" }}>
            ✦
          </span>
        </div>
      </div>

      {/* Topic label */}
      <p className="text-white/40 text-sm mb-6 max-w-xs text-center truncate">
        "{topic}"
      </p>

      {/* Steps */}
      <div className="flex flex-col gap-2 min-w-[220px]">
        {STEPS.map((step, i) => {
          const isDone = i < stepIndex;
          const isActive = i === stepIndex;
          const isPending = i > stepIndex;

          return (
            <div
              key={step.label}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-500 ${
                isActive
                  ? "bg-indigo-600/20 border border-indigo-500/40"
                  : isDone
                  ? "opacity-40"
                  : isPending
                  ? "opacity-20"
                  : ""
              }`}
            >
              <span
                className={`text-base ${
                  isDone ? "text-green-400" : isActive ? "text-indigo-400" : "text-white/20"
                }`}
              >
                {isDone ? "✓" : step.icon}
              </span>
              <span
                className={`text-sm ${
                  isDone
                    ? "text-white/40 line-through"
                    : isActive
                    ? "text-white/90"
                    : "text-white/20"
                }`}
              >
                {isActive ? step.label.replace("…", dots) : step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
