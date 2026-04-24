import { GoalsForm } from "@/features/goals/components/goals-form";
import { getGoalForUser } from "@/features/goals/server/queries";
import { requireCompletedOnboarding } from "@/lib/auth/session";

export default async function GoalsPage() {
  const { user, profile } = await requireCompletedOnboarding();
  const goal = await getGoalForUser(user.id);

  return <GoalsForm initial={goal} profileFallback={profile?.primary_goal ?? null} />;
}
