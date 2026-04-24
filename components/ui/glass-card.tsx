import type { HTMLAttributes, PropsWithChildren } from "react";

import { cn } from "@/lib/utils/cn";

export function GlassCard({
  children,
  className,
  ...props
}: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div
      className={cn(
        "glass-surface rounded-[32px] border border-[rgba(208,197,175,0.42)] p-6 shadow-[var(--shadow-soft)]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
