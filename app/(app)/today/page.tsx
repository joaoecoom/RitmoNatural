import { TodayOverview } from "@/features/today/components/today-overview";
import { getTodayPageData } from "@/features/today/server/queries";
import { requireCompletedOnboarding } from "@/lib/auth/session";

export default async function TodayPage() {
  const { user } = await requireCompletedOnboarding();
  const data = await getTodayPageData(user.id);

  return <TodayOverview data={data} />;
}
