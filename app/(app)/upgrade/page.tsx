import { getProgramsForUser } from "@/features/programs/server/queries";
import { UpgradeOverview } from "@/features/upgrade/components/upgrade-overview";
import { requireCompletedOnboarding } from "@/lib/auth/session";

export default async function UpgradePage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const { user, profile } = await requireCompletedOnboarding();
  const programs = await getProgramsForUser(user.id);
  const { checkout } = await searchParams;

  return (
    <UpgradeOverview
      checkout={checkout}
      fullAccess={profile?.full_access === true}
      programs={programs}
    />
  );
}
