"use client";

import { Radar } from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useConnectionStore } from "@/store/connection-store";
import { cn } from "@/lib/utils";

export function Header() {
  const lastResult = useConnectionStore((s) => s.lastResult);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Radar className="h-4.5 w-4.5" />
            <span
              className={cn(
                "absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-background",
                lastResult == null && "bg-muted-foreground/50",
                lastResult?.success && "bg-success",
                lastResult && !lastResult.success && "bg-destructive"
              )}
            />
          </div>
          <div className="leading-tight">
            <h1 className="font-mono text-sm font-semibold tracking-tight sm:text-base">
              API Inspector
            </h1>
            <p className="hidden text-[11px] text-muted-foreground sm:block">
              Verify AI keys &amp; endpoints — no Postman required
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="hidden text-xs text-muted-foreground hover:text-foreground sm:inline"
          >
            Keys never leave your browser
          </a>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
