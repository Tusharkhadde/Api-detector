import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/components/query-provider";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "API Inspector — Verify AI API keys & endpoints",
  description:
    "Test AI API keys and OpenAI-compatible endpoints instantly. No Postman, no backend, no account — everything stays in your browser.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <QueryProvider>
            {children}
            <Toaster richColors position="bottom-right" theme="system" />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
