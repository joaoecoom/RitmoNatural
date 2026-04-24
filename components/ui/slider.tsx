"use client";

import { cn } from "@/lib/utils/cn";

export function Slider({
  label,
  value,
  onValueChange,
  min = 1,
  max = 10,
  name,
  hint,
}: {
  label: string;
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  name?: string;
  hint?: string;
}) {
  return (
    <div className="rounded-[28px] border border-[rgba(15,26,20,0.06)] bg-[rgba(255,251,247,0.72)] p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[rgba(15,26,20,0.82)]">{label}</p>
          {hint ? (
            <p className="mt-1 text-xs leading-6 text-[rgba(15,26,20,0.48)]">{hint}</p>
          ) : null}
        </div>

        <div
          className={cn(
            "min-w-12 rounded-full px-3 py-1.5 text-center text-sm font-medium",
            value >= 7
              ? "bg-[rgba(198,167,94,0.18)] text-[#0F1A14]"
              : "bg-[rgba(15,26,20,0.06)] text-[rgba(15,26,20,0.72)]",
          )}
        >
          {value}
        </div>
      </div>

      <input
        className="range-input"
        max={max}
        min={min}
        name={name}
        type="range"
        value={value}
        onChange={(event) => onValueChange(Number(event.target.value))}
      />

      <div className="mt-3 flex justify-between text-[11px] tracking-[0.08em] text-[rgba(15,26,20,0.34)]">
        <span>baixo</span>
        <span>alto</span>
      </div>
    </div>
  );
}
