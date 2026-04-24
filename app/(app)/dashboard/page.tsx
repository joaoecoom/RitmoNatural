import { DashboardOverview } from "@/features/dashboard/components/dashboard-overview";
import { getDashboardData } from "@/features/dashboard/server/queries";
import { requireCompletedOnboarding } from "@/lib/auth/session";

export default async function DashboardPage() {
  const { user } = await requireCompletedOnboarding();
  const data = await getDashboardData(user.id);

  return <DashboardOverview data={data} />;
}
