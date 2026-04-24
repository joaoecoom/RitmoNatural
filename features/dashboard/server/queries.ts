import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatRelativeStateLabel, getBodyStateLabel } from "@/lib/utils/progress";
import type {
  DailyAdjustment,
  ProgressState,
  Profile,
  VoiceMessage,
} from "@/types/domain";

export interface DashboardData {
  profile: Profile | null;
  progressState: ProgressState | null;
  latestVoiceMessage: VoiceMessage | null;
  adjustments: DailyAdjustment[];
}

export async function getDashboardData(userId: string): Promise<DashboardData> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      profile: null,
      progressState: null,
      latestVoiceMessage: null,
      adjustments: [],
    };
  }

  const [{ data: profile }, { data: progressStates }, { data: voiceMessages }, { data: adjustments }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase
        .from("progress_states")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1),
      supabase
        .from("voice_messages")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1),
      supabase
        .from("daily_adjustments")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(3),
    ]);

  return {
    profile,
    progressState:
      progressStates?.[0] ??
      ({
        id: "fallback-progress",
        user_id: userId,
        score: 52,
        state_label: getBodyStateLabel(52),
        created_at: new Date().toISOString(),
      } as ProgressState),
    latestVoiceMessage:
      voiceMessages?.[0] ??
      ({
        id: "fallback-voice",
        user_id: userId,
        title: "Mensagem do dia",
        body: "O teu corpo precisa de sinais de seguranca.",
        audio_url: null,
        message_type: "daily_guidance",
        created_at: new Date().toISOString(),
      } as VoiceMessage),
    adjustments: adjustments ?? [],
  };
}

export function getDashboardStateCopy(progressState: ProgressState | null) {
  const label =
    progressState?.state_label ?? ("A sair do Modo Sobrevivencia" as const);

  return {
    title: label,
    description: formatRelativeStateLabel(label),
  };
}
