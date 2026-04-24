"use server";

import { revalidatePath } from "next/cache";

import { requireCompletedOnboarding } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function saveGoalsAction(_: unknown, formData: FormData) {
  const { user } = await requireCompletedOnboarding();
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return { ok: false as const, message: "Supabase nao configurado." };
  }

  const primary_goal = String(formData.get("primary_goal") ?? "").trim();
  const target_weight = String(formData.get("target_weight") ?? "").trim();
  const deadline = String(formData.get("deadline") ?? "").trim();
  const emotional_reason = String(formData.get("emotional_reason") ?? "").trim();

  if (!primary_goal) {
    return { ok: false as const, message: "Escolhe um objetivo principal." };
  }

  const weight =
    target_weight.length > 0 && !Number.isNaN(Number(target_weight))
      ? Number(target_weight)
      : null;

  const { error } = await supabase.from("goals").upsert(
    {
      user_id: user.id,
      primary_goal,
      target_weight: weight,
      deadline: deadline.length > 0 ? deadline : null,
      emotional_reason: emotional_reason.length > 0 ? emotional_reason : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (error) {
    return { ok: false as const, message: error.message };
  }

  await supabase
    .from("profiles")
    .update({ primary_goal, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  revalidatePath("/today");
  revalidatePath("/goals");

  return { ok: true as const, message: "Objetivos guardados." };
}
