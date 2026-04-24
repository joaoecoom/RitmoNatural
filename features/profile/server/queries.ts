import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/domain";

export interface ProfilePageData {
  profile: Profile | null;
  avatarSignedUrl: string | null;
}

export async function getProfilePageData(userId: string): Promise<ProfilePageData> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      profile: null,
      avatarSignedUrl: null,
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (!profile?.avatar_url) {
    return {
      profile,
      avatarSignedUrl: null,
    };
  }

  const { data: signedAvatar } = await supabase.storage
    .from("profile-photos")
    .createSignedUrl(profile.avatar_url, 60 * 60);

  return {
    profile,
    avatarSignedUrl: signedAvatar?.signedUrl ?? null,
  };
}
