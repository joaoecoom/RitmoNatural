"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { attachVoiceAudioToMessage } from "@/lib/voice/attach-message-audio";

export async function generateVoiceAudioAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return;
  }

  const messageId = String(formData.get("message_id") ?? "").trim();
  if (!messageId) {
    return;
  }

  const { data: row } = await supabase
    .from("voice_messages")
    .select("id, body, audio_url")
    .eq("id", messageId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!row || row.audio_url) {
    revalidatePath("/voice");
    return;
  }

  await attachVoiceAudioToMessage(supabase, user.id, row.id, row.body);
  revalidatePath("/voice");
}
