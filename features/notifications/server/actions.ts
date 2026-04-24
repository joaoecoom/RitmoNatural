"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function markVoiceMessageReadAction(voiceMessageId: string) {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return { ok: false as const, message: "Supabase nao configurado." };
  }

  const { error } = await supabase.from("voice_message_reads").upsert(
    {
      user_id: user.id,
      voice_message_id: voiceMessageId,
      read_at: new Date().toISOString(),
    },
    { onConflict: "user_id,voice_message_id" },
  );

  if (error) {
    return { ok: false as const, message: error.message };
  }

  revalidatePath("/", "layout");
  revalidatePath("/notifications");
  revalidatePath("/dashboard");

  return { ok: true as const };
}
