import Link from "next/link";

import { Card } from "@/components/ui/card";
import { SectionCard } from "@/components/ui/section-card";
import { requireSuperAdmin } from "@/lib/auth/super-admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export default async function AdminNotificationsPage() {
  await requireSuperAdmin();
  const admin = createSupabaseAdminClient();

  if (!admin) {
    return <p className="text-sm text-[rgba(15,26,20,0.56)]">Admin client indisponivel.</p>;
  }

  const [{ data: history }, { data: prefs }, { data: profiles }] = await Promise.all([
    admin
      .from("notification_history")
      .select("id, user_id, title, body, type, sent_at, read_at, created_at")
      .order("created_at", { ascending: false })
      .limit(80),
    admin
      .from("notification_preferences")
      .select(
        "user_id, checkin_enabled, meal_reminders_enabled, voice_reminders_enabled, water_reminders_enabled, sleep_reminders_enabled",
      )
      .limit(300),
    admin.from("profiles").select("id, full_name").limit(300),
  ]);

  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.full_name ?? "Sem nome"]));
  const prefRows = prefs ?? [];
  const enabledStats = {
    checkin: prefRows.filter((p) => p.checkin_enabled).length,
    meals: prefRows.filter((p) => p.meal_reminders_enabled).length,
    voice: prefRows.filter((p) => p.voice_reminders_enabled).length,
    water: prefRows.filter((p) => p.water_reminders_enabled).length,
    sleep: prefRows.filter((p) => p.sleep_reminders_enabled).length,
  };
  const denominator = prefRows.length || 1;

  return (
    <div className="grid gap-6">
      <Link className="text-sm font-semibold text-[#735C00] underline" href="/admin">
        Voltar ao painel
      </Link>
      <SectionCard
        description="Visao operacional por utilizadora: preferencias ligadas e historico de envios."
        eyebrow="Super Admin"
        title="Notificacoes"
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Card className="px-4 py-4 text-sm" tone="soft">
            Check-in: {Math.round((enabledStats.checkin / denominator) * 100)}%
          </Card>
          <Card className="px-4 py-4 text-sm" tone="soft">
            Refeicoes: {Math.round((enabledStats.meals / denominator) * 100)}%
          </Card>
          <Card className="px-4 py-4 text-sm" tone="soft">
            Voz: {Math.round((enabledStats.voice / denominator) * 100)}%
          </Card>
          <Card className="px-4 py-4 text-sm" tone="soft">
            Agua: {Math.round((enabledStats.water / denominator) * 100)}%
          </Card>
          <Card className="px-4 py-4 text-sm" tone="soft">
            Sono: {Math.round((enabledStats.sleep / denominator) * 100)}%
          </Card>
        </div>

        <div className="mt-4 overflow-x-auto rounded-[22px] ring-1 ring-[rgba(15,26,20,0.06)]">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[rgba(255,251,247,0.9)] text-xs uppercase tracking-wide text-[rgba(15,26,20,0.45)]">
              <tr>
                <th className="px-4 py-3">Utilizadora</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Titulo</th>
                <th className="px-4 py-3">Enviada</th>
                <th className="px-4 py-3">Lida</th>
              </tr>
            </thead>
            <tbody>
              {(history ?? []).map((h) => (
                <tr className="border-t border-[rgba(15,26,20,0.06)]" key={h.id}>
                  <td className="px-4 py-3">{nameById.get(h.user_id) ?? h.user_id}</td>
                  <td className="px-4 py-3 text-[rgba(15,26,20,0.62)]">{h.type}</td>
                  <td className="px-4 py-3">{h.title}</td>
                  <td className="px-4 py-3 text-[rgba(15,26,20,0.62)]">
                    {h.sent_at ? new Date(h.sent_at).toLocaleString("pt-PT") : "—"}
                  </td>
                  <td className="px-4 py-3 text-[rgba(15,26,20,0.62)]">
                    {h.read_at ? new Date(h.read_at).toLocaleString("pt-PT") : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
