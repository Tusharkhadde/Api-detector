"use client";

import { motion } from "framer-motion";
import { History, Trash2, Download, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useHistoryStore } from "@/store/history-store";
import { formatDate, formatMs, downloadFile, toCSV } from "@/lib/utils";
import { CompatibilityBadge } from "@/components/dashboard/compatibility-badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export function HistoryPanel() {
  const entries = useHistoryStore((s) => s.entries);
  const remove = useHistoryStore((s) => s.remove);
  const clear = useHistoryStore((s) => s.clear);

  const handleExport = (format: "json" | "csv" | "txt") => {
    if (format === "json") {
      downloadFile("history.json", JSON.stringify(entries, null, 2), "application/json");
    } else if (format === "csv") {
      downloadFile(
        "history.csv",
        toCSV(
          entries.map((e) => ({
            timestamp: new Date(e.timestamp).toISOString(),
            baseUrl: e.baseUrl,
            success: e.success,
            latencyMs: Math.round(e.latencyMs),
            modelCount: e.modelCount,
            provider: e.provider ?? "",
          }))
        ),
        "text/csv"
      );
    } else {
      downloadFile(
        "history.txt",
        entries
          .map(
            (e) =>
              `${formatDate(e.timestamp)} | ${e.baseUrl} | ${e.success ? "SUCCESS" : "FAILED"} | ${Math.round(
                e.latencyMs
              )}ms | ${e.modelCount} models`
          )
          .join("\n"),
        "text/plain"
      );
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2">
            <History className="h-4 w-4 text-primary" />
            Request History
          </CardTitle>
          <CardDescription>{entries.length} recorded test(s), stored locally</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={entries.length === 0}>
                <Download className="h-3.5 w-3.5" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport("json")}>Export as JSON</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("csv")}>Export as CSV</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("txt")}>Export as TXT</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm" onClick={clear} disabled={entries.length === 0}>
            <Trash2 className="h-3.5 w-3.5" />
            Clear
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <History className="h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm font-medium">No history yet</p>
            <p className="max-w-xs text-xs text-muted-foreground">
              Every connection test you run is recorded here, locally in your browser.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((e) => (
              <motion.div
                key={e.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col gap-2 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {e.success ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                  ) : (
                    <XCircle className="h-4 w-4 shrink-0 text-destructive" />
                  )}
                  <div className="min-w-0">
                    <p className="truncate font-mono text-xs font-medium">{e.baseUrl}</p>
                    <p className="text-[11px] text-muted-foreground">{formatDate(e.timestamp)}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {e.provider && <CompatibilityBadge provider={e.provider} />}
                  <Badge variant="outline">{formatMs(e.latencyMs)}</Badge>
                  <Badge variant="outline">{e.modelCount} models</Badge>
                  <Button variant="ghost" size="icon" onClick={() => remove(e.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
