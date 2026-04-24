import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface GoalRow {
  primary_goal: string;
  target_weight: number | null;
  deadline: string | null;
  emotional_reason: string | null;
}

export async function getGoalForUser(userId: string): Promise<GoalRow | null> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const { data } = await supabase.from("goals").select("*").eq("user_id", userId).maybeSingle();

  return data as GoalRow | null;
}
