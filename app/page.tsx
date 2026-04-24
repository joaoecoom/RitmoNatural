import { SetupNotice } from "@/components/ui/setup-notice";
import { SplashRedirect } from "@/features/auth/components/splash-redirect";
import { getCurrentProfile, getCurrentUser } from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/config/env";

export default async function Home() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <SetupNotice />
      </div>
    );
  }

  const user = await getCurrentUser();

  if (!user) {
    return <SplashRedirect destination="/welcome" />;
  }

  const profile = await getCurrentProfile();

  if (!profile?.onboarding_completed) {
    return <SplashRedirect destination="/onboarding" />;
  }

  return <SplashRedirect destination="/today" />;
}
