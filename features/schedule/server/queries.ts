import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getScheduleForUser(userId: string) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const { data } = await supabase.from("user_schedule").select("*").eq("user_id", userId).maybeSingle();

  return data;
}
