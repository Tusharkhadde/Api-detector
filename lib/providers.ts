import { ProviderId, ProviderInfo } from "@/types";

export const PROVIDERS: Record<ProviderId, ProviderInfo> = {
  openai: { id: "openai", label: "OpenAI", color: "hsl(160 65% 45%)" },
  anthropic: { id: "anthropic", label: "Anthropic", color: "hsl(20 80% 55%)" },
  gemini: { id: "gemini", label: "Google Gemini", color: "hsl(217 90% 60%)" },
  "azure-openai": { id: "azure-openai", label: "Azure OpenAI", color: "hsl(206 90% 50%)" },
  openrouter: { id: "openrouter", label: "OpenRouter", color: "hsl(265 70% 60%)" },
  groq: { id: "groq", label: "Groq", color: "hsl(15 90% 55%)" },
  deepseek: { id: "deepseek", label: "DeepSeek", color: "hsl(230 80% 60%)" },
  together: { id: "together", label: "Together AI", color: "hsl(280 65% 55%)" },
  ollama: { id: "ollama", label: "Ollama", color: "hsl(0 0% 40%)" },
  lmstudio: { id: "lmstudio", label: "LM Studio", color: "hsl(45 90% 50%)" },
  unknown: { id: "unknown", label: "Unknown", color: "hsl(220 10% 55%)" },
};

export function detectProvider(params: {
  baseUrl: string;
  headers?: Record<string, string>;
  raw?: unknown;
}): ProviderId {
  const url = params.baseUrl.toLowerCase();

  if (url.includes("openrouter.ai")) return "openrouter";
  if (url.includes("groq.com")) return "groq";
  if (url.includes("deepseek.com")) return "deepseek";
  if (url.includes("together.xyz") || url.includes("together.ai")) return "together";
  if (url.includes("azure.com") || url.includes("openai.azure.com")) return "azure-openai";
  if (url.includes("generativelanguage.googleapis.com") || url.includes("gemini")) return "gemini";
  if (url.includes("anthropic.com")) return "anthropic";
  if (url.includes("api.openai.com")) return "openai";
  if (url.includes("localhost:11434") || url.includes("11434") || url.includes("ollama")) return "ollama";
  if (url.includes("1234") || url.includes("lmstudio") || url.includes("lm-studio")) return "lmstudio";

  // Fallback: inspect raw payload shape / headers
  const raw = params.raw as Record<string, unknown> | undefined;
  if (raw && typeof raw === "object") {
    const dataArr = (raw as { data?: unknown[] }).data;
    if (Array.isArray(dataArr) && dataArr.length > 0) {
      const first = dataArr[0] as Record<string, unknown>;
      if (typeof first?.id === "string" && (first.id as string).startsWith("gpt-")) return "openai";
      if (typeof first?.id === "string" && (first.id as string).includes("llama")) return "together";
    }
    if ((raw as { models?: unknown[] }).models) return "ollama";
  }

  const server = params.headers?.["server"]?.toLowerCase() ?? "";
  if (server.includes("uvicorn") || server.includes("lmstudio")) return "lmstudio";

  return "unknown";
}
