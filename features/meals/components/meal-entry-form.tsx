"use client";

import { useActionState } from "react";
import { Camera, Plus, Sparkles, UtensilsCrossed } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { SectionCard } from "@/components/ui/section-card";
import {
  submitMealEntryAction,
  type MealActionState,
} from "@/features/meals/server/actions";

const initialState: MealActionState = {
  success: false,
  message: "",
};

export function MealEntryForm() {
  const [state, action, pending] = useActionState(submitMealEntryAction, initialState);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.03fr_0.97fr]">
      <SectionCard
        description="Regista de forma simples o que comeste e recebe uma leitura leve, sem linguagem pesada."
        eyebrow="Alimentacao"
        title="O que comeste hoje?"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-[26px] border border-[rgba(15,26,20,0.06)] bg-[rgba(255,251,247,0.74)] p-5">
            <div className="flex size-11 items-center justify-center rounded-full bg-[rgba(198,167,94,0.14)]">
              <UtensilsCrossed className="size-5 text-[#0F1A14]" />
            </div>
            <p className="mt-4 text-base font-medium text-[#0F1A14]">
              Olhamos para contexto, saciedade e previsibilidade.
            </p>
          </div>
          <div className="rounded-[26px] border border-[rgba(15,26,20,0.06)] bg-[rgba(255,251,247,0.74)] p-5">
            <div className="flex size-11 items-center justify-center rounded-full bg-[rgba(233,205,191,0.24)]">
              <Sparkles className="size-5 text-[#0F1A14]" />
            </div>
            <p className="mt-4 text-base font-medium text-[#0F1A14]">
              Pequenos ajustes valem mais do que perfeicao.
            </p>
          </div>
        </div>

        <form action={action} className="mt-8 space-y-5">
          <Field label="Refeicao">
            <Textarea
              name="meal_text"
              placeholder="Ex.: tosta com queijo, iogurte e cafe a meio da tarde."
              required
            />
          </Field>

          <Field label="Foto da refeicao">
            <Input
              accept="image/*"
              className="file:mr-3 file:rounded-full file:border-0 file:bg-[rgba(198,167,94,0.16)] file:px-4 file:py-2 file:text-sm file:text-[#0F1A14]"
              name="meal_photo"
              type="file"
            />
            <p className="mt-2 text-sm text-[rgba(15,26,20,0.48)]">
              Podes escrever, enviar foto ou usar os dois para dar mais contexto.
            </p>
          </Field>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button disabled={pending} size="lg" type="submit" variant="gold">
              <Plus className="mr-2 size-4" />
              {pending ? "A guardar..." : "Adicionar refeicao"}
            </Button>
            <Button size="lg" type="button" variant="secondary">
              <Camera className="mr-2 size-4" />
              Tirar foto
            </Button>
          </div>
        </form>
      </SectionCard>

      <div className="grid gap-6">
        <Modal className="h-full">
          <p className="text-center text-xs uppercase tracking-[0.28em] text-[rgba(15,26,20,0.42)]">
            Interpretacao
          </p>
          <h2 className="mt-3 text-center font-serif text-4xl leading-tight text-[#0F1A14]">
            Uma leitura emocional e simples.
          </h2>
          <p className="mx-auto mt-5 max-w-md text-center text-sm leading-8 text-[rgba(15,26,20,0.60)]">
            {state.interpretation ?? "Boa escolha para ajudar o teu corpo a relaxar."}
          </p>

          <div className="mx-auto mt-8 grid max-w-lg gap-3 sm:grid-cols-2">
            <div className="rounded-[28px] border border-[rgba(198,167,94,0.16)] bg-[rgba(198,167,94,0.10)] p-5">
              <p className="text-[11px] uppercase tracking-[0.22em] text-[rgba(15,26,20,0.42)]">
                O que procuramos
              </p>
              <p className="mt-3 text-sm leading-7 text-[rgba(15,26,20,0.64)]">
                Pistas de seguranca, energia estavel e menos ruido interno.
              </p>
            </div>
            <div className="rounded-[28px] border border-[rgba(198,167,94,0.16)] bg-[rgba(255,251,247,0.8)] p-5">
              <p className="text-[11px] uppercase tracking-[0.22em] text-[rgba(15,26,20,0.42)]">
                O que nao fazemos
              </p>
              <p className="mt-3 text-sm leading-7 text-[rgba(15,26,20,0.64)]">
                Julgar, contar macros ou transformar cada refeicao numa tarefa.
              </p>
            </div>
          </div>

          {state.message ? (
            <p className="mx-auto mt-6 max-w-md rounded-[24px] bg-[rgba(255,251,247,0.8)] px-4 py-4 text-center text-sm text-[rgba(15,26,20,0.56)]">
              {state.message}
            </p>
          ) : null}
        </Modal>

        <Card>
          <p className="text-xs uppercase tracking-[0.28em] text-[rgba(15,26,20,0.42)]">
            Lembrete do dia
          </p>
          <h3 className="mt-3 text-xl font-medium text-[#0F1A14]">
            Uma refeicao simples e previsivel pode ser um sinal de seguranca.
          </h3>
          <p className="mt-3 text-sm leading-8 text-[rgba(15,26,20,0.58)]">
            Nem sempre o problema esta no que comes. Muitas vezes esta no contexto, no stress e
            na forma como o corpo chega a refeicao.
          </p>
        </Card>
        </div>
      
    </div>
  );
}
