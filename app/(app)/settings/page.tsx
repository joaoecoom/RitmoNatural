import { SettingsForm } from "@/features/settings/components/settings-form";
import { getUserSettings } from "@/features/settings/server/queries";
import { requireCompletedOnboarding } from "@/lib/auth/session";

export default async function SettingsPage() {
  const { user } = await requireCompletedOnboarding();
  const settings = await getUserSettings(user.id);

  return <SettingsForm settings={settings} />;
}
