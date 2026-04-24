import Link from "next/link";

import { Card } from "@/components/ui/card";
import { SectionCard } from "@/components/ui/section-card";
import {
  adminGrantProgramAction,
  adminRevokeProgramAction,
  adminSetFullAccessAction,
} from "@/features/admin/server/actions";
import { getAdminUserDetail } from "@/features/admin/server/queries";
import { requireSuperAdmin } from "@/lib/auth/super-admin";

function statusLabel(s: string) {
  if (s === "active") {
    return "Ativo";
  }
  if (s === "revoked") {
    return "Revogado";
  }
  if (s === "trial") {
    return "Trial";
  }
  if (s === "none") {
    return "Sem registo";
  }
  return s;
}

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSuperAdmin();
  const { id } = await params;
  const detail = await getAdminUserDetail(id);

  if (!detail) {
    return <p className="text-sm text-[rgba(15,26,20,0.56)]">Admin client indisponivel.</p>;
  }

  if (!detail.profile) {
    return (
      <div className="grid gap-4">
        <Link className="text-sm font-semibold text-[#735C00] underline" href="/admin">
          Voltar a lista
        </Link>
        <p className="text-sm text-[rgba(15,26,20,0.56)]">Perfil nao encontrado.</p>
      </div>
    );
  }

  const { profile, email, programs, recentCheckins, recentMeals, mealsWithPhotoCount } = detail;

  return (
    <div className="grid gap-6">
      <Link className="text-sm font-semibold text-[#735C00] underline" href="/admin">
        Voltar a lista
      </Link>

      <SectionCard eyebrow="Conta" title={profile.full_name ?? "Sem nome"}>
        <dl className="grid gap-3 text-sm leading-7 text-[rgba(15,26,20,0.72)] sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-[rgba(15,26,20,0.45)]">
              Email
            </dt>
            <dd>{email ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-[rgba(15,26,20,0.45)]">
              ID
            </dt>
            <dd className="break-all font-mono text-xs">{profile.id}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-[rgba(15,26,20,0.45)]">
              Role
            </dt>
            <dd>{profile.role}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-[rgba(15,26,20,0.45)]">
              Onboarding
            </dt>
            <dd>{profile.onboarding_completed ? "Completo" : "Pendente"}</dd>
          </div>
        </dl>

        <div className="flex flex-wrap items-center gap-3 border-t border-[rgba(15,26,20,0.08)] pt-5">
          <span className="text-sm font-medium text-[#0F1A14]">
            Acesso total (sem paywall, todos os programas na app)
          </span>
          <form action={adminSetFullAccessAction}>
            <input name="userId" type="hidden" value={profile.id} />
            <input name="next" type="hidden" value={profile.full_access ? "false" : "true"} />
            <button
              className="min-h-10 rounded-full bg-[linear-gradient(180deg,#D4AF37,#C6A75E)] px-5 text-sm font-semibold text-[#201B16] shadow-[0_12px_28px_rgba(198,167,94,0.2)]"
              type="submit"
            >
              {profile.full_access ? "Desativar acesso total" : "Ativar acesso total"}
            </button>
          </form>
          {profile.full_access ? (
            <span className="text-sm text-[#5c7a5f]">Acesso total ligado</span>
          ) : null}
        </div>
      </SectionCard>

      <SectionCard
        description="Estado real na tabela user_program_access. A app combina isto com full_access."
        eyebrow="Programas"
        title="Acesso por programa"
      >
        <ul className="grid gap-3">
          {programs.map(({ program: p, accessStatus }) => (
            <li key={p.id}>
              <Card className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <div className="min-w-0">
                  <p className="font-medium text-[#0F1A14]">{p.name}</p>
                  <p className="mt-1 text-xs text-[rgba(15,26,20,0.48)]">
                    {p.slug} · {p.access_level}
                    {p.price_reference ? ` · ${p.price_reference}` : ""}
                  </p>
                  <p className="mt-2 text-sm text-[rgba(15,26,20,0.58)]">
                    Estado: <span className="font-semibold">{statusLabel(accessStatus)}</span>
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  {accessStatus === "active" ? (
                    <form action={adminRevokeProgramAction}>
                      <input name="userId" type="hidden" value={profile.id} />
                      <input name="programId" type="hidden" value={p.id} />
                      <button
                        className="min-h-10 rounded-full border border-[rgba(15,26,20,0.15)] px-4 text-sm font-semibold text-[#0F1A14] hover:bg-[rgba(255,251,247,0.95)]"
                        type="submit"
                      >
                        Revogar
                      </button>
                    </form>
                  ) : (
                    <form action={adminGrantProgramAction}>
                      <input name="userId" type="hidden" value={profile.id} />
                      <input name="programId" type="hidden" value={p.id} />
                      <button
                        className="min-h-10 rounded-full bg-[#0F1A14] px-4 text-sm font-semibold text-[#FFFBF7] hover:brightness-110"
                        type="submit"
                      >
                        Conceder
                      </button>
                    </form>
                  )}
                </div>
              </Card>
            </li>
          ))}
        </ul>
      </SectionCard>

      <SectionCard eyebrow="Atividade" title="Resumo recente">
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="px-4 py-4" tone="soft">
            <p className="text-xs font-semibold uppercase tracking-wide text-[rgba(15,26,20,0.45)]">
              Refeicoes com foto
            </p>
            <p className="mt-2 text-2xl font-semibold text-[#0F1A14]">{mealsWithPhotoCount}</p>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <h3 className="mb-3 text-sm font-semibold text-[#0F1A14]">Check-ins recentes</h3>
            {recentCheckins.length === 0 ? (
              <p className="text-sm text-[rgba(15,26,20,0.52)]">Nenhum.</p>
            ) : (
              <ul className="space-y-2 text-sm text-[rgba(15,26,20,0.72)]">
                {recentCheckins.map((c) => (
                  <li className="rounded-2xl bg-[rgba(255,251,247,0.7)] px-3 py-2" key={c.id}>
                    Stress {c.stress_score} · Energia {c.energy_score} ·{" "}
                    {new Date(c.created_at).toLocaleString("pt-PT")}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold text-[#0F1A14]">Refeicoes recentes</h3>
            {recentMeals.length === 0 ? (
              <p className="text-sm text-[rgba(15,26,20,0.52)]">Nenhuma.</p>
            ) : (
              <ul className="space-y-2 text-sm text-[rgba(15,26,20,0.72)]">
                {recentMeals.map((m) => (
                  <li className="rounded-2xl bg-[rgba(255,251,247,0.7)] px-3 py-2" key={m.id}>
                    <span className="line-clamp-2">{m.meal_text}</span>
                    <span className="mt-1 block text-xs text-[rgba(15,26,20,0.45)]">
                      {new Date(m.created_at).toLocaleString("pt-PT")}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
