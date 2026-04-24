import { HeartHandshake, PlayCircle, Waves, Sparkles } from "lucide-react";

import { Card } from "@/components/ui/card";
import { SectionCard } from "@/components/ui/section-card";
import { generateVoiceAudioAction } from "@/features/voice/server/actions";
import { VoiceCard } from "@/components/ui/voice-card";
import type { VoiceMessageView } from "@/features/voice/server/queries";

export function VoiceFeed({ messages }: { messages: VoiceMessageView[] }) {
  const items: VoiceMessageView[] =
    messages.length > 0
      ? messages
      : [
          {
            id: "fallback-voice",
            title: "Mensagem do dia",
            body: "Mais um passo para voltares ao teu ritmo natural.",
            audio_url: null,
            audio_playback_url: null,
            message_type: "daily_guidance",
            user_id: "fallback",
            created_at: new Date().toISOString(),
          },
        ];
  const latestMessage = items[0];
  const messageTypeCopy: Record<string, string> = {
    daily_guidance: "Orientacao do dia",
    checkin_response: "Resposta ao check-in",
    meal_reflection: "Leitura da refeicao",
    encouragement: "Mensagem de apoio",
  };

  return (
    <div className="grid gap-6">
      <div className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
        <VoiceCard
          audioSrc={latestMessage.audio_playback_url}
          body={
            latestMessage.body ??
            "Mensagens curtas para trazer seguranca, clareza e consistencia ao teu dia."
          }
          cta={latestMessage.audio_playback_url ? "Ouvir a mensagem de hoje" : "Audio em breve"}
          onDark
          title={latestMessage.title ?? "Uma presenca, nao uma feature."}
          footer={
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[28px] bg-[rgba(255,255,255,0.08)] p-5 text-left">
                <p className="text-[11px] uppercase tracking-[0.28em] text-[rgba(255,255,255,0.50)]">
                  O que encontras aqui
                </p>
                <p className="mt-3 text-sm leading-7 text-[rgba(255,255,255,0.72)]">
                  Mensagens curtas para te recentrar quando o corpo entra em alerta.
                </p>
              </div>
              <div className="rounded-[28px] bg-[rgba(255,255,255,0.08)] p-5 text-left">
                <p className="text-[11px] uppercase tracking-[0.28em] text-[rgba(255,255,255,0.50)]">
                  Melhor momento
                </p>
                <p className="mt-3 text-sm leading-7 text-[rgba(255,255,255,0.72)]">
                  Antes de comer em stress, no fim do dia ou sempre que precisares de abrandar.
                </p>
              </div>
            </div>
          }
        />

        <div className="grid gap-6">
          <SectionCard
            description="A Voz serve para criar mais regulacao, clareza e repeticao gentil ao longo do dia."
            eyebrow="Como usar"
            title="Uma presenca que te ajuda a voltar ao teu centro."
          >
            <div className="grid gap-3">
              <div className="flex items-start gap-4 rounded-[26px] border border-[rgba(15,26,20,0.06)] bg-[rgba(255,251,247,0.74)] p-5">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[rgba(198,167,94,0.14)]">
                  <HeartHandshake className="size-5 text-[#0F1A14]" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-[rgba(15,26,20,0.42)]">
                    Quando estas em alerta
                  </p>
                  <p className="mt-2 text-sm leading-7 text-[rgba(15,26,20,0.58)]">
                    Usa esta area para receber uma mensagem curta antes de reagires em piloto
                    automatico.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 rounded-[26px] border border-[rgba(15,26,20,0.06)] bg-[rgba(255,251,247,0.74)] p-5">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[rgba(233,205,191,0.26)]">
                  <Waves className="size-5 text-[#0F1A14]" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-[rgba(15,26,20,0.42)]">
                    Quando precisas de abrandar
                  </p>
                  <p className="mt-2 text-sm leading-7 text-[rgba(15,26,20,0.58)]">
                    Repetir uma mensagem simples pode ajudar o corpo a sentir mais previsibilidade.
                  </p>
                </div>
              </div>
            </div>
          </SectionCard>

          <Card className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[26px] border border-[rgba(15,26,20,0.06)] bg-[rgba(255,251,247,0.74)] p-5">
              <p className="text-[11px] uppercase tracking-[0.24em] text-[rgba(15,26,20,0.40)]">
                Presenca
              </p>
              <p className="mt-3 text-base font-medium text-[#0F1A14]">
                Mensagens que acompanham o teu ritmo, sem tom tecnico.
              </p>
            </div>
            <div className="rounded-[26px] border border-[rgba(15,26,20,0.06)] bg-[rgba(255,251,247,0.74)] p-5">
              <p className="text-[11px] uppercase tracking-[0.24em] text-[rgba(15,26,20,0.40)]">
                Evolucao
              </p>
              <p className="mt-3 text-base font-medium text-[#0F1A14]">
                As novas mensagens da Voz ganham audio quando disponivel, mantendo a mesma presença calma.
              </p>
            </div>
          </Card>
        </div>
      </div>

      <SectionCard
        description="Uma biblioteca curta, emocional e util para momentos em que precisas de orientacao leve."
        eyebrow="Mensagens recentes"
        title="Guarda por perto aquilo que te ajuda a regressar a ti."
      >
        <div className="space-y-4">
          {items.map((message, index) => (
            <Card
              className={index === 0 ? "border-[rgba(198,167,94,0.24)] bg-[linear-gradient(180deg,rgba(255,248,245,0.98),rgba(250,240,233,0.96))]" : ""}
              key={message.id}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex rounded-full bg-[rgba(198,167,94,0.14)] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-[#0F1A14]">
                      {messageTypeCopy[message.message_type] ?? message.message_type.replaceAll("_", " ")}
                    </span>
                    {index === 0 ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(15,26,20,0.06)] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-[rgba(15,26,20,0.52)]">
                        <Sparkles className="size-3" />
                        Mais recente
                      </span>
                    ) : null}
                  </div>
                  <h2 className="mt-3 text-xl font-medium text-[#0F1A14]">{message.title}</h2>
                  <p className="mt-2 text-sm text-[rgba(15,26,20,0.44)]">
                    {new Date(message.created_at).toLocaleDateString("pt-PT", {
                      day: "2-digit",
                      month: "long",
                    })}
                  </p>
                </div>
                {message.audio_playback_url ? (
                  <audio
                    className="h-10 w-[min(100%,220px)]"
                    controls
                    preload="none"
                    src={message.audio_playback_url}
                  >
                    <track kind="captions" />
                  </audio>
                ) : (
                  message.id === "fallback-voice" ? (
                    <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(15,26,20,0.08)] bg-[rgba(255,251,247,0.82)] px-4 py-2 text-sm text-[rgba(15,26,20,0.56)]">
                      <PlayCircle className="size-4" />
                      Audio em breve
                    </span>
                  ) : (
                    <form action={generateVoiceAudioAction}>
                      <input name="message_id" type="hidden" value={message.id} />
                      <button
                        className="inline-flex items-center gap-2 rounded-full border border-[rgba(15,26,20,0.12)] bg-[rgba(255,251,247,0.88)] px-4 py-2 text-sm font-medium text-[rgba(15,26,20,0.62)]"
                        type="submit"
                      >
                        <PlayCircle className="size-4" />
                        Gerar audio agora
                      </button>
                    </form>
                  )
                )}
              </div>
              <p className="mt-4 text-sm leading-8 text-[rgba(15,26,20,0.58)]">{message.body}</p>
            </Card>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
