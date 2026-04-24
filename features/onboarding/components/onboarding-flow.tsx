"use client";

import type { ChangeEvent } from "react";
import { useMemo, useState } from "react";
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  Flower2,
  Target,
  Waves,
} from "lucide-react";

import { BrandHeader } from "@/components/ui/brand-header";
import { GlassCard } from "@/components/ui/glass-card";
import { InputField } from "@/components/ui/input-field";
import { OptionCard } from "@/components/ui/option-card";
import { PrimaryButton } from "@/components/ui/primary-button";
import { ProgressStepper } from "@/components/ui/progress-stepper";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { Slider } from "@/components/ui/slider";
import { VoiceOrb } from "@/components/ui/voice-orb";
import { completeOnboardingAction } from "@/features/onboarding/server/actions";
import { cn } from "@/lib/utils/cn";
import type { LifePhase, Symptom } from "@/types/domain";

const symptomOptions: { id: Symptom; label: string }[] = [
  { id: "bloating", label: "Inchaco" },
  { id: "weight_loss_resistance", label: "Dificuldade em emagrecer" },
  { id: "low_energy", label: "Pouca energia" },
  { id: "cravings", label: "Compulsao" },
  { id: "stubborn_belly", label: "Barriga resistente" },
];

const lifePhases: { id: LifePhase; label: string }[] = [
  { id: "postpartum", label: "Pos-parto" },
  { id: "menopause", label: "Menopausa ou pre-menopausa" },
  { id: "high_stress", label: "Stress elevado" },
  { id: "none", label: "Nenhuma em particular" },
];

const goalOptions = [
  "Voltar a sentir o meu corpo mais leve.",
  "Reduzir o inchaço e sentir mais conforto.",
  "Sair do ciclo de stress e compulsão.",
  "Recuperar energia e consistência.",
];

export function OnboardingFlow() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [age, setAge] = useState("32");
  const [goal, setGoal] = useState("Voltar a sentir o meu corpo mais leve.");
  const [lifePhase, setLifePhase] = useState<LifePhase>("none");
  const [symptoms, setSymptoms] = useState<Symptom[]>(["bloating"]);
  const [stressLevel, setStressLevel] = useState(6);
  const [sleepQuality, setSleepQuality] = useState(5);
  const [notes, setNotes] = useState("");
  const [acceptsNotifications, setAcceptsNotifications] = useState(true);

  const steps = useMemo(
    () => [
      {
        title: "Vamos começar com o teu ritmo",
        description:
          "Uma base simples para que a experiência se adapte ao teu momento com mais clareza.",
      },
      {
        title: "O teu objetivo principal",
        description:
          "Diz-nos o que queres sentir primeiro. Isso ajuda-nos a guiar-te melhor.",
      },
      {
        title: "A fase em que estás agora",
        description:
          "Nem todas as mulheres precisam do mesmo tipo de apoio. Esta escolha dá-nos contexto.",
      },
      {
        title: "Os sinais que o teu corpo tem mostrado",
        description:
          "Escolhe apenas o que reconheces hoje. Não precisas de explicar tudo para começar.",
      },
      {
        title: "O teu ritmo atual",
        description:
          "Estamos quase. Vamos terminar com um retrato leve do teu dia-a-dia.",
      },
      {
        title: "A Voz já está contigo",
        description:
          "Este é o início do teu novo ritmo. A partir daqui, o cuidado passa a ser mais guiado.",
      },
    ],
    [],
  );

  const isLastStep = step === steps.length - 1;

  function toggleSymptom(symptom: Symptom) {
    setSymptoms((current) =>
      current.includes(symptom)
        ? current.filter((item) => item !== symptom)
        : [...current, symptom],
    );
  }

  function goNext() {
    setStep((current) => Math.min(current + 1, steps.length - 1));
  }

  function goBack() {
    setStep((current) => Math.max(current - 1, 0));
  }

  const canContinue =
    (step === 0 && name.trim().length > 1) ||
    (step === 1 && goal.trim().length > 0) ||
    step > 1;

  return (
    <div className="mx-auto max-w-[1040px]">
      <div className="grid gap-5 lg:grid-cols-[0.88fr_1.12fr]">
        <GlassCard className="space-y-7 bg-[linear-gradient(180deg,rgba(15,26,20,0.96),rgba(32,27,22,0.94))] text-white">
          <VoiceOrb className="mx-0" label="RN" size="md" />
          <BrandHeader
            description={steps[step]?.description}
            eyebrow="Onboarding"
            tone="light"
            title={steps[step]?.title}
          />
          <div className="space-y-3">
            {steps.map((item, index) => (
              <div
                key={item.title}
                className={cn(
                  "rounded-[22px] border px-4 py-3 text-sm leading-7 transition",
                  index === step
                    ? "border-[rgba(212,175,55,0.34)] bg-[rgba(255,255,255,0.08)] text-white"
                    : "border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] text-[rgba(255,255,255,0.56)]",
                )}
              >
                {item.title}
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="space-y-8">
          <ProgressStepper currentStep={step + 1} totalSteps={steps.length} />

          <form action={completeOnboardingAction} className="space-y-8">
            <input name="full_name" type="hidden" value={name} readOnly />
            <input name="age" type="hidden" value={age} readOnly />
            <input name="primary_goal" type="hidden" value={goal} readOnly />
            <input name="life_phase" type="hidden" value={lifePhase} readOnly />
            <input name="symptoms" type="hidden" value={JSON.stringify(symptoms)} readOnly />
            <input name="stress_level" type="hidden" value={stressLevel} readOnly />
            <input name="sleep_quality" type="hidden" value={sleepQuality} readOnly />
            <input name="notes" type="hidden" value={notes} readOnly />
            <input
              name="accepts_notifications"
              type="hidden"
              value={String(acceptsNotifications)}
              readOnly
            />

            {step === 0 ? (
              <div className="space-y-5 fade-up">
                <BrandHeader
                  description="Vamos começar pelo que o teu corpo precisa agora."
                  eyebrow="Passo inicial"
                  title="Conta-nos quem está deste lado."
                />

                <div className="grid gap-5 sm:grid-cols-2">
                  <InputField
                    label="Nome"
                    placeholder="Como gostas de ser chamada?"
                    required
                    type="text"
                    value={name}
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      setName(event.target.value)
                    }
                  />

                  <InputField
                    label="Idade"
                    max={80}
                    min={18}
                    type="number"
                    value={age}
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      setAge(event.target.value)
                    }
                  />
                </div>
              </div>
            ) : null}

            {step === 1 ? (
              <div className="space-y-5 fade-up">
                <BrandHeader
                  description="Quanto mais claro estiver o teu objetivo, mais certa pode ser a orientação da Voz."
                  eyebrow="Objetivo principal"
                  title="O que queres sentir primeiro?"
                />

                <div className="grid gap-3">
                  {goalOptions.map((option) => (
                    <OptionCard
                      description="Uma direção simples para personalizar a tua experiência."
                      icon={<Target className="size-4 text-[#735C00]" />}
                      key={option}
                      selected={goal === option}
                      title={option}
                      onClick={() => setGoal(option)}
                    />
                  ))}
                </div>

                <InputField
                  hint="Se preferires, escreve com as tuas palavras."
                  label="Ou descreve o teu objetivo"
                  placeholder="Ex.: sentir menos pressão ao final do dia e voltar a confiar no meu corpo"
                  type="text"
                  value={goal}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    setGoal(event.target.value)
                  }
                />
              </div>
            ) : null}

            {step === 2 ? (
              <div className="space-y-5 fade-up">
                <BrandHeader
                  description="Isto ajuda-nos a perceber o contexto em que o teu corpo está agora."
                  eyebrow="Fase atual"
                  title="Em que fase da vida estás neste momento?"
                />

                <div className="grid gap-3">
                  {lifePhases.map((option) => (
                    <OptionCard
                      description="Uma leitura mais humana do teu momento atual."
                      icon={<Flower2 className="size-4 text-[#735C00]" />}
                      key={option.id}
                      selected={lifePhase === option.id}
                      title={option.label}
                      onClick={() => setLifePhase(option.id)}
                    />
                  ))}
                </div>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="space-y-5 fade-up">
                <BrandHeader
                  description="Escolhe os sinais que mais reconheces. Este espaço é para clareza, não para perfeição."
                  eyebrow="Sinais do corpo"
                  title="O que tens sentido com mais frequência?"
                />

                <div className="grid gap-3">
                  {symptomOptions.map((option) => {
                    const active = symptoms.includes(option.id);

                    return (
                      <OptionCard
                        description="Podes mudar isto mais tarde."
                        icon={<Waves className="size-4 text-[#735C00]" />}
                        key={option.id}
                        selected={active}
                        title={option.label}
                        onClick={() => toggleSymptom(option.id)}
                      />
                    );
                  })}
                </div>

                <InputField
                  hint="Opcional. Um contexto simples já nos ajuda."
                  label="Se quiseres, descreve um pouco melhor"
                  multiline
                  placeholder="Ex.: ao final do dia sinto-me mais cansada e como em piloto automático."
                  value={notes}
                  onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                    setNotes(event.target.value)
                  }
                />
              </div>
            ) : null}

            {step === 4 ? (
              <div className="space-y-5 fade-up">
                <BrandHeader
                  description="Uma leitura leve do teu ritmo atual, para que a Voz responda com mais sensibilidade."
                  eyebrow="Ritmo atual"
                  title="Como está o teu corpo neste momento?"
                />

                <Slider
                  hint="Quanto mais alto, mais o corpo pode sentir-se em alerta."
                  label="Nível de stress"
                  value={stressLevel}
                  onValueChange={setStressLevel}
                />

                <Slider
                  hint="Uma leitura simples da tua noite e da tua recuperação."
                  label="Qualidade do sono"
                  value={sleepQuality}
                  onValueChange={setSleepQuality}
                />

                <OptionCard
                  description="Pequenos sinais da Voz para te ajudar a manter consistência sem pressão."
                  icon={<Bell className="size-4 text-[#735C00]" />}
                  selected={acceptsNotifications}
                  title="Quero receber lembretes suaves"
                  onClick={() => setAcceptsNotifications((current) => !current)}
                />
              </div>
            ) : null}

            {step === 5 ? (
              <div className="space-y-6 fade-up">
                <div className="flex justify-center">
                  <VoiceOrb label="A Voz" size="lg" />
                </div>

                <BrandHeader
                  align="center"
                  description="A partir daqui, a app começa a responder com mais contexto, mais leveza e mais intenção."
                  eyebrow="Introdução à Voz"
                  title="A tua experiência já tem um ponto de partida."
                />

                <GlassCard className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[24px] bg-[rgba(255,248,245,0.84)] px-4 py-4">
                      <p className="eyebrow">Nome</p>
                      <p className="mt-2 text-sm font-semibold text-[#201B16]">{name || "—"}</p>
                    </div>
                    <div className="rounded-[24px] bg-[rgba(255,248,245,0.84)] px-4 py-4">
                      <p className="eyebrow">Objetivo</p>
                      <p className="mt-2 text-sm font-semibold text-[#201B16]">{goal || "—"}</p>
                    </div>
                    <div className="rounded-[24px] bg-[rgba(255,248,245,0.84)] px-4 py-4">
                      <p className="eyebrow">Fase</p>
                      <p className="mt-2 text-sm font-semibold text-[#201B16]">
                        {lifePhases.find((item) => item.id === lifePhase)?.label ?? "—"}
                      </p>
                    </div>
                    <div className="rounded-[24px] bg-[rgba(255,248,245,0.84)] px-4 py-4">
                      <p className="eyebrow">Ritmo atual</p>
                      <p className="mt-2 text-sm font-semibold text-[#201B16]">
                        Stress {stressLevel}/10 · Sono {sleepQuality}/10
                      </p>
                    </div>
                  </div>

                  <div className="rounded-[24px] bg-[rgba(212,175,55,0.10)] px-5 py-5 text-sm leading-8 text-[rgba(77,70,53,0.84)]">
                    A Voz está contigo. Hoje vamos ajudar o teu corpo a sair do modo sobrevivência com sinais de segurança, consistência e leveza.
                  </div>
                </GlassCard>
              </div>
            ) : null}

            <div className="flex flex-col gap-3 border-t border-[rgba(32,27,22,0.06)] pt-6 sm:flex-row sm:justify-between">
              <SecondaryButton disabled={step === 0} onClick={goBack} type="button">
                <ChevronLeft className="mr-2 size-4" />
                Voltar
              </SecondaryButton>

              {isLastStep ? (
                <PrimaryButton type="submit">Entrar no meu ritmo</PrimaryButton>
              ) : (
                <PrimaryButton disabled={!canContinue} onClick={goNext} type="button">
                  Continuar
                  <ChevronRight className="ml-2 size-4" />
                </PrimaryButton>
              )}
            </div>
          </form>
        </GlassCard>
      </div>
    </div>
  );
}
