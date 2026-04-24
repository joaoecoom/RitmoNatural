"use server";

import { randomUUID } from "crypto";

import { interpretMealWithOpenRouter } from "@/lib/ai";
import { requireCompletedOnboarding } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { attachVoiceAudioToMessage } from "@/lib/voice/attach-message-audio";
import type { MealEntry } from "@/types/domain";

export interface MealActionState {
  success: boolean;
  message: string;
  interpretation?: string;
}

export async function submitMealEntryAction(
  _previousState: MealActionState,
  formData: FormData,
): Promise<MealActionState> {
  const { user, profile } = await requireCompletedOnboarding();
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      success: false,
      message: "Supabase nao configurado.",
    };
  }

  const mealText = String(formData.get("meal_text") ?? "").trim();
  const file = formData.get("meal_photo");

  if (!mealText) {
    return {
      success: false,
      message: "Descreve a tua refeicao para continuar.",
    };
  }

  let imagePath: string | null = null;

  if (file instanceof File && file.size > 0) {
    const extension = file.name.split(".").pop() || "jpg";
    const filePath = `${user.id}/${Date.now()}-${randomUUID()}.${extension}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from("meal-photos")
      .upload(filePath, buffer, {
        contentType: file.type || "image/jpeg",
        upsert: false,
      });

    if (uploadError) {
      return {
        success: false,
        message: uploadError.message,
      };
    }

    imagePath = filePath;
  }

  const interpretation = await interpretMealWithOpenRouter({
    mealText,
    context: `
Nome: ${profile.full_name ?? "utilizadora"}
Objetivo principal: ${profile.primary_goal ?? "sentir mais leveza"}
Fase de vida: ${profile.life_phase ?? "nao especificada"}
Existe foto: ${imagePath ? "sim" : "nao"}

Faz uma leitura desta refeicao em tom emocional e simples, sem julgamento.
    `.trim(),
  });

  const { error } = await supabase.from("meal_entries").insert({
    user_id: user.id,
    meal_text: mealText,
    image_url: imagePath,
    interpretation: interpretation.interpretation,
  });

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  const { data: voiceRow, error: voiceInsertError } = await supabase
    .from("voice_messages")
    .insert({
      user_id: user.id,
      title: "Leitura da refeicao",
      body: interpretation.interpretation,
      audio_url: null,
      message_type: "meal_reflection",
    })
    .select("id")
    .single();

  if (voiceInsertError) {
    console.error("[MEAL_VOICE_INSERT]", voiceInsertError.message);
  } else if (voiceRow?.id) {
    await attachVoiceAudioToMessage(supabase, user.id, voiceRow.id, interpretation.interpretation);
  }

  return {
    success: true,
    message: "Refeicao guardada com sucesso.",
    interpretation: interpretation.interpretation,
  };
}

export async function getMealEntries(userId: string): Promise<MealEntry[]> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("meal_entries")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(8);

  return data ?? [];
}
