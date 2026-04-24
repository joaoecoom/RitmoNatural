import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  DailyAdjustment,
  DailyCheckin,
  UserSettings,
  VoiceMessage,
} from "@/types/domain";

export interface NotificationsPageData {
  voiceMessages: VoiceMessage[];
  readMessageIds: string[];
  adjustments: DailyAdjustment[];
  latestCheckin: DailyCheckin | null;
  settings: UserSettings | null;
  preferences: {
    checkin_enabled: boolean;
    meal_reminders_enabled: boolean;
    voice_reminders_enabled: boolean;
    water_reminders_enabled: boolean;
    sleep_reminders_enabled: boolean;
  } | null;
  schedule: {
    breakfast_time: string;
    lunch_time: string;
    snack_time: string;
    dinner_time: string;
    sleep_time: string;
    wake_time: string;
  } | null;
  notificationSchedule: {
    checkin_time: string;
    water_time: string;
    meal_log_time: string;
    voice_time: string;
    sleep_time: string;
  } | null;
  history: Array<{
    id: string;
    title: string;
    body: string;
    type: string;
    sent_at: string | null;
    read_at: string | null;
    scheduled_for: string | null;
    created_at: string;
  }>;
}

export async function getNotificationsPageData(
  userId: string,
): Promise<NotificationsPageData> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      voiceMessages: [],
      readMessageIds: [],
      adjustments: [],
      latestCheckin: null,
      settings: null,
      preferences: null,
      schedule: null,
      notificationSchedule: null,
      history: [],
    };
  }

  const [
    { data: voiceMessages },
    { data: adjustments },
    { data: checkins },
    { data: settings },
    { data: preferences },
    { data: schedule },
    { data: notificationSchedule },
    { data: history },
  ] =
    await Promise.all([
      supabase
        .from("voice_messages")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(4),
      supabase
        .from("daily_adjustments")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(3),
      supabase
        .from("daily_checkins")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1),
      supabase.from("user_settings").select("*").eq("user_id", userId).maybeSingle(),
      supabase
        .from("notification_preferences")
        .select(
          "checkin_enabled, meal_reminders_enabled, voice_reminders_enabled, water_reminders_enabled, sleep_reminders_enabled",
        )
        .eq("user_id", userId)
        .maybeSingle(),
      supabase
        .from("user_schedule")
        .select("breakfast_time, lunch_time, snack_time, dinner_time, sleep_time, wake_time")
        .eq("user_id", userId)
        .maybeSingle(),
      supabase
        .from("notification_schedule")
        .select("checkin_time, water_time, meal_log_time, voice_time, sleep_time")
        .eq("user_id", userId)
        .maybeSingle(),
      supabase
        .from("notification_history")
        .select("id, title, body, type, sent_at, read_at, scheduled_for, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(8),
    ]);

  const messages = voiceMessages ?? [];
  let readMessageIds: string[] = [];

  if (messages.length > 0) {
    const messageIds = messages.map((message) => message.id);
    const { data: reads } = await supabase
      .from("voice_message_reads")
      .select("voice_message_id")
      .eq("user_id", userId)
      .in("voice_message_id", messageIds);

    readMessageIds = reads?.map((row) => row.voice_message_id) ?? [];
  }

  return {
    voiceMessages: messages,
    readMessageIds,
    adjustments: adjustments ?? [],
    latestCheckin: checkins?.[0] ?? null,
    settings: settings ?? null,
    preferences: preferences ?? null,
    schedule: schedule ?? null,
    notificationSchedule: notificationSchedule ?? null,
    history: history ?? [],
  };
}

export async function getApproxUnreadVoiceNotificationsCount(
  userId: string,
): Promise<number> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return 0;
  }

  const { data: recent } = await supabase
    .from("voice_messages")
    .select("id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(12);

  const ids = recent?.map((row) => row.id) ?? [];

  if (ids.length === 0) {
    return 0;
  }

  const { data: reads } = await supabase
    .from("voice_message_reads")
    .select("voice_message_id")
    .eq("user_id", userId)
    .in("voice_message_id", ids);

  const readSet = new Set(reads?.map((row) => row.voice_message_id));

  return ids.filter((id) => !readSet.has(id)).length;
}
