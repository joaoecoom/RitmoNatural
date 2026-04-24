"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/input-field";
import { SectionCard } from "@/components/ui/section-card";
import { saveGoalsAction } from "@/features/goals/server/actions";
import type { GoalRow } from "@/features/goals/server/queries";

const OPTIONS = [
  { value: "Perder peso com calma", label: "Perder peso com calma" },
  { value: "Desinchar barriga", label: "Desinchar barriga" },
  { value: "Ter mais energia", label: "Ter mais energia" },
  { value: "Controlar alimentacao", label: "Controlar alimentacao" },
  { value: "Reduzir stress", label: "Reduzir stress" },
];

export function GoalsForm({
  initial,
  profileFallback,
}: {
  initial: GoalRow | null;
  profileFallback: string | null;
}) {
  const [state, action, pending] = useActionState(saveGoalsAction, null);
  const primary = initial?.primary_goal ?? profileFallback ?? OPTIONS[0].value;

  return (
    <SectionCard
      description="Isto guia o tom da app e o que a Voz te sugere ao longo da semana."
      eyebrow="Objetivos"
      title="O que queres sentir nesta fase?"
    >
      <form action={action} className="grid gap-5">
        <div className="grid gap-3">
          <p className="text-sm font-medium text-[rgba(15,26,20,0.72)]">Objetivo principal</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className="flex cursor-pointer items-center gap-3 rounded-[22px] border border-[rgba(15,26,20,0.08)] bg-[rgba(255,251,247,0.78)] px-4 py-3 text-sm ring-1 ring-transparent has-[:checked]:border-[rgba(198,167,94,0.45)] has-[:checked]:ring-[rgba(198,167,94,0.25)]"
              >
                <input
                  defaultChecked={primary === opt.value}
                  name="primary_goal"
                  type="radio"
                  value={opt.value}
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <InputField
            defaultValue={initial?.target_weight ?? ""}
            label="Meta de peso (opcional, kg)"
            min={0}
            name="target_weight"
            step="0.1"
            type="number"
          />
          <InputField
            defaultValue={initial?.deadline ?? ""}
            label="Prazo (opcional)"
            name="deadline"
            type="date"
          />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium text-[rgba(15,26,20,0.72)]" htmlFor="emotional_reason">
            Motivo emocional (opcional)
          </label>
          <textarea
            className="min-h-[120px] w-full rounded-[22px] border border-[rgba(15,26,20,0.08)] bg-[rgba(255,251,247,0.92)] px-4 py-3 text-sm text-[#201B16] outline-none ring-0 focus:border-[rgba(198,167,94,0.45)]"
            defaultValue={initial?.emotional_reason ?? ""}
            id="emotional_reason"
            name="emotional_reason"
            placeholder="Ex.: quero voltar a confiar no meu corpo sem me culpar."
          />
        </div>

        {state && "message" in state && state.message ? (
          <p
            className={
              state.ok
                ? "text-sm text-[rgba(15,26,20,0.58)]"
                : "text-sm text-[rgba(139,69,19,0.92)]"
            }
          >
            {state.message}
          </p>
        ) : null}

        <Button disabled={pending} size="lg" type="submit" variant="gold">
          {pending ? "A guardar..." : "Guardar objetivos"}
        </Button>
      </form>
    </SectionCard>
  );
}
