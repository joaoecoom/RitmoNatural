import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

export function BrandHeader({
  eyebrow = "Ritmo Natural",
  title,
  description,
  align = "left",
  trailing,
  tone = "default",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  trailing?: ReactNode;
  tone?: "default" | "light";
}) {
  return (
    <div
      className={cn(
        "flex gap-4",
        align === "center"
          ? "flex-col items-center text-center"
          : "items-start justify-between text-left",
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        <p className={cn("eyebrow", tone === "light" && "text-[rgba(255,248,245,0.58)]")}>
          {eyebrow}
        </p>
        <h1
          className={cn(
            "font-display mt-4 text-[2.6rem] font-semibold leading-[0.95] sm:text-[3.35rem]",
            tone === "light" ? "text-[#FFF8F5]" : "text-[#201B16]",
          )}
        >
          {title}
        </h1>
        {description ? (
          <p
            className={cn(
              "mt-4 max-w-xl text-[15px] leading-8",
              tone === "light"
                ? "text-[rgba(255,248,245,0.74)]"
                : "text-[rgba(77,70,53,0.78)]",
            )}
          >
            {description}
          </p>
        ) : null}
      </div>

      {trailing ? <div className="shrink-0">{trailing}</div> : null}
    </div>
  );
}
