"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/section-card";
import { saveScheduleAction } from "@/features/schedule/server/actions";
import { formatTimeHm } from "@/lib/utils/today-date";

function hm(value: string | null | undefined) {
  if (!value) {
    return "";
  }
  return formatTimeHm(value);
}

export function ScheduleForm({ initial }: { initial: Record<string, string> | null }) {
  const [state, action, pending] = useActionState(saveScheduleAction, null);

  return (
    <SectionCard
      description="Estes horarios guiam as sugestoes do plano diario e futuros lembretes."
      eyebrow="Rotina"
      title="Os teus horarios"
    >
      <form action={action} className="grid gap-4 sm:grid-cols-2">
        {(
          [
            ["wake_time", "Acordar"],
            ["breakfast_time", "Pequeno-almoco"],
            ["lunch_time", "Almoco"],
            ["snack_time", "Lanche"],
            ["dinner_time", "Jantar"],
            ["sleep_time", "Dormir"],
          ] as const
        ).map(([name, label]) => (
          <label className="grid gap-1.5 text-sm" key={name}>
            <span className="font-medium text-[rgba(15,26,20,0.72)]">{label}</span>
            <input
              className="h-12 rounded-[18px] border border-[rgba(15,26,20,0.08)] bg-[rgba(255,251,247,0.92)] px-3 text-[#201B16] outline-none focus:border-[rgba(198,167,94,0.45)]"
              defaultValue={hm(initial?.[name])}
              name={name}
              required
              type="time"
            />
          </label>
        ))}

        {state && "message" in state && state.message ? (
          <p className="sm:col-span-2 text-sm text-[rgba(15,26,20,0.58)]">{state.message}</p>
        ) : null}

        <div className="sm:col-span-2">
          <Button disabled={pending} size="lg" type="submit" variant="gold">
            {pending ? "A guardar..." : "Guardar horarios"}
          </Button>
        </div>
      </form>
    </SectionCard>
  );
}
