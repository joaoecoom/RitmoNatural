"use server";

import { revalidatePath } from "next/cache";

import { requireCompletedOnboarding } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { syncJourneyProgress } from "./ensure-daily";

export async function completeDailyTaskAction(taskId: string): Promise<void> {
  const { user } = await requireCompletedOnboarding();
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return;
  }

  const { data: task, error: fetchErr } = await supabase
    .from("daily_tasks")
    .select("id, journey_id, user_id, completed")
    .eq("id", taskId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (fetchErr || !task || task.completed) {
    return;
  }

  const { error } = await supabase
    .from("daily_tasks")
    .update({
      completed: true,
      completed_at: new Date().toISOString(),
    })
    .eq("id", taskId)
    .eq("user_id", user.id);

  if (error) {
    return;
  }

  await syncJourneyProgress(supabase, task.journey_id, user.id);

  revalidatePath("/today");
  revalidatePath("/journey");
}
