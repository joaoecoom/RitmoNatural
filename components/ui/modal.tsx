import type { PropsWithChildren } from "react";

import { cn } from "@/lib/utils/cn";

export function Modal({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <div className="rounded-[34px] border border-[rgba(15,26,20,0.06)] bg-[rgba(255,251,247,0.94)] p-6 shadow-[0_24px_60px_rgba(15,26,20,0.10)] backdrop-blur sm:p-7">
      <div className={cn("fade-up", className)}>{children}</div>
    </div>
  );
}
