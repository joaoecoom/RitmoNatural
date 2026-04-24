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
    };
  }

  const [{ data: voiceMessages }, { data: adjustments }, { data: checkins }, { data: settings }] =
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
