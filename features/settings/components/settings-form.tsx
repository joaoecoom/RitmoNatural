"use client";

import { useActionState, useEffect, useState } from "react";
import { MoonStar, ShieldCheck, Sparkles, Volume2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { OptionCard } from "@/components/ui/option-card";
import { SectionCard } from "@/components/ui/section-card";
import { SettingToggle } from "@/components/ui/setting-toggle";
import {
  updateSettingsAction,
  type SettingsActionState,
} from "@/features/settings/server/actions";
import type { UserSettings } from "@/types/domain";

const initialState: SettingsActionState = {
  success: false,
  message: "",
};

const appearanceModes: Array<{
  id: "light" | "soft" | "dark";
  title: string;
  description: string;
}> = [
  {
    id: "light",
    title: "Claro",
    description: "Mais brilho visual e uma leitura mais aberta.",
  },
  {
    id: "soft",
    title: "Suave",
    description: "O equilibrio certo entre leveza, calor e conforto visual.",
  },
  {
    id: "dark",
    title: "Escuro",
    description: "Mais contraste para momentos de luz baixa.",
  },
];

export function SettingsForm({ settings }: { settings: UserSettings }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(updateSettingsAction, initialState);
  const [appearanceMode, setAppearanceMode] = useState(settings.appearance_mode);
  const [pushNotifications, setPushNotifications] = useState(settings.push_notifications);
  const [dailyVoiceReminder, setDailyVoiceReminder] = useState(
    settings.daily_voice_reminder,
  );
  const [mealReminders, setMealReminders] = useState(settings.meal_reminders);
  const [weeklyReflection, setWeeklyReflection] = useState(settings.weekly_reflection);
  const [soundscapeEnabled, setSoundscapeEnabled] = useState(settings.soundscape_enabled);

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [router, state.success]);

  return (
    <div className="grid gap-6">
      <div className="grid gap-6 lg:grid-cols-[0.94fr_1.06fr]">
        <SectionCard
          description="Define como queres que a app apareça, lembre e acompanhe o teu ritmo."
          eyebrow="Configuracoes"
          title="Mantem a experiencia alinhada contigo."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[26px] border border-[rgba(15,26,20,0.06)] bg-[rgba(255,251,247,0.74)] p-5">
              <div className="flex size-11 items-center justify-center rounded-full bg-[rgba(198,167,94,0.14)]">
                <MoonStar className="size-5 text-[#0F1A14]" />
              </div>
              <p className="mt-4 text-base font-medium text-[#0F1A14]">
                Aparencia guardada para uma experiencia mais tua.
              </p>
            </div>
            <div className="rounded-[26px] border border-[rgba(15,26,20,0.06)] bg-[rgba(255,251,247,0.74)] p-5">
              <div className="flex size-11 items-center justify-center rounded-full bg-[rgba(233,205,191,0.24)]">
                <ShieldCheck className="size-5 text-[#0F1A14]" />
              </div>
              <p className="mt-4 text-base font-medium text-[#0F1A14]">
                Preferencias simples, sem ruido e sem areas agressivas de conta.
              </p>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          description="Estas escolhas ajudam a app a manter o tom certo, sem transformar a experiencia num painel tecnico."
          eyebrow="Preferencias"
          title="Ajusta o essencial."
        >
          <form action={action} className="space-y-6">
            <div className="space-y-3">
              <p className="text-sm font-medium tracking-[0.01em] text-[rgba(77,70,53,0.92)]">
                Aparencia
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                {appearanceModes.map((mode) => (
                  <OptionCard
                    description={mode.description}
                    icon={<Sparkles className="size-4 text-[#735C00]" />}
                    key={mode.id}
                    selected={appearanceMode === mode.id}
                    title={mode.title}
                    onClick={() => setAppearanceMode(mode.id)}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <SettingToggle
                checked={pushNotifications}
                description="Avisos suaves quando a app tiver suporte completo para push."
                title="Notificacoes push"
                onChange={setPushNotifications}
              />
              <SettingToggle
                checked={dailyVoiceReminder}
                description="Um lembrete leve para voltares a ouvir a Voz."
                title="Lembrete diario da Voz"
                onChange={setDailyVoiceReminder}
              />
              <SettingToggle
                checked={mealReminders}
                description="Pequenos toques para te ajudar a manter previsibilidade nas refeicoes."
                title="Lembretes de refeicoes"
                onChange={setMealReminders}
              />
              <SettingToggle
                checked={weeklyReflection}
                description="Uma leitura curta para rever como o teu corpo respondeu na semana."
                title="Resumo semanal"
                onChange={setWeeklyReflection}
              />
              <SettingToggle
                checked={soundscapeEnabled}
                description="Ativa sons suaves quando a app ganhar mais momentos guiados de audio."
                title="Sons e ambiente"
                onChange={setSoundscapeEnabled}
              />
            </div>

            <input name="appearance_mode" readOnly type="hidden" value={appearanceMode} />
            <input
              name="push_notifications"
              readOnly
              type="hidden"
              value={String(pushNotifications)}
            />
            <input
              name="daily_voice_reminder"
              readOnly
              type="hidden"
              value={String(dailyVoiceReminder)}
            />
            <input
              name="meal_reminders"
              readOnly
              type="hidden"
              value={String(mealReminders)}
            />
            <input
              name="weekly_reflection"
              readOnly
              type="hidden"
              value={String(weeklyReflection)}
            />
            <input
              name="soundscape_enabled"
              readOnly
              type="hidden"
              value={String(soundscapeEnabled)}
            />

            {state.message ? (
              <p className="rounded-[24px] bg-[rgba(255,251,247,0.82)] px-4 py-4 text-sm text-[rgba(15,26,20,0.60)]">
                {state.message}
              </p>
            ) : null}

            <div className="flex justify-end">
              <Button disabled={pending} size="lg" variant="gold">
                {pending ? "A guardar..." : "Guardar configuracoes"}
              </Button>
            </div>
          </form>
        </SectionCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard
          description="Sem meter coisas agressivas de subscricao aqui. O foco desta area e conforto de uso."
          eyebrow="Conta"
          title="Mais simples, mais premium."
        >
          <div className="rounded-[26px] border border-[rgba(15,26,20,0.06)] bg-[rgba(255,251,247,0.74)] p-5">
            <p className="text-sm leading-8 text-[rgba(15,26,20,0.58)]">
              Ajustes de faturacao, alteracoes de plano ou pedidos sensiveis podem ficar fora desta
              area e ser tratados mais tarde por suporte, sem criar friccao visual dentro da app.
            </p>
          </div>
        </SectionCard>

        <SectionCard
          description="Algumas opcoes ja ficam guardadas; outras ficam preparadas para quando a infraestrutura estiver ligada."
          eyebrow="Estado atual"
          title="O que estas preferencias ja fazem."
        >
          <div className="space-y-3">
            <div className="rounded-[26px] border border-[rgba(15,26,20,0.06)] bg-[rgba(255,251,247,0.74)] p-5">
              <div className="flex items-center gap-3">
                <Volume2 className="size-5 text-[#0F1A14]" />
                <p className="text-sm font-medium text-[#0F1A14]">Guardado na tua conta</p>
              </div>
              <p className="mt-3 text-sm leading-8 text-[rgba(15,26,20,0.58)]">
                Aparencia e preferencias ficam guardadas para a app te reconhecer melhor.
              </p>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
