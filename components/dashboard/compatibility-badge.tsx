import { ProviderId } from "@/types";
import { PROVIDERS } from "@/lib/providers";
import { cn } from "@/lib/utils";

export function CompatibilityBadge({ provider, className }: { provider: ProviderId | null; className?: string }) {
  const info = PROVIDERS[provider ?? "unknown"];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        className
      )}
      style={{ borderColor: info.color, color: info.color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: info.color }} />
      {info.label}
    </span>
  );
}
