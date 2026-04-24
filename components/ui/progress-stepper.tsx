import { cn } from "@/lib/utils/cn";

export function ProgressStepper({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.24em] text-[rgba(77,70,53,0.48)]">
        <span>Passo {currentStep} de {totalSteps}</span>
        <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
      </div>
      <div className="grid grid-cols-1 gap-2">
        <div className="h-[3px] w-full overflow-hidden rounded-full bg-[rgba(32,27,22,0.08)]">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,#D4AF37,#C6A75E)] transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
        <div className="grid grid-cols-[repeat(var(--steps),minmax(0,1fr))] gap-2" style={{ ["--steps" as string]: totalSteps }}>
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div
              className={cn(
                "h-[3px] rounded-full transition-all",
                index < currentStep ? "bg-[rgba(115,92,0,0.82)]" : "bg-[rgba(32,27,22,0.08)]",
              )}
              key={index}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
