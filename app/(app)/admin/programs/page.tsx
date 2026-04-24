import Link from "next/link";

import { Card } from "@/components/ui/card";
import { SectionCard } from "@/components/ui/section-card";
import { requireSuperAdmin } from "@/lib/auth/super-admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export default async function AdminProgramsPage() {
  await requireSuperAdmin();
  const admin = createSupabaseAdminClient();

  if (!admin) {
    return <p className="text-sm text-[rgba(15,26,20,0.56)]">Admin client indisponivel.</p>;
  }

  const { data: programs } = await admin
    .from("programs")
    .select(
      "id, name, slug, description, access_level, price_reference, stripe_price_id, active, sort_order",
    )
    .order("sort_order", { ascending: true });

  return (
    <div className="grid gap-6">
      <Link className="text-sm font-semibold text-[#735C00] underline" href="/admin">
        Voltar ao painel
      </Link>
      <SectionCard
        description="Catalogo global. Alteracoes de precos ou copy podem ser feitas na base de dados ou numa iteracao com formularios."
        eyebrow="Super Admin"
        title="Programas"
      >
        <ul className="grid gap-3">
          {(programs ?? []).map((p) => (
            <li key={p.id}>
              <Card className="px-4 py-4 sm:px-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-[#0F1A14]">{p.name}</p>
                    <p className="mt-1 font-mono text-xs text-[rgba(15,26,20,0.45)]">{p.slug}</p>
                    {p.description ? (
                      <p className="mt-2 text-sm leading-7 text-[rgba(15,26,20,0.58)]">{p.description}</p>
                    ) : null}
                  </div>
                  <div className="shrink-0 text-right text-xs text-[rgba(15,26,20,0.52)]">
                    <p>{p.access_level}</p>
                    {p.price_reference ? <p className="mt-1">{p.price_reference}</p> : null}
                    <p className="mt-1 font-mono text-[10px] text-[rgba(15,26,20,0.38)]">
                      Stripe: {p.stripe_price_id ?? "—"}
                    </p>
                    <p className="mt-1">{p.active ? "Ativo" : "Inativo"}</p>
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}
