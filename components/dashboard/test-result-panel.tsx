"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Server,
  AlertTriangle,
  ChevronDown,
  Copy,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useConnectionStore } from "@/store/connection-store";
import { CompatibilityBadge } from "@/components/dashboard/compatibility-badge";
import { LatencyWave } from "@/components/dashboard/latency-wave";
import { formatMs } from "@/lib/utils";
import { ERROR_LABELS } from "@/lib/errors";
import { useCopy } from "@/hooks/use-copy";
import { cn } from "@/lib/utils";

export function TestResultPanel({ isPending }: { isPending: boolean }) {
  const result = useConnectionStore((s) => s.lastResult);
  const provider = useConnectionStore((s) => s.provider);
  const { copy, copied } = useCopy();
  const [showHeaders, setShowHeaders] = React.useState(false);
  const [showRaw, setShowRaw] = React.useState(true);

  if (isPending) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">Running diagnostics…</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!result) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center gap-2 py-16 text-center">
          <Server className="h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm font-medium">No test run yet</p>
          <p className="max-w-xs text-xs text-muted-foreground">
            Enter your API key and base URL, then hit Test Connection to see status, latency, and discovered models.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <Card className={cn("overflow-hidden", result.success ? "status-glow-success" : "status-glow-error")}>
        <CardHeader className="flex flex-row items-center justify-between border-b space-y-0">
          <div className="flex items-center gap-2">
            {result.success ? (
              <CheckCircle2 className="h-5 w-5 text-success" />
            ) : (
              <XCircle className="h-5 w-5 text-destructive" />
            )}
            <CardTitle className="text-base">
              {result.success ? "Connection successful" : "Connection failed"}
            </CardTitle>
          </div>
          {provider && <CompatibilityBadge provider={provider} />}
        </CardHeader>
        <CardContent className="space-y-5 pt-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Status" value={result.status ? String(result.status) : "—"} icon={<Server className="h-3.5 w-3.5" />} />
            <Stat label="Latency" value={formatMs(result.latencyMs)} icon={<Clock className="h-3.5 w-3.5" />} />
            <Stat label="Models" value={String(result.models?.length ?? 0)} icon={<Server className="h-3.5 w-3.5" />} />
            <Stat
              label="Endpoint"
              value={result.endpointUsed ? new URL(result.endpointUsed).pathname : "—"}
              icon={<Server className="h-3.5 w-3.5" />}
              mono
            />
          </div>

          <div>
            <LatencyWave latencyMs={result.latencyMs} success={result.success} />
          </div>

          {!result.success && result.errorKind && (
            <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="destructive">{ERROR_LABELS[result.errorKind]}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{result.errorMessage}</p>
              </div>
            </div>
          )}

          {result.headers && (
            <div className="rounded-md border">
              <button
                onClick={() => setShowHeaders((s) => !s)}
                className="flex w-full items-center justify-between px-3 py-2 text-sm font-medium"
              >
                Response headers ({Object.keys(result.headers).length})
                <ChevronDown className={cn("h-4 w-4 transition-transform", showHeaders && "rotate-180")} />
              </button>
              <AnimatePresence>
                {showHeaders && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-t"
                  >
                    <div className="max-h-56 overflow-y-auto scrollbar-thin p-3 font-mono text-xs">
                      {Object.entries(result.headers).map(([k, v]) => (
                        <div key={k} className="flex gap-2 py-0.5">
                          <span className="text-muted-foreground">{k}:</span>
                          <span className="break-all">{v}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {result.raw !== undefined && (
            <div className="rounded-md border">
              <button
                onClick={() => setShowRaw((s) => !s)}
                className="flex w-full items-center justify-between px-3 py-2 text-sm font-medium"
              >
                Raw JSON response
                <div className="flex items-center gap-2">
                  <span
                    role="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      copy(JSON.stringify(result.raw, null, 2), "raw");
                    }}
                    className="rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </span>
                  <ChevronDown className={cn("h-4 w-4 transition-transform", showRaw && "rotate-180")} />
                </div>
              </button>
              <AnimatePresence>
                {showRaw && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-t"
                  >
                    <pre className="max-h-80 overflow-auto scrollbar-thin bg-muted/40 p-3 font-mono text-xs leading-relaxed">
                      {JSON.stringify(result.raw, null, 2)}
                    </pre>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
          {copied === "raw" && null}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function Stat({ label, value, icon, mono }: { label: string; value: string; icon: React.ReactNode; mono?: boolean }) {
  return (
    <div className="rounded-md border bg-muted/30 p-2.5">
      <div className="mb-1 flex items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className={cn("truncate text-sm font-semibold", mono && "font-mono text-xs font-medium")} title={value}>
        {value}
      </div>
    </div>
  );
}
