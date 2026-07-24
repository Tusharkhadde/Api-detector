"use client";

import { motion } from "framer-motion";

export function LatencyWave({ latencyMs, success }: { latencyMs: number; success: boolean }) {
  // Map latency to a jitter amplitude — purely decorative signature of the "signal" being tested.
  const bars = 24;
  const seed = Math.max(4, Math.min(28, latencyMs / 40));

  return (
    <div className="flex h-8 items-end gap-[3px]" aria-hidden>
      {Array.from({ length: bars }).map((_, i) => {
        const h = 4 + Math.abs(Math.sin(i * 0.7 + seed)) * 22;
        return (
          <motion.span
            key={i}
            initial={{ height: 4, opacity: 0.3 }}
            animate={{ height: h, opacity: 1 }}
            transition={{ delay: i * 0.015, duration: 0.4, ease: "easeOut" }}
            className={`w-[3px] rounded-full ${success ? "bg-success" : "bg-destructive"}`}
          />
        );
      })}
    </div>
  );
}
