import { NotificationsOverview } from "@/features/notifications/components/notifications-overview";
import { getNotificationsPageData } from "@/features/notifications/server/queries";
import { requireCompletedOnboarding } from "@/lib/auth/session";

export default async function NotificationsPage() {
  const { user } = await requireCompletedOnboarding();
  const data = await getNotificationsPageData(user.id);

  return <NotificationsOverview data={data} />;
}
