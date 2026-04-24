import { ProgressOverview } from "@/features/progress/components/progress-overview";
import { getProgressViewData } from "@/features/progress/server/queries";
import { requireCompletedOnboarding } from "@/lib/auth/session";

export default async function ProgressPage() {
  const { user } = await requireCompletedOnboarding();
  const data = await getProgressViewData(user.id);

  return <ProgressOverview data={data} />;
}
