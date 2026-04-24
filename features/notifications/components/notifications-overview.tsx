import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  ChevronRight,
  HeartHandshake,
  MessageCircleHeart,
  Settings2,
} from "lucide-react";

import { SectionCard } from "@/components/ui/section-card";
import { VoiceNotificationList } from "@/features/notifications/components/voice-notification-list";
import type { NotificationsPageData } from "@/features/notifications/server/queries";

export function NotificationsOverview({
  data,
}: {
  data: NotificationsPageData;
}) {
  const notifications =
    data.voiceMessages.length > 0
      ? data.voiceMessages
      : [
          {
            id: "fallback-notification",
            title: "A Voz esta contigo",
            body: "Quando houver novas mensagens, vao aparecer aqui com um tom leve e util.",
            message_type: "daily_guidance",
            created_at: new Date().toISOString(),
            audio_url: null,
            user_id: "fallback",
          },
        ];

  const readKey = [...data.readMessageIds].sort().join("|");

  return (
    <div className="grid gap-6">
      <div className="grid gap-6 lg:grid-cols-[0.96fr_1.04fr]">
        <SectionCard
          description="Este espaco junta sinais importantes da app sem criar ruido, para que saibas o que merece a tua atencao."
          eyebrow="Notificacoes"
          title="Tudo o que importa, com mais leveza."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[26px] border border-[rgba(198,167,94,0.18)] bg-[rgba(255,251,247,0.78)] p-5">
              <div className="flex size-11 items-center justify-center rounded-full bg-[linear-gradient(180deg,rgba(236,213,177,0.62),rgba(229,198,148,0.68))] text-[#201B16] shadow-[0_12px_24px_rgba(198,167,94,0.18)]">
                <Bell className="size-5" />
              </div>
              <p className="mt-4 text-base font-medium text-[#0F1A14]">
                Avisos suaves, mensagens da Voz e pequenos lembretes num so lugar.
              </p>
            </div>
            <div className="rounded-[26px] border border-[rgba(15,26,20,0.06)] bg-[rgba(255,251,247,0.74)] p-5">
              <p className="text-[11px] uppercase tracking-[0.24em] text-[rgba(15,26,20,0.40)]">
                Estado atual
              </p>
              <p className="mt-3 text-base font-medium text-[#0F1A14]">
                {data.settings?.push_notifications
                  ? "Notificacoes push ativas"
                  : "Notificacoes push desativadas"}
              </p>
              <p className="mt-2 text-sm leading-7 text-[rgba(15,26,20,0.58)]">
                Podes ajustar tudo a qualquer momento nas configuracoes.
              </p>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          description="Aqui ficas com uma visao rapida das areas que estao ativas neste momento."
          eyebrow="Resumo rapido"
          title="O que esta ligado agora."
        >
          <div className="space-y-3">
            <div className="flex items-start gap-4 rounded-[26px] border border-[rgba(15,26,20,0.06)] bg-[rgba(255,251,247,0.74)] p-5">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[rgba(198,167,94,0.14)]">
                <MessageCircleHeart className="size-5 text-[#0F1A14]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#0F1A14]">A Voz</p>
                <p className="mt-2 text-sm leading-7 text-[rgba(15,26,20,0.58)]">
                  {data.settings?.daily_voice_reminder
                    ? "Os lembretes da Voz estao ativos."
                    : "Os lembretes diarios da Voz estao desligados."}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-[26px] border border-[rgba(15,26,20,0.06)] bg-[rgba(255,251,247,0.74)] p-5">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[rgba(233,205,191,0.24)]">
                <HeartHandshake className="size-5 text-[#0F1A14]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#0F1A14]">Check-in mais recente</p>
                <p className="mt-2 text-sm leading-7 text-[rgba(15,26,20,0.58)]">
                  {data.latestCheckin
                    ? `Ultimo registo em ${new Date(data.latestCheckin.created_at).toLocaleDateString("pt-PT")}.`
                    : "Ainda nao tens nenhum check-in recente para destacar aqui."}
                </p>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <SectionCard
          description="Mensagens e sinais mais recentes da app, organizados sem parecer um centro de alertas pesado."
          eyebrow="Recentes"
          title="O que te quisemos dizer por ultimo."
        >
          <VoiceNotificationList
            key={readKey}
            messages={notifications}
            readMessageIds={
              data.voiceMessages.length > 0 ? data.readMessageIds : []
            }
          />
        </SectionCard>

        <div className="grid gap-6">
          <SectionCard
            description="Pequenos ajustes do dia e atalhos rapidos para mexer nas preferencias."
            eyebrow="Acoes"
            title="O que podes fazer aqui."
          >
            <div className="space-y-3">
              {(data.adjustments.length > 0
                ? data.adjustments
                : [
                    {
                      id: "fallback-adjustment",
                      title: "Ativa os lembretes suaves",
                      description:
                        "As notificacoes vao ajudar-te a manter consistencia sem pressao.",
                    },
                  ]
              ).map((adjustment) => (
                <div
                  className="rounded-[26px] border border-[rgba(15,26,20,0.06)] bg-[rgba(255,251,247,0.74)] p-5"
                  key={adjustment.id}
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 size-5 text-[#8A6A1C]" />
                    <div>
                      <p className="text-sm font-medium text-[#0F1A14]">{adjustment.title}</p>
                      <p className="mt-2 text-sm leading-7 text-[rgba(15,26,20,0.58)]">
                        {adjustment.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            description="Quando quiseres mudar o tipo de avisos ou a forma como a app te acompanha, e aqui que ajustas."
            eyebrow="Preferencias"
            title="Gerir configuracoes de notificacoes."
          >
            <Link
              className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(180deg,#D4AF37,#C6A75E)] px-5 py-3 text-sm font-semibold text-[#201B16] shadow-[0_14px_30px_rgba(198,167,94,0.24)] transition hover:-translate-y-0.5 hover:brightness-[1.02]"
              href="/settings"
            >
              <Settings2 className="size-4" />
              Abrir configuracoes
              <ChevronRight className="size-4" />
            </Link>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
