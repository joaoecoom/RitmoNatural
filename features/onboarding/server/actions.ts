"use server";

import { redirect } from "next/navigation";

import { generateVoiceReply } from "@/lib/ai";
import { requireUser } from "@/lib/auth/session";
import { env } from "@/lib/config/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  calculateProgressScore,
  getBodyStateLabel,
} from "@/lib/utils/progress";
import type { Symptom } from "@/types/domain";

export async function completeOnboardingAction(formData: FormData) {
  try {
    const user = await requireUser();
    const supabase = await createSupabaseServerClient();

    if (!supabase) {
      throw new Error("Supabase nao configurado.");
    }

    const fullName = String(formData.get("full_name") ?? "").trim();
    const age = Number(formData.get("age") ?? 0);
    const primaryGoal = String(formData.get("primary_goal") ?? "").trim();
    const lifePhase = String(formData.get("life_phase") ?? "none");
    const symptomsRaw = String(formData.get("symptoms") ?? "[]");
    const stressLevel = Number(formData.get("stress_level") ?? 5);
    const sleepQuality = Number(formData.get("sleep_quality") ?? 5);
    const notes = String(formData.get("notes") ?? "").trim();
    const acceptsNotifications =
      String(formData.get("accepts_notifications") ?? "false") === "true";

    const symptoms = JSON.parse(symptomsRaw) as Symptom[];
    const score = calculateProgressScore({ stressLevel, sleepQuality, symptoms });
    const stateLabel = getBodyStateLabel(score);
    const voice = await generateVoiceReply({
      purpose: "welcome",
      context: `
Nova utilizadora da Ritmo Natural.
Nome: ${fullName || "utilizadora"}
Objetivo principal: ${primaryGoal || "recuperar leveza e confianca no corpo"}
Fase de vida: ${lifePhase}
Estado atual do corpo: ${stateLabel}
Sintomas principais: ${symptoms.join(", ") || "nao indicados"}
Notas: ${notes || "sem notas adicionais"}

Escreve uma mensagem de boas-vindas curta, calorosa e pessoal.
      `.trim(),
    });

    const { error: profileError } = await supabase.from("profiles").upsert({
      id: user.id,
      full_name: fullName,
      age,
      life_phase: lifePhase,
      primary_goal: primaryGoal,
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    });

    if (profileError) {
      throw new Error(profileError.message);
    }

    const { error: answerError } = await supabase.from("onboarding_answers").insert({
      user_id: user.id,
      symptoms,
      stress_level: stressLevel,
      sleep_quality: sleepQuality,
      notes: notes || null,
      accepts_notifications: acceptsNotifications,
    });

    if (answerError) {
      throw new Error(answerError.message);
    }

    await supabase.from("progress_states").insert({
      user_id: user.id,
      score,
      state_label: stateLabel,
    });

    await supabase.from("voice_messages").insert({
      user_id: user.id,
      title: "A tua nova fase comeca hoje",
      body: voice.message,
      audio_url: null,
      message_type: "daily_guidance",
    });

    await supabase.from("daily_adjustments").insert([
      {
        user_id: user.id,
        title: "Abranda no inicio do dia",
        description: "Comeca com uma refeicao simples e um ritmo mais calmo.",
        adjustment_type: "meal",
        is_completed: false,
      },
      {
        user_id: user.id,
        title: "Da ao corpo um sinal de seguranca",
        description: "Faz uma pausa curta para respirar antes do almoco.",
        adjustment_type: "mindset",
        is_completed: false,
      },
      {
        user_id: user.id,
        title: "Fecha o dia com leveza",
        description: "Escolhe algo mais leve ao jantar e evita comer em stress.",
        adjustment_type: "rest",
        is_completed: false,
      },
    ]);

    redirect("/dashboard");
  } catch (error) {
    console.error("[ONBOARDING_DEBUG_ERROR]", {
      message: error instanceof Error ? error.message : "unknown error",
      supabaseUrl: env.supabaseUrl,
      hasAnonKey: Boolean(env.supabaseAnonKey),
      hasServiceRole: Boolean(env.supabaseServiceRoleKey),
    });

    throw error;
  }
}

export async function seedWelcomeVoiceMessage(userId: string) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return;
  }

  const voice = await generateVoiceReply({
    purpose: "encouragement",
    context: `
Nova utilizadora acabou de entrar na Ritmo Natural.
Cria uma mensagem curta de encorajamento para os primeiros momentos dentro da app.
    `.trim(),
  });

  await supabase.from("voice_messages").insert({
    user_id: userId,
    title: "A Voz esta contigo",
    body: voice.message,
    audio_url: null,
    message_type: "encouragement",
  });
}
