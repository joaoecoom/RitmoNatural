"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { markVoiceMessageReadAction } from "@/features/notifications/server/actions";
import type { VoiceMessage } from "@/types/domain";

const messageTypeCopy: Record<string, string> = {
  daily_guidance: "Mensagem da Voz",
  checkin_response: "Resposta ao check-in",
  meal_reflection: "Leitura da refeicao",
  encouragement: "Mensagem de apoio",
};

export function VoiceNotificationList({
  messages,
  readMessageIds,
}: {
  messages: VoiceMessage[];
  readMessageIds: string[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [optimisticReadIds, markOptimisticRead] = useOptimistic(
    new Set(readMessageIds),
    (current, messageId: string) => {
      const next = new Set(current);
      next.add(messageId);
      return next;
    },
  );

  function handleMarkRead(messageId: string) {
    startTransition(async () => {
      markOptimisticRead(messageId);
      const result = await markVoiceMessageReadAction(messageId);

      if (!result.ok) {
        router.refresh();
        return;
      }

      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {messages.map((notification, index) => {
        const isRead = optimisticReadIds.has(notification.id);
        const isFallback = notification.id === "fallback-notification";

        return (
          <Card
            className={
              !isRead && index === 0
                ? "border-[rgba(198,167,94,0.22)] bg-[linear-gradient(180deg,rgba(255,248,245,0.98),rgba(250,240,233,0.96))]"
                : ""
            }
            key={notification.id}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex rounded-full bg-[rgba(198,167,94,0.14)] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-[#0F1A14]">
                    {messageTypeCopy[notification.message_type] ?? notification.message_type}
                  </span>
                  {!isRead && !isFallback ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(15,26,20,0.06)] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-[rgba(15,26,20,0.52)]">
                      Novo
                    </span>
                  ) : null}
                </div>
                <h2 className="mt-3 text-xl font-medium text-[#0F1A14]">{notification.title}</h2>
                <p className="mt-2 text-sm text-[rgba(15,26,20,0.44)]">
                  {new Date(notification.created_at).toLocaleDateString("pt-PT", {
                    day: "2-digit",
                    month: "long",
                  })}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                {isFallback ? (
                  <div className="rounded-full bg-[rgba(255,251,247,0.82)] px-3 py-2 text-sm text-[rgba(15,26,20,0.52)] ring-1 ring-[rgba(15,26,20,0.06)]">
                    —
                  </div>
                ) : isRead ? (
                  <div className="rounded-full bg-[rgba(255,251,247,0.82)] px-3 py-2 text-sm text-[rgba(15,26,20,0.52)] ring-1 ring-[rgba(15,26,20,0.06)]">
                    Lido
                  </div>
                ) : (
                  <Button
                    disabled={pending}
                    onClick={() => handleMarkRead(notification.id)}
                    size="md"
                    variant="secondary"
                  >
                    Marcar como lido
                  </Button>
                )}
              </div>
            </div>
            <p className="mt-4 text-sm leading-8 text-[rgba(15,26,20,0.58)]">{notification.body}</p>
          </Card>
        );
      })}
    </div>
  );
}
