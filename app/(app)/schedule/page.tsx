import { ScheduleForm } from "@/features/schedule/components/schedule-form";
import { getScheduleForUser } from "@/features/schedule/server/queries";
import { requireCompletedOnboarding } from "@/lib/auth/session";

export default async function SchedulePage() {
  const { user } = await requireCompletedOnboarding();
  const row = await getScheduleForUser(user.id);
  const defaults = {
    wake_time: "07:00:00",
    breakfast_time: "08:00:00",
    lunch_time: "13:00:00",
    snack_time: "16:30:00",
    dinner_time: "20:00:00",
    sleep_time: "23:00:00",
  };

  return (
    <ScheduleForm
      initial={(row as Record<string, string> | null) ?? defaults}
    />
  );
}
