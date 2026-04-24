import type { PropsWithChildren } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { AppearanceRoot } from "@/components/providers/appearance-root";
import { getApproxUnreadVoiceNotificationsCount } from "@/features/notifications/server/queries";
import { getUserSettings } from "@/features/settings/server/queries";
import { getCurrentProfile, requireUser } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AuthenticatedLayout({
  children,
}: PropsWithChildren) {
  const user = await requireUser();
  const profile = await getCurrentProfile();
  const settings = await getUserSettings(user.id);
  const notificationBadgeCount = await getApproxUnreadVoiceNotificationsCount(user.id);
  const supabase = await createSupabaseServerClient();
  let avatarSignedUrl: string | null = null;

  if (supabase && profile?.avatar_url) {
    const { data } = await supabase.storage
      .from("profile-photos")
      .createSignedUrl(profile.avatar_url, 60 * 60);

    avatarSignedUrl = data?.signedUrl ?? null;
  }

  return (
    <AppearanceRoot
      appearance={settings.appearance_mode}
      pushNotifications={settings.push_notifications}
      soundscapeEnabled={settings.soundscape_enabled}
    >
      <AppShell
        appearance={settings.appearance_mode}
        avatarSignedUrl={avatarSignedUrl}
        notificationBadgeCount={notificationBadgeCount}
        profile={profile}
      >
        {children}
      </AppShell>
    </AppearanceRoot>
  );
}
