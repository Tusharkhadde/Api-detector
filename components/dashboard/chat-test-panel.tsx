"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Loader2, Send, MessageSquare, Clock, Hash } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useConnectionStore } from "@/store/connection-store";
import { useChatTest } from "@/hooks/use-chat-test";
import { formatMs } from "@/lib/utils";

export function ChatTestPanel() {
  const apiKey = useConnectionStore((s) => s.apiKey);
  const baseUrl = useConnectionStore((s) => s.baseUrl);
  const models = useConnectionStore((s) => s.models);
  const endpointUsed = useConnectionStore((s) => s.endpointUsed);
  const [model, setModel] = React.useState<string>("");
  const [prompt, setPrompt] = React.useState("Say hello in one short sentence.");
  const { mutate, data, isPending } = useChatTest();

  React.useEffect(() => {
    if (!model && models[0]) setModel(models[0].id);
  }, [models, model]);

  const handleSend = () => {
    if (!model || !prompt.trim()) return;
    mutate({ apiKey, baseUrl, endpointUsed: endpointUsed ?? undefined, model, prompt });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" />
          Chat Test
        </CardTitle>
        <CardDescription>Send a single prompt through POST /chat/completions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {models.length === 0 ? (
          <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
            Run a connection test first to load available models.
          </p>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Model</Label>
                <Select value={model} onValueChange={setModel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Prompt</Label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Type a test prompt…"
              />
            </div>

            <motion.div whileTap={{ scale: 0.98 }}>
              <Button onClick={handleSend} disabled={isPending || !model}>
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Send prompt
              </Button>
            </motion.div>

            {data && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3 rounded-md border p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={data.success ? "success" : "destructive"}>
                    {data.success ? "Success" : "Failed"}
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <Clock className="h-3 w-3" /> {formatMs(data.latencyMs)}
                  </Badge>
                  {data.finishReason && <Badge variant="outline">finish: {data.finishReason}</Badge>}
                  {typeof data.totalTokens === "number" && (
                    <Badge variant="outline" className="gap-1">
                      <Hash className="h-3 w-3" /> {data.totalTokens} tokens
                      {typeof data.promptTokens === "number" && typeof data.completionTokens === "number"
                        ? ` (${data.promptTokens} in / ${data.completionTokens} out)`
                        : ""}
                    </Badge>
                  )}
                </div>
                {data.success ? (
                  <p className="whitespace-pre-wrap rounded-md bg-muted/40 p-3 text-sm">{data.content}</p>
                ) : (
                  <p className="text-sm text-destructive">{data.errorMessage}</p>
                )}
              </motion.div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
