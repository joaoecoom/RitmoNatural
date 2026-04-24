import { CheckinForm } from "@/features/checkins/components/checkin-form";
import { requireCompletedOnboarding } from "@/lib/auth/session";

export default async function CheckinPage() {
  await requireCompletedOnboarding();

  return <CheckinForm />;
}
