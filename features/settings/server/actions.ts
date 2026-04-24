"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireCompletedOnboarding } from "@/lib/auth/session";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface SettingsActionState {
  success: boolean;
  message: string;
}

export interface ResetActionState {
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
  revalidatePath("/today");
  revalidatePath("/dashboard");
  revalidatePath("/notifications");

  return {
    success: true,
    message: "Configuracoes guardadas com sucesso.",
  };
}

export async function resetAppProgressAction(
  _previousState: ResetActionState,
  formData: FormData,
): Promise<ResetActionState> {
  const { user } = await requireCompletedOnboarding();
  const confirm = String(formData.get("confirm_reset") ?? "").trim();

  if (confirm !== "RESETAR") {
    return {
      success: false,
      message: "Escreve RESETAR para confirmar.",
    };
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return {
      success: false,
      message: "Supabase admin nao configurado.",
    };
  }

  // Mantém auth/assinatura/acessos; reinicia progresso e onboarding.
  const tablesToClear = [
    "daily_tasks",
    "daily_journey",
    "daily_checkins",
    "meal_entries",
    "progress_states",
    "daily_adjustments",
    "voice_messages",
    "notification_history",
    "goals",
    "onboarding_answers",
  ] as const;

  for (const table of tablesToClear) {
    const { error } = await admin.from(table).delete().eq("user_id", user.id);
    if (error) {
      return {
        success: false,
        message: `Falha ao limpar ${table}: ${error.message}`,
      };
    }
  }

  const { error: scheduleError } = await admin.from("user_schedule").upsert(
    {
      user_id: user.id,
      breakfast_time: "08:00:00",
      lunch_time: "13:00:00",
      snack_time: "16:30:00",
      dinner_time: "20:00:00",
      sleep_time: "23:00:00",
      wake_time: "07:00:00",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (scheduleError) {
    return {
      success: false,
      message: scheduleError.message,
    };
  }

  const { error: profileError } = await admin
    .from("profiles")
    .update({
      onboarding_completed: false,
      primary_goal: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (profileError) {
    return {
      success: false,
      message: profileError.message,
    };
  }

  revalidatePath("/", "layout");
  revalidatePath("/today");
  revalidatePath("/journey");
  revalidatePath("/goals");
  revalidatePath("/programs");
  revalidatePath("/notifications");
  revalidatePath("/settings");

  redirect("/onboarding");
}
