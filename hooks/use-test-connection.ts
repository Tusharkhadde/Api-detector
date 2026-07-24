"use client";

import { useMutation } from "@tanstack/react-query";
import { testConnection } from "@/lib/api-client";
import { useConnectionStore } from "@/store/connection-store";
import { useHistoryStore } from "@/store/history-store";
import { toast } from "sonner";

export function useTestConnection() {
  const setResult = useConnectionStore((s) => s.setResult);
  const setTesting = useConnectionStore((s) => s.setTesting);
  const addHistory = useHistoryStore((s) => s.add);

  return useMutation({
    mutationFn: async (params: { apiKey: string; baseUrl: string }) => {
      setTesting(true);
      return testConnection(params);
    },
    onSettled: () => setTesting(false),
    onSuccess: (result, variables) => {
      setResult(result);
      addHistory({
        baseUrl: variables.baseUrl,
        success: result.success,
        latencyMs: result.latencyMs,
        modelCount: result.models?.length ?? 0,
        endpointUsed: result.endpointUsed,
        provider: result.provider,
        errorMessage: result.errorMessage,
      });
      if (result.success) {
        toast.success(`Connected — found ${result.models?.length ?? 0} model(s)`, {
          description: result.endpointUsed,
        });
      } else {
        toast.error(result.errorMessage ?? "Connection failed", {
          description: result.status ? `HTTP ${result.status}` : undefined,
        });
      }
    },
    onError: (err: unknown) => {
      toast.error("Unexpected error while testing connection");
      console.error(err);
    },
  });
}
