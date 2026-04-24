import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

import { cn } from "@/lib/utils/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "gold";

interface ButtonProps
  extends PropsWithChildren,
    ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
  size?: "md" | "lg";
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-[#0F1A14] text-[#FFF8F5] shadow-[0_16px_40px_rgba(15,26,20,0.14)] hover:-translate-y-0.5 hover:bg-[#17231d]",
  secondary:
    "glass-surface text-[#201B16] ring-1 ring-[rgba(32,27,22,0.06)] hover:bg-[rgba(255,248,245,0.96)]",
  ghost:
    "bg-transparent text-[rgba(77,70,53,0.78)] shadow-none hover:bg-[rgba(255,248,245,0.64)] hover:text-[#201B16]",
  gold:
    "bg-[linear-gradient(180deg,#D4AF37,#C6A75E)] text-[#201B16] shadow-[0_16px_34px_rgba(198,167,94,0.22)] hover:-translate-y-0.5 hover:brightness-[1.02]",
};

const sizeStyles = {
  md: "min-h-12 px-5 py-3 text-sm",
  lg: "min-h-14 px-6 py-4 text-[15px]",
};

export function Button({
  children,
  className,
  variant = "primary",
  fullWidth = false,
  size = "md",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-full font-semibold tracking-[0.01em] transition duration-200 disabled:cursor-not-allowed disabled:opacity-50",
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
