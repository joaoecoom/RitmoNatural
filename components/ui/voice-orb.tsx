import { cn } from "@/lib/utils/cn";

export function VoiceOrb({
  size = "md",
  label = "A Voz",
  className,
}: {
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
}) {
  const sizeStyles = {
    sm: "size-18 text-[11px]",
    md: "size-24 text-[12px]",
    lg: "size-32 text-[13px]",
  };

  const innerStyles = {
    sm: "size-10",
    md: "size-14",
    lg: "size-18",
  };

  return (
    <div
      className={cn(
        "soft-orb mx-auto flex items-center justify-center rounded-full bg-[radial-gradient(circle,_rgba(255,255,255,0.92),_rgba(212,175,55,0.20)_60%,_transparent_72%)] shadow-[0_24px_48px_rgba(198,167,94,0.14)]",
        sizeStyles[size],
        className,
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center rounded-full bg-[linear-gradient(180deg,#201B16,#0F1A14)] text-[#FFF8F5] shadow-[0_14px_30px_rgba(15,26,20,0.24)]",
          innerStyles[size],
        )}
      >
        {label}
      </div>
    </div>
  );
}
