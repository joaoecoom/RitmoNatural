import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { UserSettings } from "@/types/domain";

const fallbackSettings: UserSettings = {
  user_id: "fallback",
  appearance_mode: "soft",
  push_notifications: true,
  daily_voice_reminder: true,
  meal_reminders: false,
  weekly_reflection: true,
  soundscape_enabled: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export async function getUserSettings(userId: string): Promise<UserSettings> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      ...fallbackSettings,
      user_id: userId,
    };
  }

  const { data } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (data) {
    return data;
  }

  return {
    ...fallbackSettings,
    user_id: userId,
  };
}
