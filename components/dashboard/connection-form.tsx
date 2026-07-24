"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useConnectionStore } from "@/store/connection-store";
import { useTestConnection } from "@/hooks/use-test-connection";
import { connectionFormSchema } from "@/lib/schemas";

const PRESETS = [
  { label: "OpenAI", url: "https://api.openai.com" },
  { label: "Groq", url: "https://api.groq.com/openai" },
  { label: "DeepSeek", url: "https://api.deepseek.com" },
  { label: "OpenRouter", url: "https://openrouter.ai/api" },
  { label: "Ollama (local)", url: "http://localhost:11434" },
  { label: "LM Studio (local)", url: "http://localhost:1234" },
];

export function ConnectionForm() {
  const apiKey = useConnectionStore((s) => s.apiKey);
  const baseUrl = useConnectionStore((s) => s.baseUrl);
  const setApiKey = useConnectionStore((s) => s.setApiKey);
  const setBaseUrl = useConnectionStore((s) => s.setBaseUrl);
  const [showKey, setShowKey] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { mutate, isPending } = useTestConnection();

  const handleTest = () => {
    const parsed = connectionFormSchema.safeParse({ apiKey, baseUrl });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setError(null);
    mutate({ apiKey: parsed.data.apiKey ?? "", baseUrl: parsed.data.baseUrl });
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b bg-gradient-to-br from-primary/5 to-transparent">
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          Connection
        </CardTitle>
        <CardDescription>
          Keys are stored only in this browser&apos;s local storage — never sent to any backend but the endpoint you test.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-5">
        <div className="space-y-1.5">
          <Label htmlFor="apiKey">API Key</Label>
          <div className="relative">
            <Input
              id="apiKey"
              type={showKey ? "text" : "password"}
              placeholder="sk-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="pr-10 font-mono"
              autoComplete="off"
            />
            <button
              type="button"
              onClick={() => setShowKey((s) => !s)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={showKey ? "Hide key" : "Show key"}
            >
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="baseUrl">Base URL</Label>
          <Input
            id="baseUrl"
            placeholder="https://api.openai.com"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            className="font-mono"
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => setBaseUrl(p.url)}
              className="rounded-full border border-border bg-secondary/50 px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {p.label}
            </button>
          ))}
        </div>

        <motion.div whileTap={{ scale: 0.98 }}>
          <Button className="w-full" size="lg" onClick={handleTest} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Testing connection…
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                Test Connection
              </>
            )}
          </Button>
        </motion.div>
      </CardContent>
    </Card>
  );
}
