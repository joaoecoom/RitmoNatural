import Link from "next/link";

import { Card } from "@/components/ui/card";
import { SectionCard } from "@/components/ui/section-card";
import type { JourneyCalendarData } from "@/features/journey/server/queries";

export function JourneyOverview({ data }: { data: JourneyCalendarData }) {
  const latest = data.days[0];

  return (
    <div className="grid gap-6">
      <SectionCard
        description="Uma visao humana do teu ritmo: dias completos, pausas e pequenas sequencias."
        eyebrow="Jornada"
        title="O teu calendario interior"
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="px-5 py-5" tone="soft">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-[rgba(15,26,20,0.42)]">
              Sequencia
            </p>
            <p className="mt-3 font-serif text-3xl text-[#0F1A14]">{data.streak} dias</p>
            <p className="mt-2 text-sm text-[rgba(15,26,20,0.55)]">Dias com plano concluido seguidos.</p>
          </Card>
          <Card className="px-5 py-5" tone="soft">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-[rgba(15,26,20,0.42)]">
              Esta semana
            </p>
            <p className="mt-3 font-serif text-3xl text-[#0F1A14]">{data.weekCompletionPct}%</p>
            <p className="mt-2 text-sm text-[rgba(15,26,20,0.55)]">Dias completos nos ultimos 7 registos.</p>
          </Card>
          <Card className="px-5 py-5" tone="soft">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-[rgba(15,26,20,0.42)]">
              Marco
            </p>
            <p className="mt-3 text-lg font-medium text-[#0F1A14]">
              {latest ? `Dia ${latest.day_number}` : "Primeiro dia"}
            </p>
            <p className="mt-2 text-sm text-[rgba(15,26,20,0.55)]">
              {latest
                ? "Continua a saida suave do modo sobrevivencia."
                : "Completa o plano de hoje para abrir a tua linha do tempo."}
            </p>
          </Card>
        </div>
      </SectionCard>

      <SectionCard
        description="Cada quadrado e um dia. Cheio quando o plano ficou completo."
        eyebrow="Ultimas semanas"
        title="Historico recente"
      >
        <div className="grid grid-cols-7 gap-2 sm:gap-3">
          {data.days.slice(0, 21).map((d) => {
            const total = d.total_steps || 1;
            const full = d.completed_steps >= total;
            const partial = !full && d.completed_steps > 0;

            return (
              <div
                key={d.journey_date}
                className="flex flex-col items-center gap-1 rounded-2xl border border-[rgba(15,26,20,0.06)] bg-[rgba(255,251,247,0.72)] px-1 py-3 text-center"
                title={d.journey_date}
              >
                <span
                  className={
                    full
                      ? "size-8 rounded-full bg-[rgba(127,152,129,0.45)] ring-2 ring-[rgba(127,152,129,0.35)]"
                      : partial
                        ? "size-8 rounded-full bg-[rgba(236,213,177,0.55)] ring-1 ring-[rgba(198,167,94,0.35)]"
                        : "size-8 rounded-full bg-[rgba(15,26,20,0.06)]"
                  }
                />
                <span className="text-[10px] font-medium text-[rgba(15,26,20,0.45)]">
                  {d.journey_date.slice(8, 10)}
                </span>
              </div>
            );
          })}
        </div>
        {data.days.length === 0 ? (
          <p className="mt-4 text-sm text-[rgba(15,26,20,0.52)]">
            Ainda nao tens dias registados. Vai a{" "}
            <Link className="font-semibold text-[#735C00] underline" href="/today">
              Hoje
            </Link>{" "}
            para comecar.
          </p>
        ) : null}
      </SectionCard>
    </div>
  );
}
