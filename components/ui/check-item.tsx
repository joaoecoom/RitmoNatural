"use client";

import { Check } from "lucide-react";

import { cn } from "@/lib/utils/cn";

export function CheckItem({
  title,
  description,
  checked = false,
}: {
  title: string;
  description: string;
  checked?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-4 rounded-[28px] border p-4 transition",
        checked
          ? "border-[rgba(143,167,136,0.26)] bg-[rgba(219,230,219,0.45)]"
          : "border-[rgba(15,26,20,0.06)] bg-[rgba(255,251,247,0.72)]",
      )}
    >
      <div
        className={cn(
          "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border transition",
          checked
            ? "border-[rgba(143,167,136,0.5)] bg-[#8ea788] text-white"
            : "border-[rgba(15,26,20,0.12)] bg-white text-transparent",
        )}
      >
        <Check className="size-3.5" />
      </div>

      <div>
        <p className="text-sm font-medium text-[#0F1A14]">{title}</p>
        <p className="mt-1 text-sm leading-7 text-[rgba(15,26,20,0.56)]">
          {description}
        </p>
      </div>
    </div>
  );
}
