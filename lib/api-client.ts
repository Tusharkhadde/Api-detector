import axios, { AxiosError } from "axios";
import { ChatTestResult, ErrorKind, ModelInfo, TestResult } from "@/types";
import { detectProvider } from "@/lib/providers";

const DISCOVERY_SUFFIXES = [
  "/models",
  "/v1/models",
  "/api/v1/models",
  "/openai/v1/models",
  "/compatible-mode/v1/models",
];

function normalizeBase(baseUrl: string) {
  return baseUrl.trim().replace(/\/+$/, "");
}

function classifyError(err: unknown): { kind: ErrorKind; message: string; status?: number } {
  if (axios.isAxiosError(err)) {
    const e = err as AxiosError;
    if (e.code === "ECONNABORTED") {
      return { kind: "timeout", message: "The request timed out. The server took too long to respond." };
    }
    if (e.response) {
      const status = e.response.status;
      if (status === 401) return { kind: "unauthorized", message: "Invalid or missing API key (401 Unauthorized).", status };
      if (status === 403) return { kind: "forbidden", message: "Access denied for this key or endpoint (403 Forbidden).", status };
      if (status === 404) return { kind: "not_found", message: "Endpoint not found (404).", status };
      if (status === 429) return { kind: "rate_limited", message: "Rate limit exceeded (429). Slow down requests.", status };
      if (status >= 500) return { kind: "server_error", message: `Server error (${status}). The provider is having issues.`, status };
      return { kind: "unknown", message: `Request failed with status ${status}.`, status };
    }
    if (e.message?.toLowerCase().includes("network")) {
      return { kind: "network_error", message: "Network error — check your connection, CORS policy, or the URL." };
    }
    if (e.message?.toLowerCase().includes("ssl") || e.message?.toLowerCase().includes("certificate")) {
      return { kind: "ssl_error", message: "SSL/TLS certificate error while connecting to the host." };
    }
    if (e.message?.toLowerCase().includes("enotfound") || e.message?.toLowerCase().includes("dns")) {
      return { kind: "dns_error", message: "DNS lookup failed — the hostname could not be resolved." };
    }
    return { kind: "network_error", message: e.message || "Network request failed." };
  }
  if (err instanceof Error) {
    return { kind: "unknown", message: err.message };
  }
  return { kind: "unknown", message: "An unknown error occurred." };
}

function extractModels(raw: unknown): ModelInfo[] {
  if (!raw || typeof raw !== "object") return [];
  const obj = raw as Record<string, unknown>;

  // OpenAI-style { data: [...] }
  const data = obj.data;
  if (Array.isArray(data)) {
    return data.map((m) => {
      const mm = m as Record<string, unknown>;
      return {
        id: String(mm.id ?? mm.name ?? "unknown"),
        owned_by: (mm.owned_by as string) ?? (mm.owner as string) ?? undefined,
        created: typeof mm.created === "number" ? mm.created : undefined,
        status: (mm.status as string) ?? "available",
        raw: mm,
      };
    });
  }

  // Ollama-style { models: [...] }
  const models = obj.models;
  if (Array.isArray(models)) {
    return models.map((m) => {
      const mm = m as Record<string, unknown>;
      return {
        id: String(mm.name ?? mm.model ?? mm.id ?? "unknown"),
        owned_by: "ollama",
        created: undefined,
        status: "available",
        raw: mm,
      };
    });
  }

  return [];
}

export async function testConnection(params: {
  apiKey: string;
  baseUrl: string;
  timeoutMs?: number;
}): Promise<TestResult> {
  const base = normalizeBase(params.baseUrl);
  const timeout = params.timeoutMs ?? 12000;

  // Basic URL validation
  try {
    new URL(base);
  } catch {
    return {
      success: false,
      latencyMs: 0,
      errorKind: "invalid_url",
      errorMessage: "The base URL is not valid. Include the protocol, e.g. https://api.openai.com/v1",
    };
  }

  let lastResult: TestResult | null = null;

  for (const suffix of DISCOVERY_SUFFIXES) {
    const url = `${base}${suffix}`;
    const started = performance.now();
    try {
      const res = await axios.get(url, {
        timeout,
        headers: params.apiKey
          ? {
              Authorization: `Bearer ${params.apiKey}`,
              "x-api-key": params.apiKey,
            }
          : undefined,
        validateStatus: () => true,
      });
      const latencyMs = performance.now() - started;
      const headers: Record<string, string> = {};
      Object.entries(res.headers || {}).forEach(([k, v]) => {
        headers[k] = String(v);
      });

      if (res.status >= 200 && res.status < 300) {
        const models = extractModels(res.data);
        const provider = detectProvider({ baseUrl: base, headers, raw: res.data });
        return {
          success: true,
          status: res.status,
          statusText: res.statusText,
          latencyMs,
          headers,
          raw: res.data,
          endpointUsed: url,
          models,
          provider,
        };
      }

      const classified = classifyError({
        isAxiosError: true,
        response: { status: res.status, data: res.data },
      } as unknown as AxiosError);

      lastResult = {
        success: false,
        status: res.status,
        statusText: res.statusText,
        latencyMs,
        headers,
        raw: res.data,
        endpointUsed: url,
        errorKind: classified.kind,
        errorMessage: classified.message,
      };

      // Auth errors mean the endpoint IS valid — stop discovery, surface immediately.
      if (res.status === 401 || res.status === 403 || res.status === 429) {
        return lastResult;
      }
      // else keep trying next suffix (likely 404 = wrong path)
    } catch (err) {
      const latencyMs = performance.now() - started;
      const classified = classifyError(err);
      lastResult = {
        success: false,
        latencyMs,
        errorKind: classified.kind,
        errorMessage: classified.message,
        status: classified.status,
        endpointUsed: url,
      };
      // network/timeout/dns/ssl errors are host-level — no point trying other suffixes
      if (["timeout", "network_error", "dns_error", "ssl_error", "invalid_url"].includes(classified.kind)) {
        return lastResult;
      }
    }
  }

  return (
    lastResult ?? {
      success: false,
      latencyMs: 0,
      errorKind: "unknown",
      errorMessage: "Could not reach any known models endpoint.",
    }
  );
}

export async function testChatCompletion(params: {
  apiKey: string;
  baseUrl: string;
  endpointUsed?: string;
  model: string;
  prompt: string;
  timeoutMs?: number;
}): Promise<ChatTestResult> {
  const base = normalizeBase(params.baseUrl);
  // Derive chat/completions endpoint from the models endpoint that succeeded
  let chatUrl: string;
  if (params.endpointUsed) {
    chatUrl = params.endpointUsed.replace(/\/models$/, "/chat/completions");
  } else {
    chatUrl = `${base}/chat/completions`;
  }

  const started = performance.now();
  try {
    const res = await axios.post(
      chatUrl,
      {
        model: params.model,
        messages: [{ role: "user", content: params.prompt }],
      },
      {
        timeout: params.timeoutMs ?? 30000,
        headers: {
          "Content-Type": "application/json",
          ...(params.apiKey
            ? { Authorization: `Bearer ${params.apiKey}`, "x-api-key": params.apiKey }
            : {}),
        },
        validateStatus: () => true,
      }
    );
    const latencyMs = performance.now() - started;

    if (res.status >= 200 && res.status < 300) {
      const data = res.data as Record<string, unknown>;
      const choices = data.choices as Array<Record<string, unknown>> | undefined;
      const first = choices?.[0];
      const message = first?.message as Record<string, unknown> | undefined;
      const content =
        (message?.content as string) ??
        (first?.text as string) ??
        undefined;
      const usage = data.usage as Record<string, unknown> | undefined;

      return {
        success: true,
        content: content ?? JSON.stringify(data),
        finishReason: (first?.finish_reason as string) ?? undefined,
        promptTokens: (usage?.prompt_tokens as number) ?? undefined,
        completionTokens: (usage?.completion_tokens as number) ?? undefined,
        totalTokens: (usage?.total_tokens as number) ?? undefined,
        latencyMs,
        raw: data,
      };
    }

    const classified = classifyError({
      isAxiosError: true,
      response: { status: res.status, data: res.data },
    } as unknown as AxiosError);

    return {
      success: false,
      latencyMs,
      errorMessage: classified.message,
      raw: res.data,
    };
  } catch (err) {
    const latencyMs = performance.now() - started;
    const classified = classifyError(err);
    return {
      success: false,
      latencyMs,
      errorMessage: classified.message,
    };
  }
}
