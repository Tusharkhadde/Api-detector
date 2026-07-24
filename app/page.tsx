"use client";

import { LayoutDashboard, Boxes, MessageSquare, Code2, History } from "lucide-react";
import { Header } from "@/components/layout/header";
import { ConnectionForm } from "@/components/dashboard/connection-form";
import { TestResultPanel } from "@/components/dashboard/test-result-panel";
import { ModelTable } from "@/components/dashboard/model-table";
import { ChatTestPanel } from "@/components/dashboard/chat-test-panel";
import { CodeGenPanel } from "@/components/dashboard/code-gen-panel";
import { HistoryPanel } from "@/components/dashboard/history-panel";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useConnectionStore } from "@/store/connection-store";

export default function Home() {
  const isPending = useConnectionStore((s) => s.isTesting);

  return (
    <div className="min-h-screen bg-grid">
      <Header />
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6">
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">
              <LayoutDashboard className="h-3.5 w-3.5" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="models">
              <Boxes className="h-3.5 w-3.5" />
              Models
            </TabsTrigger>
            <TabsTrigger value="chat">
              <MessageSquare className="h-3.5 w-3.5" />
              Chat Test
            </TabsTrigger>
            <TabsTrigger value="code">
              <Code2 className="h-3.5 w-3.5" />
              Code
            </TabsTrigger>
            <TabsTrigger value="history">
              <History className="h-3.5 w-3.5" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
              <ConnectionForm />
              <TestResultPanel isPending={isPending} />
            </div>
          </TabsContent>

          <TabsContent value="models">
            <ModelTable />
          </TabsContent>

          <TabsContent value="chat">
            <ChatTestPanel />
          </TabsContent>

          <TabsContent value="code">
            <CodeGenPanel />
          </TabsContent>

          <TabsContent value="history">
            <HistoryPanel />
          </TabsContent>
        </Tabs>
      </main>
      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        API Inspector — all data stays local to your browser. No accounts, no backend storage.
      </footer>
    </div>
  );
}
