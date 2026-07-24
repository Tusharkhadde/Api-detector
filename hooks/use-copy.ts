"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";

export function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = useCallback(async (text: string, id = "default") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied((c) => (c === id ? null : c)), 1500);
    } catch {
      toast.error("Could not copy to clipboard");
    }
  }, []);

  return { copy, copied };
}
