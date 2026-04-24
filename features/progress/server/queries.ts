import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getBodyStateLabel } from "@/lib/utils/progress";
import type { DailyCheckin, ProgressState } from "@/types/domain";

export interface ProgressViewData {
  currentState: ProgressState;
  history: ProgressState[];
  checkins: DailyCheckin[];
}

export async function getProgressViewData(userId: string): Promise<ProgressViewData> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    const fallbackState: ProgressState = {
      id: "fallback-progress",
      user_id: userId,
      score: 60,
      state_label: getBodyStateLabel(60),
      created_at: new Date().toISOString(),
    };

    return {
      currentState: fallbackState,
      history: [fallbackState],
      checkins: [],
    };
  }

  const [{ data: history }, { data: checkins }] = await Promise.all([
    supabase
      .from("progress_states")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("daily_checkins")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(7),
  ]);

  const currentState =
    history?.[0] ??
    ({
      id: "fallback-progress",
      user_id: userId,
      score: 60,
      state_label: getBodyStateLabel(60),
      created_at: new Date().toISOString(),
    } as ProgressState);

  return {
    currentState,
    history: history ?? [currentState],
    checkins: checkins ?? [],
  };
}
