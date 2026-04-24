import "server-only";

import { formatDateLisbon, getTodayDateLisbon } from "@/lib/utils/today-date";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/domain";

import { ensureDailyJourneyForUser } from "./ensure-daily";

export interface DailyTaskRow {
  id: string;
  title: string;
  description: string;
  task_type: string;
  scheduled_time: string | null;
  sort_order: number;
  deep_link: string | null;
  completed: boolean;
}

export interface DailyJourneyRow {
  id: string;
  day_number: number;
  journey_date: string;
  status: string;
  completed_steps: number;
  total_steps: number;
}

export interface TodayDaySummary {
  checkinsTodayCount: number;
  avgStress: number | null;
  avgEnergy: number | null;
  mealsTodayCount: number;
  /** Texto da Voz (mensagem do dia ou resposta ao check-in), se existir. */
  closingVoice: string | null;
}

export interface TodayPageData {
  profile: Profile | null;
  journey: DailyJourneyRow | null;
  tasks: DailyTaskRow[];
  latestScore: number | null;
  stateLabel: string | null;
  goalLine: string | null;
  summary: TodayDaySummary;
}

export async function getTodayPageData(userId: string): Promise<TodayPageData> {
  const supabase = await createSupabaseServerClient();

  const emptySummary: TodayDaySummary = {
    checkinsTodayCount: 0,
    avgStress: null,
    avgEnergy: null,
    mealsTodayCount: 0,
    closingVoice: null,
  };

  if (!supabase) {
    return {
      profile: null,
      journey: null,
      tasks: [],
      latestScore: null,
      stateLabel: null,
      goalLine: null,
      summary: emptySummary,
    };
  }

  await ensureDailyJourneyForUser(supabase, userId);

  const journeyDate = getTodayDateLisbon();

  const [
    { data: profile },
    { data: journey },
    { data: progress },
    { data: goalRow },
    { data: checkinRows },
    { data: mealRows },
    { data: voiceRows },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase
      .from("daily_journey")
      .select("id, day_number, journey_date, status, completed_steps, total_steps")
      .eq("user_id", userId)
      .eq("journey_date", journeyDate)
      .maybeSingle(),
    supabase
      .from("progress_states")
      .select("score, state_label")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase.from("goals").select("primary_goal").eq("user_id", userId).maybeSingle(),
    supabase
      .from("daily_checkins")
      .select("stress_score, energy_score, voice_response, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(40),
    supabase
      .from("meal_entries")
      .select("id, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(40),
    supabase
      .from("voice_messages")
      .select("body, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  let tasks: DailyTaskRow[] = [];

  if (journey?.id) {
    const { data: taskRows } = await supabase
      .from("daily_tasks")
      .select(
        "id, title, description, task_type, scheduled_time, sort_order, deep_link, completed",
      )
      .eq("journey_id", journey.id)
      .eq("user_id", userId)
      .order("sort_order", { ascending: true });

    tasks = (taskRows ?? []) as DailyTaskRow[];
  }

  const goalLine =
    goalRow?.primary_goal ??
    profile?.primary_goal ??
    "Definir um foco simples para esta fase.";

  const checkinsToday = (checkinRows ?? []).filter(
    (r) => formatDateLisbon(r.created_at) === journeyDate,
  );
  const mealsToday = (mealRows ?? []).filter(
    (r) => formatDateLisbon(r.created_at) === journeyDate,
  );
  const voicesToday = (voiceRows ?? []).filter(
    (r) => formatDateLisbon(r.created_at) === journeyDate,
  );

  const latestCheckinWithVoice = [...checkinsToday]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .find((c) => c.voice_response?.trim());
  const closingVoice =
    latestCheckinWithVoice?.voice_response?.trim() ??
    voicesToday[0]?.body?.trim() ??
    null;

  const avgStress =
    checkinsToday.length > 0
      ? Math.round(
          checkinsToday.reduce((s, c) => s + c.stress_score, 0) / checkinsToday.length,
        )
      : null;
  const avgEnergy =
    checkinsToday.length > 0
      ? Math.round(
          checkinsToday.reduce((s, c) => s + c.energy_score, 0) / checkinsToday.length,
        )
      : null;

  return {
    profile: profile as Profile | null,
    journey: journey as DailyJourneyRow | null,
    tasks,
    latestScore: progress?.score ?? null,
    stateLabel: progress?.state_label ?? null,
    goalLine,
    summary: {
      checkinsTodayCount: checkinsToday.length,
      avgStress,
      avgEnergy,
      mealsTodayCount: mealsToday.length,
      closingVoice,
    },
  };
}
