"use server";

import { revalidatePath } from "next/cache";

import { requireCompletedOnboarding } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { syncJourneyProgress } from "./ensure-daily";

export interface CompleteTaskActionState {
  success: boolean;
  message: string;
  completedCount: number;
  totalCount: number;
}

export const initialCompleteTaskActionState: CompleteTaskActionState = {
  success: false,
  message: "",
  completedCount: 0,
  totalCount: 0,
};

function buildCompletionMessage(params: {
  title: string;
  completedCount: number;
  totalCount: number;
}): string {
  const { title, completedCount, totalCount } = params;

  if (totalCount > 0 && completedCount >= totalCount) {
    return "Incrivel. Fechaste o plano de hoje e deste um sinal claro de seguranca ao corpo.";
  }

  if (completedCount >= 3) {
    return `Boa. ${title} ficou concluida. Ja tens ${completedCount}/${totalCount} no plano de hoje.`;
  }

  return `Boa. ${title} feita. Mais um sinal de seguranca para o corpo.`;
}

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

export async function completeDailyTaskWithFeedbackAction(
  _previousState: CompleteTaskActionState,
  formData: FormData,
): Promise<CompleteTaskActionState> {
  const { user } = await requireCompletedOnboarding();
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      success: false,
      message: "Supabase nao configurado.",
      completedCount: 0,
      totalCount: 0,
    };
  }

  const taskId = String(formData.get("task_id") ?? "").trim();
  const taskTitle = String(formData.get("task_title") ?? "Tarefa").trim() || "Tarefa";

  if (!taskId) {
    return {
      success: false,
      message: "Tarefa invalida.",
      completedCount: 0,
      totalCount: 0,
    };
  }

  const { data: task, error: fetchErr } = await supabase
    .from("daily_tasks")
    .select("id, journey_id, user_id, completed")
    .eq("id", taskId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (fetchErr || !task) {
    return {
      success: false,
      message: "Nao foi possivel encontrar a tarefa.",
      completedCount: 0,
      totalCount: 0,
    };
  }

  if (!task.completed) {
    const { error } = await supabase
      .from("daily_tasks")
      .update({
        completed: true,
        completed_at: new Date().toISOString(),
      })
      .eq("id", taskId)
      .eq("user_id", user.id);

    if (error) {
      return {
        success: false,
        message: "Nao foi possivel concluir a tarefa agora.",
        completedCount: 0,
        totalCount: 0,
      };
    }

    await syncJourneyProgress(supabase, task.journey_id, user.id);
  }

  const { data: allTasks } = await supabase
    .from("daily_tasks")
    .select("completed")
    .eq("journey_id", task.journey_id)
    .eq("user_id", user.id);

  const totalCount = allTasks?.length ?? 0;
  const completedCount = (allTasks ?? []).filter((row) => row.completed).length;

  revalidatePath("/today");
  revalidatePath("/journey");

  return {
    success: true,
    message: buildCompletionMessage({
      title: taskTitle,
      completedCount,
      totalCount,
    }),
    completedCount,
    totalCount,
  };
}
