import Link from "next/link";
import { ArrowRight, Check, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionCard } from "@/components/ui/section-card";
import { completeDailyTaskAction } from "@/features/today/server/actions";
import type { TodayPageData } from "@/features/today/server/queries";
import { cn } from "@/lib/utils/cn";
import { formatTimeHm } from "@/lib/utils/today-date";

const goldLinkClass =
  "inline-flex min-h-12 items-center justify-center rounded-full bg-[linear-gradient(180deg,#D4AF37,#C6A75E)] px-6 py-3 text-sm font-semibold text-[#201B16] shadow-[0_16px_34px_rgba(198,167,94,0.22)] transition hover:-translate-y-0.5 hover:brightness-[1.02] sm:min-h-14 sm:text-[15px]";

export function TodayOverview({ data }: { data: TodayPageData }) {
  const firstName = data.profile?.full_name?.split(" ")[0] ?? "tu";
  const score = data.latestScore ?? 52;
  const total = data.journey?.total_steps ?? data.tasks.length ?? 1;
  const done = data.tasks.filter((t) => t.completed).length;
  const nextTask = data.tasks.find((t) => !t.completed);
  const { summary } = data;
  const planComplete = data.tasks.length > 0 && done >= data.tasks.length;
  const stressColor =
    summary.latestStress === null
      ? "text-[rgba(15,26,20,0.58)]"
      : summary.latestStress <= 4
        ? "text-[#2f6b3b]"
        : summary.latestStress <= 7
          ? "text-[#6a5d43]"
          : "text-[#8f3f3f]";
  const closingFallback =
    planComplete && !summary.closingVoice
      ? "Fechaste o plano de hoje com presença. Amanhã o corpo lembra-se deste ritmo."
      : !summary.closingVoice
        ? "Ao longo do dia, este resumo enche-se com check-ins e refeições — passo a passo."
        : null;

  return (
    <div className="grid gap-6">
      <section className="grid gap-3">
        <p className="text-[15px] leading-relaxed text-[rgba(15,26,20,0.52)]">
          Ola, <span className="font-medium text-[#0F1A14]">{firstName}</span>
        </p>
        <h1 className="font-serif text-[clamp(1.75rem,4vw,2.5rem)] leading-tight text-[#0F1A14]">
          Hoje vamos ajudar o teu corpo a sair do modo sobrevivencia.
        </h1>
      </section>

      <Card className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-[rgba(15,26,20,0.45)]">
            Ritmo de hoje
          </p>
          <p className="mt-2 font-serif text-4xl text-[#0F1A14]">
            {score}
            <span className="text-lg font-sans text-[rgba(15,26,20,0.42)]">/100</span>
          </p>
          <p className="mt-2 max-w-md text-sm leading-7 text-[rgba(15,26,20,0.58)]">
            {data.stateLabel
              ? `Estado: ${data.stateLabel}.`
              : "Estas a consolidar um ritmo mais leve e consistente."}
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide">
            <span className={`rounded-full bg-[rgba(255,251,247,0.9)] px-2.5 py-1 ring-1 ring-[rgba(15,26,20,0.08)] ${stressColor}`}>
              Stress: {summary.latestStress !== null ? `${summary.latestStress}/10` : "—"}
            </span>
            <span className="rounded-full bg-[rgba(255,251,247,0.9)] px-2.5 py-1 text-[rgba(15,26,20,0.62)] ring-1 ring-[rgba(15,26,20,0.08)]">
              Energia: {summary.latestEnergy !== null ? `${summary.latestEnergy}/10` : "—"}
            </span>
            <span className="rounded-full bg-[rgba(255,251,247,0.9)] px-2.5 py-1 text-[rgba(15,26,20,0.62)] ring-1 ring-[rgba(15,26,20,0.08)]">
              Inchaco: {summary.latestBloating !== null ? `${summary.latestBloating}/10` : "—"}
            </span>
          </div>
        </div>
        <div className="rounded-[22px] bg-[rgba(236,213,177,0.28)] px-4 py-3 text-sm text-[rgba(32,27,22,0.78)] ring-1 ring-[rgba(198,167,94,0.2)]">
          <p className="font-medium text-[#0F1A14]">Objetivo atual</p>
          <p className="mt-1 leading-relaxed">{data.goalLine}</p>
          <Link
            className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[#735C00] underline decoration-[rgba(115,92,0,0.35)] underline-offset-4"
            href="/goals"
          >
            Ajustar objetivos
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </Card>

      <Card className="border-[rgba(198,167,94,0.22)] bg-[linear-gradient(180deg,rgba(15,26,20,0.96),#0f1a14)] px-5 py-5 text-[#F4EFE6] sm:px-6">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 size-5 shrink-0 text-[#D4AF37]" />
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-[rgba(244,239,230,0.5)]">
              A Voz
            </p>
            <p className="mt-2 text-sm leading-7 text-[rgba(244,239,230,0.82)]">
              {done === 0
                ? "Ainda nao comecaste o plano de hoje. Um passo de cada vez."
                : `Ja completaste ${done} de ${total} passos. Continua simples.`}
            </p>
          </div>
        </div>
      </Card>

      {nextTask ? (
        <Card className="border-[rgba(198,167,94,0.35)] bg-[rgba(255,251,247,0.95)] px-5 py-5 ring-1 ring-[rgba(198,167,94,0.2)] sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#735C00]">
            Agora faz isto
          </p>
          <p className="mt-2 font-serif text-2xl text-[#0F1A14]">{nextTask.title}</p>
          <p className="mt-2 text-sm leading-7 text-[rgba(15,26,20,0.58)]">{nextTask.description}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {nextTask.deep_link ? (
              <Link className={goldLinkClass} href={nextTask.deep_link}>
                Fazer agora
              </Link>
            ) : null}
            <form action={completeDailyTaskAction.bind(null, nextTask.id)}>
              <Button size="lg" type="submit" variant={nextTask.deep_link ? "secondary" : "gold"}>
                <Check className="mr-2 size-4" />
                Marcar feito
              </Button>
            </form>
          </div>
        </Card>
      ) : (
        <Card className="px-5 py-5 sm:px-6">
          <p className="font-medium text-[#0F1A14]">Plano de hoje concluido</p>
          <p className="mt-2 text-sm text-[rgba(15,26,20,0.56)]">
            Volta amanha para um novo ritmo. Podes rever a Voz ou o progresso quando quiseres.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link className={goldLinkClass} href="/voice">
              Ouvir a Voz
            </Link>
            <Link
              className={cn(
                "inline-flex min-h-12 items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-[#201B16] ring-1 ring-[rgba(32,27,22,0.06)] transition sm:min-h-14 sm:text-[15px]",
                "glass-surface hover:bg-[rgba(255,248,245,0.96)]",
              )}
              href="/journey"
            >
              Ver jornada
            </Link>
          </div>
        </Card>
      )}

      <SectionCard
        description="Cada passo e pequeno de proposito: o corpo aprende com repeticao, nao com pressa."
        eyebrow="Plano de hoje"
        title="O teu plano de hoje"
      >
        <ul className="grid gap-3">
          {data.tasks.map((task) => (
            <li key={task.id}>
              <Card
                className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
                tone="soft"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-[#0F1A14]">{task.title}</p>
                    {task.scheduled_time ? (
                      <span className="rounded-full bg-[rgba(198,167,94,0.16)] px-2.5 py-0.5 text-[11px] font-medium text-[#5c4a2a]">
                        {formatTimeHm(task.scheduled_time)}
                      </span>
                    ) : null}
                    {task.completed ? (
                      <span className="rounded-full bg-[rgba(127,152,129,0.22)] px-2.5 py-0.5 text-[11px] font-semibold text-[#2d3f30]">
                        Concluido
                      </span>
                    ) : (
                      <span className="rounded-full bg-[rgba(255,251,247,0.9)] px-2.5 py-0.5 text-[11px] font-medium text-[rgba(15,26,20,0.5)] ring-1 ring-[rgba(15,26,20,0.06)]">
                        Pendente
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm leading-7 text-[rgba(15,26,20,0.56)]">{task.description}</p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  {task.deep_link && !task.completed ? (
                    <Link
                      className="inline-flex min-h-12 items-center justify-center rounded-full bg-[linear-gradient(180deg,#D4AF37,#C6A75E)] px-5 py-3 text-sm font-semibold text-[#201B16] shadow-[0_16px_34px_rgba(198,167,94,0.22)] transition hover:-translate-y-0.5 hover:brightness-[1.02]"
                      href={task.deep_link}
                    >
                      Fazer agora
                    </Link>
                  ) : null}
                  {!task.completed ? (
                    <form action={completeDailyTaskAction.bind(null, task.id)}>
                      <Button size="md" type="submit" variant="secondary">
                        Marcar feito
                      </Button>
                    </form>
                  ) : null}
                </div>
              </Card>
            </li>
          ))}
        </ul>
      </SectionCard>

      <SectionCard
        description="Um retrato do dia em Lisboa: o que registaste e o que a Voz deixa ficar contigo."
        eyebrow="Resumo do dia"
        title={planComplete ? "Como fechaste o dia" : "O teu dia em progresso"}
      >
        <div className="mb-4 rounded-[22px] border border-[rgba(198,167,94,0.22)] bg-[rgba(255,251,247,0.82)] px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[rgba(15,26,20,0.45)]">
            Hidratacao do dia
          </p>
          <div className="mt-3 flex items-end gap-2">
            {Array.from({ length: Math.max(summary.waterStepsTotal, 4) }).map((_, idx) => {
              const active = idx < summary.waterStepsDone;
              return (
                <span
                  className={`inline-block h-7 w-4 rounded-b-md rounded-t-sm ${active ? "bg-[linear-gradient(180deg,#9cc6de,#79aecf)]" : "bg-[rgba(15,26,20,0.08)]"}`}
                  key={`water-${idx}`}
                  title={active ? "Copo concluido" : "Pendente"}
                />
              );
            })}
            <span className="ml-2 text-sm font-medium text-[rgba(15,26,20,0.62)]">
              {summary.waterStepsDone}/{summary.waterStepsTotal || 0}
            </span>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="px-4 py-4" tone="soft">
            <p className="text-xs font-semibold uppercase tracking-wide text-[rgba(15,26,20,0.45)]">
              Plano de hoje
            </p>
            <p className="mt-2 text-2xl font-semibold text-[#0F1A14]">
              {done}
              <span className="text-base font-normal text-[rgba(15,26,20,0.42)]"> / {total}</span>
            </p>
            <p className="mt-1 text-sm text-[rgba(15,26,20,0.52)]">passos concluídos</p>
          </Card>
          <Card className="px-4 py-4" tone="soft">
            <p className="text-xs font-semibold uppercase tracking-wide text-[rgba(15,26,20,0.45)]">
              Stress médio
            </p>
            <p className="mt-2 text-2xl font-semibold text-[#0F1A14]">
              {summary.avgStress !== null ? `${summary.avgStress}/10` : "—"}
            </p>
            <p className="mt-1 text-sm text-[rgba(15,26,20,0.52)]">
              {summary.checkinsTodayCount > 0
                ? `${summary.checkinsTodayCount} check-in${summary.checkinsTodayCount > 1 ? "s" : ""}`
                : "sem check-in hoje"}
            </p>
          </Card>
          <Card className="px-4 py-4" tone="soft">
            <p className="text-xs font-semibold uppercase tracking-wide text-[rgba(15,26,20,0.45)]">
              Energia média
            </p>
            <p className="mt-2 text-2xl font-semibold text-[#0F1A14]">
              {summary.avgEnergy !== null ? `${summary.avgEnergy}/10` : "—"}
            </p>
            <p className="mt-1 text-sm text-[rgba(15,26,20,0.52)]">a partir dos check-ins</p>
          </Card>
          <Card className="px-4 py-4" tone="soft">
            <p className="text-xs font-semibold uppercase tracking-wide text-[rgba(15,26,20,0.45)]">
              Refeições
            </p>
            <p className="mt-2 text-2xl font-semibold text-[#0F1A14]">{summary.mealsTodayCount}</p>
            <p className="mt-1 text-sm text-[rgba(15,26,20,0.52)]">registadas hoje</p>
          </Card>
        </div>

        <Card className="mt-4 border-[rgba(198,167,94,0.22)] bg-[linear-gradient(180deg,rgba(15,26,20,0.96),#0f1a14)] px-5 py-5 text-[#F4EFE6]">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-[rgba(244,239,230,0.5)]">
            Mensagem da Voz para fechar o dia
          </p>
          <p className="mt-3 text-sm leading-8 text-[rgba(244,239,230,0.88)]">
            {summary.closingVoice ?? closingFallback}
          </p>
          {summary.closingVoice ? (
            <Link
              className="mt-4 inline-flex text-sm font-semibold text-[#D4AF37] underline decoration-[rgba(212,175,55,0.4)] underline-offset-4"
              href="/voice"
            >
              Abrir A Voz
            </Link>
          ) : null}
        </Card>
      </SectionCard>

      <div className="flex flex-wrap gap-3 text-sm">
        <Link
          className="rounded-full bg-[rgba(255,251,247,0.86)] px-4 py-2.5 font-medium text-[#0F1A14] ring-1 ring-[rgba(15,26,20,0.08)]"
          href="/schedule"
        >
          Horarios e rotina
        </Link>
        <Link
          className="rounded-full bg-[rgba(255,251,247,0.86)] px-4 py-2.5 font-medium text-[#0F1A14] ring-1 ring-[rgba(15,26,20,0.08)]"
          href="/programs"
        >
          Programas
        </Link>
        <Link
          className="rounded-full bg-[rgba(255,251,247,0.86)] px-4 py-2.5 font-medium text-[#0F1A14] ring-1 ring-[rgba(15,26,20,0.08)]"
          href="/upgrade"
        >
          Desbloquear mais
        </Link>
      </div>
    </div>
  );
}
