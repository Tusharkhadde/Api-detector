export type ProviderId =
  | "openai"
  | "anthropic"
  | "gemini"
  | "azure-openai"
  | "openrouter"
  | "groq"
  | "deepseek"
  | "together"
  | "ollama"
  | "lmstudio"
  | "unknown";

export interface ProviderInfo {
  id: ProviderId;
  label: string;
  color: string;
}

export interface ModelInfo {
  id: string;
  owned_by?: string;
  created?: number;
  status?: string;
  raw?: Record<string, unknown>;
}

export type ErrorKind =
  | "unauthorized"
  | "forbidden"
  | "rate_limited"
  | "server_error"
  | "network_error"
  | "invalid_url"
  | "timeout"
  | "ssl_error"
  | "dns_error"
  | "unsupported_format"
  | "not_found"
  | "unknown";

export interface TestResult {
  success: boolean;
  status?: number;
  statusText?: string;
  latencyMs: number;
  errorKind?: ErrorKind;
  errorMessage?: string;
  headers?: Record<string, string>;
  raw?: unknown;
  endpointUsed?: string;
  models?: ModelInfo[];
  provider?: ProviderId;
}

export interface HistoryEntry {
  id: string;
  timestamp: number;
  baseUrl: string;
  success: boolean;
  latencyMs: number;
  modelCount: number;
  endpointUsed?: string;
  provider?: ProviderId;
  errorMessage?: string;
}

export interface ChatTestResult {
  success: boolean;
  content?: string;
  finishReason?: string;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  latencyMs: number;
  errorMessage?: string;
  raw?: unknown;
}
