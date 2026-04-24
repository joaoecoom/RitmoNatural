"use server";

import { revalidatePath } from "next/cache";

import { requireCompletedOnboarding } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formTimeToDb } from "@/lib/utils/time-db";

export async function saveScheduleAction(_: unknown, formData: FormData) {
  const { user } = await requireCompletedOnboarding();
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return { ok: false as const, message: "Supabase nao configurado." };
  }

  const breakfast_time = formTimeToDb(String(formData.get("breakfast_time") ?? ""));
  const lunch_time = formTimeToDb(String(formData.get("lunch_time") ?? ""));
  const snack_time = formTimeToDb(String(formData.get("snack_time") ?? ""));
  const dinner_time = formTimeToDb(String(formData.get("dinner_time") ?? ""));
  const sleep_time = formTimeToDb(String(formData.get("sleep_time") ?? ""));
  const wake_time = formTimeToDb(String(formData.get("wake_time") ?? ""));

  if (!breakfast_time || !lunch_time || !snack_time || !dinner_time || !sleep_time || !wake_time) {
    return { ok: false as const, message: "Preenche todos os horarios." };
  }

  const { error } = await supabase.from("user_schedule").upsert(
    {
      user_id: user.id,
      breakfast_time,
      lunch_time,
      snack_time,
      dinner_time,
      sleep_time,
      wake_time,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (error) {
    return { ok: false as const, message: error.message };
  }

  revalidatePath("/schedule");
  revalidatePath("/today");

  return { ok: true as const, message: "Horarios guardados." };
}
