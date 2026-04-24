import type { HTMLAttributes, PropsWithChildren } from "react";

import { cn } from "@/lib/utils/cn";

interface CardProps extends PropsWithChildren, HTMLAttributes<HTMLDivElement> {
  tone?: "default" | "soft" | "dark";
}

const toneStyles = {
  default:
    "border-[rgba(208,197,175,0.28)] bg-[rgba(255,248,245,0.86)] shadow-[0_14px_30px_rgba(32,27,22,0.05)]",
  soft:
    "border-[rgba(208,197,175,0.34)] bg-[linear-gradient(180deg,rgba(255,248,245,0.96),rgba(248,236,228,0.92))] shadow-[0_18px_42px_rgba(32,27,22,0.06)]",
  dark:
    "border-[rgba(255,255,255,0.08)] bg-[linear-gradient(180deg,#201B16,#0F1A14)] text-white shadow-[0_18px_44px_rgba(15,26,20,0.18)]",
};

export function Card({
  children,
  className,
  tone = "default",
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[30px] border p-6 backdrop-blur sm:p-7",
        toneStyles[tone],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
