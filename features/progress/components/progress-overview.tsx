import { ProgressBar } from "@/components/ui/progress-bar";
import { SectionCard } from "@/components/ui/section-card";
import { formatRelativeStateLabel } from "@/lib/utils/progress";
import type { ProgressViewData } from "@/features/progress/server/queries";

export function ProgressOverview({ data }: { data: ProgressViewData }) {
  const score = data.currentState.score;
  const scoreCopy =
    score >= 70
      ? "O teu corpo esta a responder com mais estabilidade."
      : score >= 45
        ? "Ha sinais de regulacao, mesmo que ainda exista oscilacao."
        : "Ainda ha alerta interno, por isso o foco deve ser proteger o ritmo.";

  return (
    <div className="grid gap-6">
      <div className="grid gap-6 lg:grid-cols-[1.04fr_0.96fr]">
        <SectionCard
          description="Aqui acompanhas o que esta a mudar no corpo sem cair numa logica de controlo pesado."
          eyebrow="Progresso"
          title={data.currentState.state_label}
        >
          <p className="text-sm leading-8 text-[rgba(15,26,20,0.58)]">
            {formatRelativeStateLabel(data.currentState.state_label)}
          </p>

          <div className="rounded-[28px] border border-[rgba(198,167,94,0.18)] bg-[rgba(255,252,249,0.82)] p-5">
            <div className="mb-3 flex items-center justify-between text-sm text-[rgba(15,26,20,0.56)]">
              <span>Score atual do estado do corpo</span>
              <span>{score}/100</span>
            </div>
            <ProgressBar tone="green" value={score} />
            <p className="mt-4 text-sm leading-7 text-[rgba(15,26,20,0.60)]">{scoreCopy}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[26px] border border-[rgba(15,26,20,0.06)] bg-[rgba(255,251,247,0.74)] p-5">
              <p className="text-[11px] uppercase tracking-[0.24em] text-[rgba(15,26,20,0.40)]">
                O que conta
              </p>
              <p className="mt-3 text-base font-medium text-[#0F1A14]">
                Consistencia, previsibilidade e menos stress interno.
              </p>
            </div>
            <div className="rounded-[26px] border border-[rgba(15,26,20,0.06)] bg-[rgba(255,251,247,0.74)] p-5">
              <p className="text-[11px] uppercase tracking-[0.24em] text-[rgba(15,26,20,0.40)]">
                O que evitar
              </p>
              <p className="mt-3 text-base font-medium text-[#0F1A14]">
                Procurar mudancas bruscas quando o corpo ainda pede seguranca.
              </p>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          description="Uma linha simples para veres a direcao geral, sem transformares isto num painel tecnico."
          eyebrow="Evolucao leve"
          title="Como o teu ritmo se tem vindo a reorganizar."
        >
          <div className="mt-2 space-y-4">
            {data.history.map((state, index) => (
              <div
                key={state.id}
                className="flex items-center justify-between rounded-[28px] border border-[rgba(15,26,20,0.06)] bg-[rgba(255,251,247,0.74)] px-4 py-4"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-[#0F1A14]">{state.state_label}</p>
                    {index === 0 ? (
                      <span className="inline-flex rounded-full bg-[rgba(198,167,94,0.14)] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-[#0F1A14]">
                        Atual
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm text-[rgba(15,26,20,0.48)]">
                    {new Date(state.created_at).toLocaleDateString("pt-PT")}
                  </p>
                </div>
                <div className="rounded-full bg-[rgba(198,167,94,0.14)] px-4 py-2 text-sm text-[#0F1A14]">
                  {state.score}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard
        description="Os teus registos mais recentes ajudam-te a notar padroes, e nao a julgar o dia."
        eyebrow="Historico de check-ins"
        title="Sinais recentes do corpo."
      >
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(data.checkins.length > 0
            ? data.checkins
            : [
                {
                  id: "fallback-checkin",
                  created_at: new Date().toISOString(),
                  stress_score: 6,
                  energy_score: 5,
                  bloating_score: 5,
                },
              ]
          ).map((checkin) => (
            <div
              key={checkin.id}
              className="rounded-[28px] border border-[rgba(15,26,20,0.06)] bg-[rgba(255,251,247,0.74)] p-5"
            >
              <p className="text-[11px] uppercase tracking-[0.24em] text-[rgba(15,26,20,0.40)]">
                {new Date(checkin.created_at).toLocaleDateString("pt-PT")}
              </p>
              <p className="text-sm font-medium text-[#0F1A14]">
                Leitura do dia
              </p>
              <div className="mt-4 grid gap-3 text-sm text-[rgba(15,26,20,0.56)]">
                <div className="flex items-center justify-between rounded-full bg-[rgba(248,241,234,0.88)] px-4 py-2">
                  <span>Stress</span>
                  <span>{checkin.stress_score}/10</span>
                </div>
                <div className="flex items-center justify-between rounded-full bg-[rgba(248,241,234,0.88)] px-4 py-2">
                  <span>Energia</span>
                  <span>{checkin.energy_score}/10</span>
                </div>
                <div className="flex items-center justify-between rounded-full bg-[rgba(248,241,234,0.88)] px-4 py-2">
                  <span>Inchaco</span>
                  <span>{checkin.bloating_score}/10</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
