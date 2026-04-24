import type {
  InputHTMLAttributes,
  PropsWithChildren,
  TextareaHTMLAttributes,
} from "react";

import { cn } from "@/lib/utils/cn";

export function Field({
  label,
  children,
  hint,
}: PropsWithChildren<{ label: string; hint?: string }>) {
  return (
    <label className="flex flex-col gap-2.5">
      <span className="text-sm font-medium tracking-[0.01em] text-[rgba(77,70,53,0.92)]">
        {label}
      </span>
      {children}
      {hint ? (
        <span className="text-xs leading-6 text-[rgba(108,97,78,0.82)]">{hint}</span>
      ) : null}
    </label>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-13 rounded-[22px] border border-[rgba(208,197,175,0.42)] bg-[rgba(255,248,245,0.86)] px-4 text-sm text-[#201B16] outline-none transition placeholder:text-[rgba(108,97,78,0.48)] focus:border-[rgba(198,167,94,0.40)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(198,167,94,0.07)]",
        props.className,
      )}
      {...props}
    />
  );
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-30 rounded-[24px] border border-[rgba(208,197,175,0.42)] bg-[rgba(255,248,245,0.86)] px-4 py-3.5 text-sm leading-7 text-[#201B16] outline-none transition placeholder:text-[rgba(108,97,78,0.48)] focus:border-[rgba(198,167,94,0.40)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(198,167,94,0.07)]",
        props.className,
      )}
      {...props}
    />
  );
}
