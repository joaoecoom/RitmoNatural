import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { VoiceMessage } from "@/types/domain";

export async function getVoiceMessages(userId: string): Promise<VoiceMessage[]> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("voice_messages")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);

  return data ?? [];
}
