import { ProfileForm } from "@/features/profile/components/profile-form";
import { getProfilePageData } from "@/features/profile/server/queries";
import { requireCompletedOnboarding } from "@/lib/auth/session";

export default async function ProfilePage() {
  const { user } = await requireCompletedOnboarding();
  const data = await getProfilePageData(user.id);

  return (
    <ProfileForm avatarSignedUrl={data.avatarSignedUrl} profile={data.profile} />
  );
}
