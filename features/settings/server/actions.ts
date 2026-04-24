"use server";

import { revalidatePath } from "next/cache";

import { requireCompletedOnboarding } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface SettingsActionState {
  success: boolean;
  message: string;
}

export async function updateSettingsAction(
  _previousState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const { user } = await requireCompletedOnboarding();
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      success: false,
      message: "Supabase nao configurado.",
    };
  }

  const appearanceMode = String(formData.get("appearance_mode") ?? "soft");
  const pushNotifications = String(formData.get("push_notifications")) === "true";
  const dailyVoiceReminder = String(formData.get("daily_voice_reminder")) === "true";
  const mealReminders = String(formData.get("meal_reminders")) === "true";
  const weeklyReflection = String(formData.get("weekly_reflection")) === "true";
  const soundscapeEnabled = String(formData.get("soundscape_enabled")) === "true";

  const { error } = await supabase.from("user_settings").upsert({
    user_id: user.id,
    appearance_mode: appearanceMode,
    push_notifications: pushNotifications,
    daily_voice_reminder: dailyVoiceReminder,
    meal_reminders: mealReminders,
    weekly_reflection: weeklyReflection,
    soundscape_enabled: soundscapeEnabled,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  revalidatePath("/", "layout");
  revalidatePath("/settings");
  revalidatePath("/profile");
  revalidatePath("/dashboard");
  revalidatePath("/notifications");

  return {
    success: true,
    message: "Configuracoes guardadas com sucesso.",
  };
}
