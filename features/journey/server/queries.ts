import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface JourneyDayRow {
  journey_date: string;
  day_number: number;
  status: string;
  completed_steps: number;
  total_steps: number;
}

export interface JourneyCalendarData {
  days: JourneyDayRow[];
  streak: number;
  weekCompletionPct: number;
}

export async function getJourneyCalendarData(userId: string): Promise<JourneyCalendarData> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return { days: [], streak: 0, weekCompletionPct: 0 };
  }

  const { data: rows } = await supabase
    .from("daily_journey")
    .select("journey_date, day_number, status, completed_steps, total_steps")
    .eq("user_id", userId)
    .order("journey_date", { ascending: false })
    .limit(42);

  const days = (rows ?? []) as JourneyDayRow[];

  let streak = 0;
  for (const d of days) {
    const total = d.total_steps || 1;
    const complete = d.completed_steps >= total && d.status === "completed";
    if (complete) {
      streak += 1;
    } else {
      break;
    }
  }

  const last7 = days.slice(0, 7);
  const weekCompletionPct =
    last7.length === 0
      ? 0
      : Math.round(
          (last7.filter((d) => d.total_steps > 0 && d.completed_steps >= d.total_steps).length /
            last7.length) *
            100,
        );

  return { days, streak, weekCompletionPct };
}
