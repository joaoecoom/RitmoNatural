import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { VoiceMessage } from "@/types/domain";

export type VoiceMessageView = VoiceMessage & {
  audio_playback_url: string | null;
};

export async function getVoiceFeedMessages(userId: string): Promise<VoiceMessageView[]> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("voice_messages")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(12);

  const rows = data ?? [];
  const out: VoiceMessageView[] = [];

  for (const m of rows) {
    let audio_playback_url: string | null = null;
    if (m.audio_url) {
      if (m.audio_url.startsWith("http")) {
        audio_playback_url = m.audio_url;
      } else {
        const { data: signed } = await supabase.storage
          .from("voice-audio")
          .createSignedUrl(m.audio_url, 60 * 60);

        audio_playback_url = signed?.signedUrl ?? null;
      }
    }

    out.push({ ...(m as VoiceMessage), audio_playback_url });
  }

  return out;
}
