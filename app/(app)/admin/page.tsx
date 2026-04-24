import Link from "next/link";

import { Card } from "@/components/ui/card";
import { SectionCard } from "@/components/ui/section-card";
import { listProfilesForAdmin } from "@/features/admin/server/queries";
import { requireSuperAdmin } from "@/lib/auth/super-admin";

export default async function AdminHomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireSuperAdmin();
  const { q } = await searchParams;
  const rows = await listProfilesForAdmin(80, q);

  return (
    <div className="grid gap-6">
      <SectionCard
        description="Pesquisa por nome, UUID ou email. Emails usam a lista de Auth (ate 1000 contas por pagina)."
        eyebrow="Super Admin"
        title="Utilizadoras"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
          <form className="flex min-w-0 flex-1 flex-col gap-2 sm:max-w-md" action="/admin" method="get">
            <label className="text-xs font-semibold uppercase tracking-wide text-[rgba(15,26,20,0.45)]">
              Pesquisar
            </label>
            <div className="flex gap-2">
              <input
                className="min-h-11 flex-1 rounded-2xl border border-[rgba(15,26,20,0.1)] bg-white px-4 text-sm text-[#0F1A14] outline-none ring-[#735C00]/25 placeholder:text-[rgba(15,26,20,0.35)] focus:ring-2"
                defaultValue={q ?? ""}
                name="q"
                placeholder="Nome, email ou ID"
                type="search"
              />
              <button
                className="min-h-11 shrink-0 rounded-full bg-[linear-gradient(180deg,#D4AF37,#C6A75E)] px-5 text-sm font-semibold text-[#201B16] shadow-[0_12px_28px_rgba(198,167,94,0.2)]"
                type="submit"
              >
                Ir
              </button>
            </div>
          </form>
          <div className="flex flex-wrap gap-2 text-sm">
            <Link
              className="rounded-full border border-[rgba(15,26,20,0.12)] px-4 py-2 font-medium text-[#0F1A14] hover:bg-[rgba(255,251,247,0.9)]"
              href="/admin/programs"
            >
              Programas
            </Link>
            <Link
              className="rounded-full border border-[rgba(15,26,20,0.12)] px-4 py-2 font-medium text-[#0F1A14] hover:bg-[rgba(255,251,247,0.9)]"
              href="/admin/subscriptions"
            >
              Assinaturas
            </Link>
            <Link
              className="rounded-full border border-[rgba(15,26,20,0.12)] px-4 py-2 font-medium text-[#0F1A14] hover:bg-[rgba(255,251,247,0.9)]"
              href="/admin/notifications"
            >
              Notificacoes
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto rounded-[22px] ring-1 ring-[rgba(15,26,20,0.06)]">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[rgba(255,251,247,0.9)] text-xs uppercase tracking-wide text-[rgba(15,26,20,0.45)]">
              <tr>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Acesso total</th>
                <th className="px-4 py-3">Onboarding</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr className="border-t border-[rgba(15,26,20,0.06)]" key={r.id}>
                  <td className="px-4 py-3 font-medium text-[#0F1A14]">{r.full_name ?? "—"}</td>
                  <td className="max-w-[200px] truncate px-4 py-3 text-[rgba(15,26,20,0.62)]">
                    {r.email ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-[rgba(15,26,20,0.62)]">{r.role}</td>
                  <td className="px-4 py-3">{r.full_access ? "Sim" : "Nao"}</td>
                  <td className="px-4 py-3">{r.onboarding_completed ? "Sim" : "Nao"}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      className="font-semibold text-[#735C00] underline decoration-[rgba(115,92,0,0.35)] underline-offset-4"
                      href={`/admin/users/${r.id}`}
                    >
                      Detalhe
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 ? (
          <Card className="mt-4 px-4 py-4 text-sm text-[rgba(15,26,20,0.56)]">
            Sem resultados ou Supabase admin nao configurado. Verifica SUPABASE_SERVICE_ROLE_KEY.
          </Card>
        ) : null}
      </SectionCard>
    </div>
  );
}
