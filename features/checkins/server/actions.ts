"use server";

import { randomUUID } from "crypto";

import { generateVoiceReply } from "@/lib/ai";
import { requireCompletedOnboarding, requireUser } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { calculateProgressScore, getBodyStateLabel } from "@/lib/utils/progress";
import type { DailyCheckin } from "@/types/domain";

export interface CheckinActionState {
  success: boolean;
  message: string;
  voiceResponse?: string;
}

export async function submitCheckinAction(
  _previousState: CheckinActionState,
  formData: FormData,
): Promise<CheckinActionState> {
  const { user, profile } = await requireCompletedOnboarding();
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      success: false,
      message: "Supabase nao configurado.",
    };
  }

  const stressScore = Number(formData.get("stress_score") ?? 5);
  const energyScore = Number(formData.get("energy_score") ?? 5);
  const bloatingScore = Number(formData.get("bloating_score") ?? 5);
  const ventText = String(formData.get("vent_text") ?? "").trim();
  const ventTranscript = String(formData.get("vent_transcript") ?? "").trim();
  const ventAudio = formData.get("vent_audio");
  let ventAudioPath: string | null = null;

  if (ventAudio instanceof File && ventAudio.size > 0) {
    const extension = ventAudio.name.split(".").pop() || "webm";
    const filePath = `${user.id}/checkins/${Date.now()}-${randomUUID()}.${extension}`;
    const buffer = Buffer.from(await ventAudio.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from("voice-audio")
      .upload(filePath, buffer, {
        contentType: ventAudio.type || "audio/webm",
        upsert: false,
      });

    if (uploadError) {
      return {
        success: false,
        message: uploadError.message,
      };
    }

    ventAudioPath = filePath;
  }

  const voice = await generateVoiceReply({
    purpose: "checkin",
    context: `
Nome: ${profile.full_name ?? "utilizadora"}
Objetivo principal: ${profile.primary_goal ?? "ganhar leveza e consistencia"}
Check-in de hoje:
- Stress: ${stressScore}/10
- Energia: ${energyScore}/10
- Inchaco: ${bloatingScore}/10
- Desabafo: ${ventText || "Nao deixou desabafo escrito."}
- Transcricao falada: ${ventTranscript || "Sem transcricao adicional."}

Escreve uma resposta curta da Voz que reflita o estado atual e sugira um proximo passo gentil para hoje.
    `.trim(),
  });

  const { error } = await supabase.from("daily_checkins").insert({
    user_id: user.id,
    stress_score: stressScore,
    energy_score: energyScore,
    bloating_score: bloatingScore,
    vent_text: ventText || null,
    vent_audio_url: ventAudioPath,
    voice_response: voice.message,
  });

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  const score = calculateProgressScore({
    stressLevel: stressScore,
    sleepQuality: Math.max(4, energyScore),
    symptoms: bloatingScore >= 7 ? ["bloating"] : [],
  });

  await supabase.from("progress_states").insert({
    user_id: user.id,
    score,
    state_label: getBodyStateLabel(score),
  });

  await supabase.from("voice_messages").insert({
    user_id: user.id,
    title: "Resposta da Voz",
    body: voice.message,
    audio_url: null,
    message_type: "checkin_response",
  });

  return {
    success: true,
    message: "Check-in guardado com sucesso.",
    voiceResponse: voice.message,
  };
}

export async function getRecentCheckins(userId: string): Promise<DailyCheckin[]> {
  await requireUser();
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("daily_checkins")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(7);

  return data ?? [];
}
