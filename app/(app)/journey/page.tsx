import { JourneyOverview } from "@/features/journey/components/journey-overview";
import { getJourneyCalendarData } from "@/features/journey/server/queries";
import { requireCompletedOnboarding } from "@/lib/auth/session";

export default async function JourneyPage() {
  const { user } = await requireCompletedOnboarding();
  const data = await getJourneyCalendarData(user.id);

  return <JourneyOverview data={data} />;
}
