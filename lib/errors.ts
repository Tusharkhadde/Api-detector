import { ErrorKind } from "@/types";

export const ERROR_LABELS: Record<ErrorKind, string> = {
  unauthorized: "Unauthorized",
  forbidden: "Forbidden",
  rate_limited: "Rate Limited",
  server_error: "Server Error",
  network_error: "Network Error",
  invalid_url: "Invalid URL",
  timeout: "Timeout",
  ssl_error: "SSL Error",
  dns_error: "DNS Error",
  unsupported_format: "Unsupported Format",
  not_found: "Not Found",
  unknown: "Error",
};
