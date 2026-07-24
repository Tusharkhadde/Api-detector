"use client";

import * as React from "react";
import { Search, Copy, Boxes, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { useConnectionStore } from "@/store/connection-store";
import { useCopy } from "@/hooks/use-copy";
import { formatDate, downloadFile, toCSV } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export function ModelTable() {
  const models = useConnectionStore((s) => s.models);
  const [query, setQuery] = React.useState("");
  const { copy } = useCopy();

  const filtered = models.filter(
    (m) =>
      m.id.toLowerCase().includes(query.toLowerCase()) ||
      (m.owned_by ?? "").toLowerCase().includes(query.toLowerCase())
  );

  const handleExport = (format: "json" | "csv" | "txt") => {
    if (format === "json") {
      downloadFile("models.json", JSON.stringify(models, null, 2), "application/json");
    } else if (format === "csv") {
      downloadFile(
        "models.csv",
        toCSV(models.map((m) => ({ id: m.id, owned_by: m.owned_by ?? "", created: m.created ?? "", status: m.status ?? "" }))),
        "text/csv"
      );
    } else {
      downloadFile("models.txt", models.map((m) => m.id).join("\n"), "text/plain");
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Boxes className="h-4 w-4 text-primary" />
            Models
          </CardTitle>
          <CardDescription>{models.length} model(s) discovered</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search models…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-48 pl-8"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={models.length === 0}>
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
        </div>
      </CardHeader>
      <CardContent>
        {models.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <Boxes className="h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm font-medium">No models yet</p>
            <p className="max-w-xs text-xs text-muted-foreground">
              Run a connection test from the Overview tab to discover available models.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Model</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Copy</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-mono text-xs font-medium">{m.id}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{m.owned_by ?? "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {m.created ? formatDate(m.created * 1000) : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="success" className="capitalize">
                      {m.status ?? "available"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => copy(m.id, m.id)}>
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                    No models match &quot;{query}&quot;
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
