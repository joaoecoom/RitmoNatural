import { OnboardingFlow } from "@/features/onboarding/components/onboarding-flow";
import { requireOnboarding } from "@/lib/auth/session";

export default async function OnboardingPage() {
  await requireOnboarding();

  return (
    <div className="px-2 py-4">
      <OnboardingFlow />
    </div>
  );
}
