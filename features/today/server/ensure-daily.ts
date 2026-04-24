import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { getTodayDateLisbon } from "@/lib/utils/today-date";
type Db = SupabaseClient;

const TASK_TEMPLATE: Array<{
  title: string;
  description: string;
  task_type: string;
  sort_order: number;
  deep_link: string | null;
  scheduleKey: "wake_time" | "breakfast_time" | "lunch_time" | "snack_time" | "dinner_time";
}> = [
  {
    title: "Check-in do corpo",
    description: "Um minuto para perceber stress, energia e desconforto.",
    task_type: "checkin",
    sort_order: 1,
    deep_link: "/check-in",
    scheduleKey: "wake_time",
  },
  {
    title: "Registar primeira refeicao",
    description: "Sem julgamento: nota o que comeste e como te sentiste.",
    task_type: "meal",
    sort_order: 2,
    deep_link: "/meals",
    scheduleKey: "breakfast_time",
  },
  {
    title: "Beber agua antes do almoco",
    description: "Um copo de agua antes do almoco da seguranca ao corpo.",
    task_type: "water",
    sort_order: 3,
    deep_link: null,
    scheduleKey: "lunch_time",
  },
  {
    title: "Pausa de 3 minutos para respirar",
    description: "Abdomen suave, expiracao longa, sem pressa de ser perfeita.",
    task_type: "breath",
    sort_order: 4,
    deep_link: null,
    scheduleKey: "snack_time",
  },
  {
    title: "Rever orientacao da Voz",
    description: "Ouve ou rele a mensagem mais recente com calma.",
    task_type: "voice",
    sort_order: 5,
    deep_link: "/voice",
    scheduleKey: "lunch_time",
  },
  {
    title: "Preparar proxima refeicao simples",
    description: "Algo leve e previsivel para o corpo nao entrar em alarme.",
    task_type: "meal",
    sort_order: 6,
    deep_link: "/meals",
    scheduleKey: "dinner_time",
  },
];

export async function ensureDailyJourneyForUser(supabase: Db, userId: string): Promise<void> {
  const journeyDate = getTodayDateLisbon();

  const { data: existing } = await supabase
    .from("daily_journey")
    .select("id")
    .eq("user_id", userId)
    .eq("journey_date", journeyDate)
    .maybeSingle();

  if (existing?.id) {
    const { count: taskCount } = await supabase
      .from("daily_tasks")
      .select("id", { count: "exact", head: true })
      .eq("journey_id", existing.id);

    if ((taskCount ?? 0) === 0) {
      const { data: schedule } = await supabase
        .from("user_schedule")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      const timeFor = (key: (typeof TASK_TEMPLATE)[number]["scheduleKey"]) => {
        const row = schedule as Record<string, unknown> | null | undefined;
        const raw = row?.[key];
        return typeof raw === "string" ? raw : null;
      };

      const rows = TASK_TEMPLATE.map((t) => ({
        user_id: userId,
        journey_id: existing.id,
        title: t.title,
        description: t.description,
        task_type: t.task_type,
        scheduled_time: timeFor(t.scheduleKey),
        sort_order: t.sort_order,
        deep_link: t.deep_link,
      }));

      await supabase.from("daily_tasks").insert(rows);
    }

    return;
  }

  const { count } = await supabase
    .from("daily_journey")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  const dayNumber = (count ?? 0) + 1;

  const { data: schedule } = await supabase
    .from("user_schedule")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  const { data: journey, error: jErr } = await supabase
    .from("daily_journey")
    .insert({
      user_id: userId,
      day_number: dayNumber,
      journey_date: journeyDate,
      status: "active",
      completed_steps: 0,
      total_steps: TASK_TEMPLATE.length,
    })
    .select("id")
    .single();

  if (jErr?.code === "23505") {
    return;
  }

  if (jErr || !journey) {
    return;
  }

  const timeFor = (key: (typeof TASK_TEMPLATE)[number]["scheduleKey"]) => {
    const row = schedule as Record<string, unknown> | null | undefined;
    const raw = row?.[key];
    return typeof raw === "string" ? raw : null;
  };

  const rows = TASK_TEMPLATE.map((t) => ({
    user_id: userId,
    journey_id: journey.id,
    title: t.title,
    description: t.description,
    task_type: t.task_type,
    scheduled_time: timeFor(t.scheduleKey),
    sort_order: t.sort_order,
    deep_link: t.deep_link,
  }));

  await supabase.from("daily_tasks").insert(rows);
}

export async function syncJourneyProgress(supabase: Db, journeyId: string, userId: string) {
  const { count } = await supabase
    .from("daily_tasks")
    .select("id", { count: "exact", head: true })
    .eq("journey_id", journeyId)
    .eq("user_id", userId)
    .eq("completed", true);

  const done = count ?? 0;
  const { data: j } = await supabase
    .from("daily_journey")
    .select("total_steps")
    .eq("id", journeyId)
    .maybeSingle();

  const total = j?.total_steps ?? TASK_TEMPLATE.length;

  await supabase
    .from("daily_journey")
    .update({
      completed_steps: done,
      status: done >= total ? "completed" : "active",
    })
    .eq("id", journeyId)
    .eq("user_id", userId);
}
