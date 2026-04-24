import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

export function OptionCard({
  title,
  description,
  icon,
  selected = false,
  className,
  ...props
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  selected?: boolean;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "glass-surface flex w-full items-start gap-4 rounded-[28px] border px-5 py-5 text-left transition duration-200",
        selected
          ? "border-[rgba(198,167,94,0.44)] bg-[linear-gradient(180deg,rgba(255,248,245,0.96),rgba(248,236,228,0.92))] shadow-[0_16px_36px_rgba(198,167,94,0.12)]"
          : "border-[var(--line-soft)] hover:border-[rgba(198,167,94,0.22)] hover:bg-[rgba(255,248,245,0.95)]",
        className,
      )}
      type="button"
      {...props}
    >
      {icon ? (
        <div
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-full",
            selected ? "bg-[rgba(198,167,94,0.16)]" : "bg-[rgba(32,27,22,0.04)]",
          )}
        >
          {icon}
        </div>
      ) : null}

      <div>
        <p className="text-[15px] font-semibold text-[#201B16]">{title}</p>
        {description ? (
          <p className="mt-1 text-sm leading-7 text-[rgba(77,70,53,0.72)]">
            {description}
          </p>
        ) : null}
      </div>
    </button>
  );
}
