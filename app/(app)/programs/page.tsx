import { Card } from "@/components/ui/card";
import { ProgramsOverview } from "@/features/programs/components/programs-overview";
import { getProgramsForUser } from "@/features/programs/server/queries";
import { requireCompletedOnboarding } from "@/lib/auth/session";

export default async function ProgramsPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const { user, profile } = await requireCompletedOnboarding();
  const programs = await getProgramsForUser(user.id);
  const { checkout } = await searchParams;

  return (
    <div className="grid gap-4">
      {checkout === "ok" ? (
        <Card className="px-4 py-3 text-sm text-[#2d3f30]" tone="soft">
          Pagamento recebido. Se o programa ainda nao aparecer ativo, atualiza a pagina — o webhook
          Stripe demora segundos.
        </Card>
      ) : null}
      <ProgramsOverview fullAccess={profile?.full_access === true} programs={programs} />
    </div>
  );
}
