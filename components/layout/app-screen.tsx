import type { PropsWithChildren } from "react";

import { cn } from "@/lib/utils/cn";

export function AppScreen({
  children,
  className,
  contentClassName,
  centered = false,
  compact = false,
}: PropsWithChildren<{
  className?: string;
  contentClassName?: string;
  centered?: boolean;
  compact?: boolean;
}>) {
  return (
    <div className={cn("app-shell-background min-h-screen", className)}>
      <div
        className={cn(
          "premium-grid mx-auto flex min-h-screen w-full px-5 pb-10 pt-6 sm:px-6",
          centered ? "items-center justify-center" : "items-start justify-center",
        )}
      >
        <div
          className={cn(
            "screen-container screen-stack relative z-10",
            compact && "max-w-[460px]",
            contentClassName,
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
