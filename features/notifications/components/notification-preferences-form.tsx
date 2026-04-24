"use client";

import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { SettingToggle } from "@/components/ui/setting-toggle";
import {
  resetNotificationScheduleAction,
  resetNotificationPreferencesAction,
  saveNotificationScheduleAction,
  saveNotificationPreferencesAction,
  type NotificationPreferencesActionState,
} from "@/features/notifications/server/actions";

const initialState: NotificationPreferencesActionState = {
  success: false,
  message: "",
};

export function NotificationPreferencesForm({
  prefs,
  schedule,
}: {
  prefs: {
    checkin_enabled: boolean;
    meal_reminders_enabled: boolean;
    voice_reminders_enabled: boolean;
    water_reminders_enabled: boolean;
    sleep_reminders_enabled: boolean;
  } | null;
  schedule: {
    checkin_time: string;
    water_time: string;
    meal_log_time: string;
    voice_time: string;
    sleep_time: string;
  } | null;
}) {
  const [state, action, pending] = useActionState(
    saveNotificationPreferencesAction,
    initialState,
  );
  const [scheduleState, scheduleAction, schedulePending] = useActionState(
    saveNotificationScheduleAction,
    initialState,
  );

  const [checkinEnabled, setCheckinEnabled] = useState(prefs?.checkin_enabled ?? true);
  const [mealEnabled, setMealEnabled] = useState(prefs?.meal_reminders_enabled ?? true);
  const [voiceEnabled, setVoiceEnabled] = useState(prefs?.voice_reminders_enabled ?? true);
  const [waterEnabled, setWaterEnabled] = useState(prefs?.water_reminders_enabled ?? true);
  const [sleepEnabled, setSleepEnabled] = useState(prefs?.sleep_reminders_enabled ?? true);

  return (
    <form action={action} className="space-y-3">
      <SettingToggle
        checked={checkinEnabled}
        description="Lembrete de check-in de manhã."
        title="Check-in matinal"
        onChange={setCheckinEnabled}
      />
      <SettingToggle
        checked={mealEnabled}
        description="Avisos antes/depois de refeições para consistência."
        title="Refeições"
        onChange={setMealEnabled}
      />
      <SettingToggle
        checked={waterEnabled}
        description="Lembretes curtos para água e regulação."
        title="Água"
        onChange={setWaterEnabled}
      />
      <SettingToggle
        checked={voiceEnabled}
        description="Mensagem da Voz durante a tarde."
        title="A Voz"
        onChange={setVoiceEnabled}
      />
      <SettingToggle
        checked={sleepEnabled}
        description="Rotina de desaceleração no fim do dia."
        title="Sono"
        onChange={setSleepEnabled}
      />

      <input name="checkin_enabled" type="hidden" value={String(checkinEnabled)} />
      <input name="meal_reminders_enabled" type="hidden" value={String(mealEnabled)} />
      <input name="voice_reminders_enabled" type="hidden" value={String(voiceEnabled)} />
      <input name="water_reminders_enabled" type="hidden" value={String(waterEnabled)} />
      <input name="sleep_reminders_enabled" type="hidden" value={String(sleepEnabled)} />

      {state.message ? (
        <p className="text-xs text-[rgba(15,26,20,0.58)]">{state.message}</p>
      ) : null}

      <div className="flex flex-wrap gap-2 pt-1">
        <Button disabled={pending} size="md" variant="gold">
          {pending ? "A guardar..." : "Guardar notificacoes"}
        </Button>
        <Button
          formAction={resetNotificationPreferencesAction}
          size="md"
          type="submit"
          variant="secondary"
        >
          Resetar padrao
        </Button>
      </div>

      <div className="mt-4 space-y-2 rounded-[20px] bg-[rgba(255,251,247,0.72)] p-3 ring-1 ring-[rgba(15,26,20,0.06)]">
        <p className="text-xs font-semibold uppercase tracking-wide text-[rgba(15,26,20,0.45)]">
          Horarios por tipo
        </p>
        <form action={scheduleAction} className="grid gap-2 sm:grid-cols-2">
          <label className="text-xs text-[rgba(15,26,20,0.62)]">
            Check-in
            <input
              className="mt-1 w-full rounded-xl border border-[rgba(15,26,20,0.1)] bg-white px-3 py-2"
              defaultValue={schedule?.checkin_time?.slice(0, 5) ?? "07:00"}
              name="checkin_time"
              type="time"
            />
          </label>
          <label className="text-xs text-[rgba(15,26,20,0.62)]">
            Água
            <input
              className="mt-1 w-full rounded-xl border border-[rgba(15,26,20,0.1)] bg-white px-3 py-2"
              defaultValue={schedule?.water_time?.slice(0, 5) ?? "12:40"}
              name="water_time"
              type="time"
            />
          </label>
          <label className="text-xs text-[rgba(15,26,20,0.62)]">
            Registo refeição
            <input
              className="mt-1 w-full rounded-xl border border-[rgba(15,26,20,0.1)] bg-white px-3 py-2"
              defaultValue={schedule?.meal_log_time?.slice(0, 5) ?? "13:45"}
              name="meal_log_time"
              type="time"
            />
          </label>
          <label className="text-xs text-[rgba(15,26,20,0.62)]">
            A Voz
            <input
              className="mt-1 w-full rounded-xl border border-[rgba(15,26,20,0.1)] bg-white px-3 py-2"
              defaultValue={schedule?.voice_time?.slice(0, 5) ?? "16:00"}
              name="voice_time"
              type="time"
            />
          </label>
          <label className="text-xs text-[rgba(15,26,20,0.62)] sm:col-span-2">
            Rotina de sono
            <input
              className="mt-1 w-full rounded-xl border border-[rgba(15,26,20,0.1)] bg-white px-3 py-2"
              defaultValue={schedule?.sleep_time?.slice(0, 5) ?? "22:30"}
              name="sleep_time"
              type="time"
            />
          </label>

          {scheduleState.message ? (
            <p className="text-xs text-[rgba(15,26,20,0.58)] sm:col-span-2">{scheduleState.message}</p>
          ) : null}

          <div className="flex flex-wrap gap-2 sm:col-span-2">
            <Button disabled={schedulePending} size="md" variant="secondary">
              {schedulePending ? "A guardar..." : "Guardar horarios"}
            </Button>
            <Button
              formAction={resetNotificationScheduleAction}
              size="md"
              type="submit"
              variant="secondary"
            >
              Horarios padrao
            </Button>
          </div>
        </form>
      </div>
    </form>
  );
}
