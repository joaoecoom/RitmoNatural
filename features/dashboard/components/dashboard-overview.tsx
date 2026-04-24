import Link from "next/link";
import {
  ArrowRight,
  HeartHandshake,
  MessageCircleHeart,
  MoveRight,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckItem } from "@/components/ui/check-item";
import { ProgressBar } from "@/components/ui/progress-bar";
import { SectionCard } from "@/components/ui/section-card";
import { VoiceCard } from "@/components/ui/voice-card";
import { getDashboardStateCopy, type DashboardData } from "@/features/dashboard/server/queries";

export function DashboardOverview({ data }: { data: DashboardData }) {
  const state = getDashboardStateCopy(data.progressState);
  const firstName = data.profile?.full_name?.split(" ")[0] ?? "tu";
  const currentScore = data.progressState?.score ?? 52;
  const quickActions = [
    {
      href: "/check-in",
      icon: HeartHandshake,
      title: "Como me sinto hoje",
      description: "Um minuto para perceber como o corpo esta a responder.",
      accent: "bg-[rgba(220,190,149,0.18)]",
    },
    {
      href: "/meals",
      icon: Sparkles,
      title: "O que comi hoje",
      description: "Regista a refeicao com texto ou foto, sem linguagem tecnica.",
      accent: "bg-[rgba(233,205,191,0.24)]",
    },
    {
      href: "/voice",
      icon: MessageCircleHeart,
      title: "Falar com a Voz",
      description: "Volta a ouvir a orientacao do dia sempre que precisares.",
      accent: "bg-[rgba(198,167,94,0.16)]",
    },
  ];
  const bodySignals = [
    {
      label: "Estado atual",
      value: state.title,
      detail: "A leitura mais recente do teu ritmo interno.",
    },
    {
      label: "Score de hoje",
      value: `${currentScore}/100`,
      detail: "Uma medida simples para acompanhar a tua fase.",
    },
    {
      label: "Foco do dia",
      value: "Menos pressao, mais previsibilidade",
      detail: "Pequenos sinais de seguranca contam mais do que perfeicao.",
    },
  ];

  return (
    <div className="grid gap-6">
      <div className="grid gap-6 lg:grid-cols-[1.18fr_0.82fr]">
        <VoiceCard
          body={
            data.latestVoiceMessage?.body ??
            "Mais um passo para voltares ao teu ritmo natural."
          }
          cta="Ouvir a mensagem do dia"
          onDark
          title={
            data.latestVoiceMessage?.title ??
            "Hoje vamos ajudar o teu corpo a sair do modo sobrevivencia."
          }
          footer={
            <div className="grid gap-3 sm:grid-cols-3">
              {bodySignals.map((signal) => (
                <div
                  className="rounded-[28px] bg-[rgba(255,255,255,0.08)] p-5 text-left"
                  key={signal.label}
                >
                  <p className="text-[11px] uppercase tracking-[0.28em] text-[rgba(255,255,255,0.50)]">
                    {signal.label}
                  </p>
                  <h3 className="mt-3 text-base font-medium text-white">{signal.value}</h3>
                  <p className="mt-3 text-sm leading-7 text-[rgba(255,255,255,0.68)]">
                    {signal.detail}
                  </p>
                </div>
              ))}
            </div>
          }
        />

        <div className="grid gap-6">
          <SectionCard
            description="Nao precisas de fazer tudo. Hoje basta um passo simples para voltares a sentir apoio."
            eyebrow={`Hoje, ${firstName}`}
            title="O teu corpo responde melhor quando o dia abranda."
          >
            <div className="rounded-[28px] border border-[rgba(198,167,94,0.18)] bg-[rgba(255,252,249,0.82)] p-5">
              <div className="mb-3 flex items-center justify-between text-sm text-[rgba(15,26,20,0.56)]">
                <span>Ritmo de hoje</span>
                <span>{currentScore}/100</span>
              </div>
              <ProgressBar tone="green" value={currentScore} />
              <p className="mt-4 text-sm leading-7 text-[rgba(15,26,20,0.60)]">
                {state.description}
              </p>
            </div>
            <Link href="/check-in">
              <Button fullWidth size="lg" variant="gold">
                Fazer o check-in de hoje
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </Link>
          </SectionCard>

          <Card className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[26px] border border-[rgba(15,26,20,0.06)] bg-[rgba(255,251,247,0.74)] p-5">
              <p className="text-[11px] uppercase tracking-[0.24em] text-[rgba(15,26,20,0.40)]">
                Intencao de hoje
              </p>
              <p className="mt-3 text-base font-medium text-[#0F1A14]">
                Comer com mais calma e menos ruido interno.
              </p>
            </div>
            <div className="rounded-[26px] border border-[rgba(15,26,20,0.06)] bg-[rgba(255,251,247,0.74)] p-5">
              <p className="text-[11px] uppercase tracking-[0.24em] text-[rgba(15,26,20,0.40)]">
                Proximo gesto
              </p>
              <p className="mt-3 text-base font-medium text-[#0F1A14]">
                Escolhe uma refeicao simples e previsivel para o resto do dia.
              </p>
            </div>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.98fr_1.02fr]">
        <SectionCard
          description="Estas sugestoes existem para baixar o peso do dia, nao para acrescentar pressao."
          eyebrow="Ajustes do dia"
          title="Mantem o essencial simples."
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-[rgba(15,26,20,0.50)]">
              Escolhe o que faz sentido para o teu momento.
            </p>
            <Link
              className="text-sm text-[rgba(15,26,20,0.50)] underline decoration-[rgba(198,167,94,0.42)] underline-offset-4"
              href="/meals"
            >
              ver mais
            </Link>
          </div>

          <div className="mt-6 space-y-3">
            {(data.adjustments.length > 0
              ? data.adjustments
              : [
                  {
                    id: "fallback-1",
                    title: "Comeca com algo simples",
                    description: "Uma refeicao previsivel pode baixar o alerta interno.",
                    is_completed: false,
                  },
                  {
                    id: "fallback-2",
                    title: "Protege o teu ritmo",
                    description: "Um pouco mais de calma tambem e estrategia.",
                    is_completed: true,
                  },
                ]
            ).map((adjustment) => (
              <CheckItem
                checked={Boolean(adjustment.is_completed)}
                description={adjustment.description}
                key={adjustment.id}
                title={adjustment.title}
              />
            ))}
          </div>
        </SectionCard>

        <div className="grid gap-6 sm:grid-cols-3 lg:grid-cols-3">
          {quickActions.map((item) => {
            const Icon = item.icon;

            return (
              <Link href={item.href} key={item.href}>
                <Card className="h-full transition hover:-translate-y-0.5 hover:shadow-[0_22px_55px_rgba(15,26,20,0.10)]">
                  <div
                    className={`flex size-12 items-center justify-center rounded-full ${item.accent}`}
                  >
                    <Icon className="size-5 text-[#0F1A14]" />
                  </div>
                  <h3 className="mt-5 text-lg font-medium text-[#0F1A14]">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-[rgba(15,26,20,0.56)]">
                    {item.description}
                  </p>
                  <div className="mt-5 inline-flex items-center gap-2 text-sm text-[rgba(15,26,20,0.54)]">
                    <span>Abrir</span>
                    <MoveRight className="size-4" />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
