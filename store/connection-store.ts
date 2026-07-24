"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ModelInfo, ProviderId, TestResult } from "@/types";

interface ConnectionState {
  apiKey: string;
  baseUrl: string;
  lastResult: TestResult | null;
  models: ModelInfo[];
  provider: ProviderId | null;
  endpointUsed: string | null;
  isTesting: boolean;
  setApiKey: (v: string) => void;
  setBaseUrl: (v: string) => void;
  setResult: (r: TestResult) => void;
  setTesting: (v: boolean) => void;
  reset: () => void;
}

export const useConnectionStore = create<ConnectionState>()(
  persist(
    (set) => ({
      apiKey: "",
      baseUrl: "https://api.openai.com",
      lastResult: null,
      models: [],
      provider: null,
      endpointUsed: null,
      isTesting: false,
      setApiKey: (v) => set({ apiKey: v }),
      setBaseUrl: (v) => set({ baseUrl: v }),
      setResult: (r) =>
        set({
          lastResult: r,
          models: r.models ?? [],
          provider: r.provider ?? null,
          endpointUsed: r.endpointUsed ?? null,
        }),
      setTesting: (v) => set({ isTesting: v }),
      reset: () => set({ lastResult: null, models: [], provider: null, endpointUsed: null }),
    }),
    {
      name: "api-inspector-connection",
      partialize: (state) => ({
        apiKey: state.apiKey,
        baseUrl: state.baseUrl,
      }),
    }
  )
);
