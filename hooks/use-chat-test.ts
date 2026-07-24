"use client";

import { useMutation } from "@tanstack/react-query";
import { testChatCompletion } from "@/lib/api-client";
import { toast } from "sonner";

export function useChatTest() {
  return useMutation({
    mutationFn: async (params: {
      apiKey: string;
      baseUrl: string;
      endpointUsed?: string;
      model: string;
      prompt: string;
    }) => testChatCompletion(params),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Response received");
      } else {
        toast.error(result.errorMessage ?? "Chat request failed");
      }
    },
    onError: () => toast.error("Unexpected error while sending chat request"),
  });
}
