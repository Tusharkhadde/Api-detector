"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { HistoryEntry } from "@/types";

interface HistoryState {
  entries: HistoryEntry[];
  add: (entry: Omit<HistoryEntry, "id" | "timestamp">) => void;
  remove: (id: string) => void;
  clear: () => void;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      entries: [],
      add: (entry) =>
        set((state) => ({
          entries: [
            { ...entry, id: crypto.randomUUID(), timestamp: Date.now() },
            ...state.entries,
          ].slice(0, 200),
        })),
      remove: (id) => set((state) => ({ entries: state.entries.filter((e) => e.id !== id) })),
      clear: () => set({ entries: [] }),
    }),
    { name: "api-inspector-history" }
  )
);
