import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

import { synthesizeVoiceMp3 } from "./openai-tts";

export async function attachVoiceAudioToMessage(
  supabase: SupabaseClient<Database>,
  userId: string,
  messageId: string,
  spokenText: string,
): Promise<void> {
  const mp3 = await synthesizeVoiceMp3(spokenText);
  if (!mp3) {
    return;
  }

  const path = `${userId}/voice/${messageId}.mp3`;

  const { error: uploadError } = await supabase.storage.from("voice-audio").upload(path, mp3, {
    contentType: "audio/mpeg",
    upsert: true,
  });

  if (uploadError) {
    console.error("[VOICE_AUDIO_UPLOAD]", uploadError.message);
    return;
  }

  const { error: updateError } = await supabase
    .from("voice_messages")
    .update({ audio_url: path })
    .eq("id", messageId)
    .eq("user_id", userId);

  if (updateError) {
    console.error("[VOICE_AUDIO_DB]", updateError.message);
  }
}
