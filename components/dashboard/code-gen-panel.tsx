"use client";

import * as React from "react";
import { Copy, Code2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useConnectionStore } from "@/store/connection-store";
import { useCopy } from "@/hooks/use-copy";
import { genCurl, genFetch, genAxios, genPython } from "@/lib/code-gen";

export function CodeGenPanel() {
  const apiKey = useConnectionStore((s) => s.apiKey);
  const baseUrl = useConnectionStore((s) => s.baseUrl);
  const models = useConnectionStore((s) => s.models);
  const { copy, copied } = useCopy();
  const model = models[0]?.id;

  const snippets = {
    curl: genCurl(baseUrl, apiKey, model),
    fetch: genFetch(baseUrl, apiKey, model),
    axios: genAxios(baseUrl, apiKey, model),
    python: genPython(baseUrl, apiKey, model),
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code2 className="h-4 w-4 text-primary" />
          Code Generator
        </CardTitle>
        <CardDescription>Ready-to-copy snippets using your current key and base URL</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="curl">
          <TabsList>
            <TabsTrigger value="curl">cURL</TabsTrigger>
            <TabsTrigger value="fetch">JavaScript</TabsTrigger>
            <TabsTrigger value="axios">Axios</TabsTrigger>
            <TabsTrigger value="python">Python</TabsTrigger>
          </TabsList>
          {(Object.keys(snippets) as (keyof typeof snippets)[]).map((key) => (
            <TabsContent key={key} value={key}>
              <div className="relative">
                <pre className="max-h-96 overflow-auto scrollbar-thin rounded-md bg-muted/40 p-4 font-mono text-xs leading-relaxed">
                  {snippets[key]}
                </pre>
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute right-2 top-2"
                  onClick={() => copy(snippets[key], key)}
                >
                  <Copy className="h-3.5 w-3.5" />
                  {copied === key ? "Copied" : "Copy"}
                </Button>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
