"use client";

import { cn } from "@/lib/utils/cn";

export function SettingToggle({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      className="glass-surface flex w-full items-center justify-between gap-4 rounded-[28px] border border-[rgba(208,197,175,0.34)] px-5 py-5 text-left transition hover:border-[rgba(198,167,94,0.24)]"
      onClick={() => onChange(!checked)}
      type="button"
    >
      <div>
        <p className="text-[15px] font-semibold text-[#201B16]">{title}</p>
        <p className="mt-1 text-sm leading-7 text-[rgba(77,70,53,0.72)]">{description}</p>
      </div>

      <span
        aria-hidden="true"
        className={cn(
          "relative inline-flex h-8 w-14 shrink-0 rounded-full transition",
          checked ? "bg-[linear-gradient(180deg,#D4AF37,#C6A75E)]" : "bg-[rgba(32,27,22,0.10)]",
        )}
      >
        <span
          className={cn(
            "absolute top-1 size-6 rounded-full bg-white shadow-[0_10px_18px_rgba(32,27,22,0.16)] transition",
            checked ? "left-7" : "left-1",
          )}
        />
      </span>
    </button>
  );
}
