import Link from "next/link";

import { Card } from "@/components/ui/card";
import { SectionCard } from "@/components/ui/section-card";
import { requireSuperAdmin } from "@/lib/auth/super-admin";

export default async function AdminSubscriptionsPage() {
  await requireSuperAdmin();

  return (
    <div className="grid gap-6">
      <Link className="text-sm font-semibold text-[#735C00] underline" href="/admin">
        Voltar ao painel
      </Link>
      <SectionCard
        description="Quando o Stripe estiver ligado, aqui aparecem planos, faturas e estado da subscrição por utilizadora."
        eyebrow="Super Admin"
        title="Assinaturas"
      >
        <Card className="px-4 py-4 text-sm leading-7 text-[rgba(15,26,20,0.58)]" tone="soft">
          Ainda nao ha tabela de subscrições na base de dados. O acesso a programas pode ser gerido em cada
          perfil (acesso total ou programa a programa).
        </Card>
      </SectionCard>
    </div>
  );
}
