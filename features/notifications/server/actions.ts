"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function markVoiceMessageReadAction(voiceMessageId: string) {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return { ok: false as const, message: "Supabase nao configurado." };
  }

  const { error } = await supabase.from("voice_message_reads").upsert(
    {
      user_id: user.id,
      voice_message_id: voiceMessageId,
      read_at: new Date().toISOString(),
    },
    { onConflict: "user_id,voice_message_id" },
  );

  if (error) {
    return { ok: false as const, message: error.message };
  }

  revalidatePath("/", "layout");
  revalidatePath("/notifications");
  revalidatePath("/today");
  revalidatePath("/dashboard");

  return { ok: true as const };
}

export interface NotificationPreferencesActionState {
  success: boolean;
  message: string;
}

const defaultNotificationPrefs = {
  checkin_enabled: true,
  meal_reminders_enabled: true,
  voice_reminders_enabled: true,
  water_reminders_enabled: true,
  sleep_reminders_enabled: true,
};

export async function saveNotificationPreferencesAction(
  _previousState: NotificationPreferencesActionState,
  formData: FormData,
): Promise<NotificationPreferencesActionState> {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return { success: false, message: "Supabase nao configurado." };
  }

  const payload = {
    user_id: user.id,
    checkin_enabled: String(formData.get("checkin_enabled")) === "true",
    meal_reminders_enabled: String(formData.get("meal_reminders_enabled")) === "true",
    voice_reminders_enabled: String(formData.get("voice_reminders_enabled")) === "true",
    water_reminders_enabled: String(formData.get("water_reminders_enabled")) === "true",
    sleep_reminders_enabled: String(formData.get("sleep_reminders_enabled")) === "true",
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("notification_preferences")
    .upsert(payload, { onConflict: "user_id" });

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/", "layout");
  revalidatePath("/notifications");
  revalidatePath("/settings");

  return { success: true, message: "Preferencias de notificacao guardadas." };
}

export async function resetNotificationPreferencesAction(): Promise<void> {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return;
  }

  await supabase.from("notification_preferences").upsert(
    {
      user_id: user.id,
      ...defaultNotificationPrefs,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  revalidatePath("/notifications");
  revalidatePath("/settings");
}

function toTime(value: string, fallback: string): string {
  const v = value.trim();
  if (!v) {
    return fallback;
  }
  return v.length === 5 ? `${v}:00` : v;
}

export async function saveNotificationScheduleAction(
  _previousState: NotificationPreferencesActionState,
  formData: FormData,
): Promise<NotificationPreferencesActionState> {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return { success: false, message: "Supabase nao configurado." };
  }

  const checkin_time = toTime(String(formData.get("checkin_time") ?? ""), "07:00:00");
  const water_time = toTime(String(formData.get("water_time") ?? ""), "12:40:00");
  const meal_log_time = toTime(String(formData.get("meal_log_time") ?? ""), "13:45:00");
  const voice_time = toTime(String(formData.get("voice_time") ?? ""), "16:00:00");
  const sleep_time = toTime(String(formData.get("sleep_time") ?? ""), "22:30:00");

  const { error } = await supabase.from("notification_schedule").upsert(
    {
      user_id: user.id,
      checkin_time,
      water_time,
      meal_log_time,
      voice_time,
      sleep_time,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/notifications");
  revalidatePath("/settings");
  return { success: true, message: "Horarios de notificacao guardados." };
}

export async function resetNotificationScheduleAction(): Promise<void> {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return;
  }

  await supabase.from("notification_schedule").upsert(
    {
      user_id: user.id,
      checkin_time: "07:00:00",
      water_time: "12:40:00",
      meal_log_time: "13:45:00",
      voice_time: "16:00:00",
      sleep_time: "22:30:00",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  revalidatePath("/notifications");
}
