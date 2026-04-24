import { NextResponse } from "next/server";

import { generateVoiceReply } from "@/lib/ai";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getTodayDateLisbon } from "@/lib/utils/today-date";

export const runtime = "nodejs";

interface VoiceResponsePayload {
  response: string;
  recommendation: string;
  tone: string;
  nextAction: string;
}

function buildLocalFallback(params: {
  firstName: string;
  stress: number | null;
  energy: number | null;
  completed: number;
  total: number;
  nextTaskTitle: string;
  goal: string;
}): VoiceResponsePayload {
  const { firstName, stress, energy, completed, total, nextTaskTitle, goal } = params;
  const stressText =
    stress === null ? "sem check-in de stress ainda" : stress >= 8 ? "em alerta" : stress >= 5 ? "sensivel" : "mais regulado";
  const energyText =
    energy === null ? "energia por medir" : energy <= 3 ? "energia baixa" : energy <= 6 ? "energia media" : "boa energia";

  return {
    response: `${firstName}, hoje o teu corpo parece ${stressText} e com ${energyText}. Ja concluíste ${completed}/${total} passos. Vamos simples para manter seguranca interna.`,
    recommendation: `Agora foca em: ${nextTaskTitle}.`,
    tone: stress !== null && stress >= 8 ? "reconfortante" : "encorajador",
    nextAction: `${nextTaskTitle} (${goal})`,
  };
}

function isVoiceResponsePayload(value: unknown): value is VoiceResponsePayload {
  if (!value || typeof value !== "object") {
    return false;
  }
  const v = value as Record<string, unknown>;
  return (
    typeof v.response === "string" &&
    typeof v.recommendation === "string" &&
    typeof v.tone === "string" &&
    typeof v.nextAction === "string"
  );
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase nao configurado." }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Nao autenticada." }, { status: 401 });
  }

  const payload = (await request.json().catch(() => ({}))) as {
    userMessage?: string;
  };

  const userMessage = payload.userMessage?.trim() ?? "";
  const today = getTodayDateLisbon();

  const [
    { data: profile },
    { data: goal },
    { data: schedule },
    { data: latestCheckin },
    { data: journey },
    { data: tasks },
  ] = await Promise.all([
    supabase.from("profiles").select("full_name, primary_goal, life_phase").eq("id", user.id).maybeSingle(),
    supabase.from("goals").select("primary_goal, emotional_reason").eq("user_id", user.id).maybeSingle(),
    supabase
      .from("user_schedule")
      .select("breakfast_time, lunch_time, snack_time, dinner_time, sleep_time, wake_time")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("daily_checkins")
      .select("stress_score, energy_score, bloating_score, vent_text, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("daily_journey")
      .select("id, day_number, completed_steps, total_steps")
      .eq("user_id", user.id)
      .eq("journey_date", today)
      .maybeSingle(),
    supabase
      .from("daily_tasks")
      .select("title, task_type, completed")
      .eq("user_id", user.id)
      .order("sort_order", { ascending: true })
      .limit(8),
  ]);

  const nextTask = (tasks ?? []).find((t) => !t.completed);
  const completed = (tasks ?? []).filter((t) => t.completed).length;
  const firstName = profile?.full_name?.trim().split(" ")[0] ?? "Tu";
  const primaryGoal =
    goal?.primary_goal ?? profile?.primary_goal ?? "voltar ao Ritmo Natural";

  const voice = await generateVoiceReply({
    purpose: "checkin",
    context: `
Nome: ${profile?.full_name ?? "utilizadora"}
Objetivo principal: ${primaryGoal}
Motivo emocional: ${goal?.emotional_reason ?? "nao definido"}
Fase de vida: ${profile?.life_phase ?? "nao definida"}

Check-in mais recente:
- Stress: ${latestCheckin?.stress_score ?? "sem check-in"}/10
- Energia: ${latestCheckin?.energy_score ?? "sem check-in"}/10
- Inchaco: ${latestCheckin?.bloating_score ?? "sem check-in"}/10
- Desabafo: ${latestCheckin?.vent_text ?? "sem desabafo"}

Jornada de hoje:
- Dia: ${journey?.day_number ?? "n/a"}
- Progresso: ${completed}/${tasks?.length ?? journey?.total_steps ?? 0}
- Proximo passo: ${nextTask?.title ?? "fechar o dia com leveza"}

Horarios de rotina:
- Acordar: ${schedule?.wake_time ?? "07:00"}
- Dormir: ${schedule?.sleep_time ?? "23:00"}
- Refeicoes: ${schedule?.breakfast_time ?? "08:00"}, ${schedule?.lunch_time ?? "13:00"}, ${schedule?.snack_time ?? "16:30"}, ${schedule?.dinner_time ?? "20:00"}

Mensagem livre da utilizadora: ${userMessage || "sem mensagem adicional"}

Responde como "A Voz" com linguagem emocional e prática.
Entregar JSON com:
{
  "response": "mensagem curta (2-3 frases)",
  "recommendation": "uma acao simples para agora",
  "tone": "calmo | foco | reconfortante | encorajador",
  "nextAction": "texto curto do proximo passo"
}
    `.trim(),
  });

  let parsed: VoiceResponsePayload | null = null;

  try {
    const candidate = JSON.parse(voice.message) as unknown;
    parsed = isVoiceResponsePayload(candidate) ? candidate : null;
  } catch {
    parsed = null;
  }

  // Se o modelo nao devolver JSON valido, usamos um fallback local contextual.
  const fallback: VoiceResponsePayload = buildLocalFallback({
    firstName,
    stress: latestCheckin?.stress_score ?? null,
    energy: latestCheckin?.energy_score ?? null,
    completed,
    total: tasks?.length ?? journey?.total_steps ?? 0,
    nextTaskTitle: nextTask?.title ?? "uma pausa de respiracao e hidratacao",
    goal: primaryGoal,
  });

  const result = parsed ?? fallback;

  await supabase.from("voice_messages").insert({
    user_id: user.id,
    title: "Orientacao da Voz",
    body: result.response,
    audio_url: null,
    message_type: "daily_guidance",
  });

  return NextResponse.json({
    ...result,
    source: voice.provider === "openrouter" ? "A Voz" : "A Voz (fallback local)",
  });
}
