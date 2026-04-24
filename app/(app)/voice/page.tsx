import { VoiceFeed } from "@/features/voice/components/voice-feed";
import { getVoiceMessages } from "@/features/voice/server/queries";
import { requireCompletedOnboarding } from "@/lib/auth/session";

export default async function VoicePage() {
  const { user } = await requireCompletedOnboarding();
  const messages = await getVoiceMessages(user.id);

  return <VoiceFeed messages={messages} />;
}
