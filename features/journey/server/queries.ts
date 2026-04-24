import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatDateLisbon } from "@/lib/utils/today-date";

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
  stressLevel: "low" | "moderate" | "high";
  nextMilestone: string;
  challenges: Array<{
    id: string;
    title: string;
    current: number;
    target: number;
    done: boolean;
  }>;
}

export async function getJourneyCalendarData(userId: string): Promise<JourneyCalendarData> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      days: [],
      streak: 0,
      weekCompletionPct: 0,
      stressLevel: "moderate",
      nextMilestone: "Completar o primeiro dia da jornada.",
      challenges: [],
    };
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

  const [{ data: checkins }, { data: meals }, { data: voices }, { data: sleepTasks }] =
    await Promise.all([
      supabase
        .from("daily_checkins")
        .select("stress_score, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(40),
      supabase
        .from("meal_entries")
        .select("created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(40),
      supabase
        .from("voice_messages")
        .select("created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(40),
      supabase
        .from("daily_tasks")
        .select("completed, created_at")
        .eq("user_id", userId)
        .eq("task_type", "sleep")
        .order("created_at", { ascending: false })
        .limit(30),
    ]);

  const checkinDays = new Set((checkins ?? []).map((r) => formatDateLisbon(r.created_at)));
  const mealDays = new Set((meals ?? []).map((r) => formatDateLisbon(r.created_at)));
  const voiceDays = new Set((voices ?? []).map((r) => formatDateLisbon(r.created_at)));
  const sleepDone = (sleepTasks ?? []).filter((t) => t.completed).length;

  const lastStress = (checkins ?? []).slice(0, 7).map((c) => c.stress_score);
  const avgStress =
    lastStress.length > 0
      ? Math.round(lastStress.reduce((sum, v) => sum + v, 0) / lastStress.length)
      : 5;

  const stressLevel: JourneyCalendarData["stressLevel"] =
    avgStress <= 4 ? "low" : avgStress <= 7 ? "moderate" : "high";

  const challenges: JourneyCalendarData["challenges"] = [
    {
      id: "checkin-3",
      title: "3 dias de check-in",
      current: Math.min(checkinDays.size, 3),
      target: 3,
      done: checkinDays.size >= 3,
    },
    {
      id: "meals-5",
      title: "5 dias com refeicao registada",
      current: Math.min(mealDays.size, 5),
      target: 5,
      done: mealDays.size >= 5,
    },
    {
      id: "voice-7",
      title: "7 dias com orientacao da Voz",
      current: Math.min(voiceDays.size, 7),
      target: 7,
      done: voiceDays.size >= 7,
    },
    {
      id: "sleep-3",
      title: "3 noites com rotina de sono",
      current: Math.min(sleepDone, 3),
      target: 3,
      done: sleepDone >= 3,
    },
  ];

  const nextMilestone =
    challenges.find((c) => !c.done)?.title ??
    (streak < 7 ? `Chegar a ${Math.max(streak + 1, 7)} dias seguidos` : "Manter consistencia semanal");

  return { days, streak, weekCompletionPct, stressLevel, nextMilestone, challenges };
}
