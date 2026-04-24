import { cn } from "@/lib/utils/cn";

export function ProgressBar({
  value,
  className,
  tone = "gold",
}: {
  value: number;
  className?: string;
  tone?: "gold" | "green";
}) {
  const width = Math.max(0, Math.min(100, value));

  return (
    <div
      className={cn(
        "h-3 w-full overflow-hidden rounded-full bg-[rgba(15,26,20,0.08)]",
        className,
      )}
    >
      <div
        className={cn(
          "h-full rounded-full transition-all duration-500",
          tone === "gold"
            ? "bg-[linear-gradient(90deg,#D7BC79,#C6A75E)]"
            : "bg-[linear-gradient(90deg,#A7BDA1,#6B8B70)]",
        )}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
