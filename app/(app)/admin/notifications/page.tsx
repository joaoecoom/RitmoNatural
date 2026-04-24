import Link from "next/link";

import { Card } from "@/components/ui/card";
import { SectionCard } from "@/components/ui/section-card";
import { requireSuperAdmin } from "@/lib/auth/super-admin";

export default async function AdminNotificationsPage() {
  await requireSuperAdmin();

  return (
    <div className="grid gap-6">
      <Link className="text-sm font-semibold text-[#735C00] underline" href="/admin">
        Voltar ao painel
      </Link>
      <SectionCard
        description="A tabela notification_history fica por utilizadora. Aqui podemos acrescentar envios em massa e modelos quando o canal push estiver ativo."
        eyebrow="Super Admin"
        title="Notificacoes"
      >
        <Card className="px-4 py-4 text-sm leading-7 text-[rgba(15,26,20,0.58)]" tone="soft">
          Gestao global de notificacoes (templates, campanhas) fica para a fase do servico de push. Por agora,
          as preferencias estao em notification_preferences por utilizadora.
        </Card>
      </SectionCard>
    </div>
  );
}
