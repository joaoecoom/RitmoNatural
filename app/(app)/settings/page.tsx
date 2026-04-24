import Link from "next/link";

import { SettingsForm } from "@/features/settings/components/settings-form";
import { getUserSettings } from "@/features/settings/server/queries";
import { requireCompletedOnboarding } from "@/lib/auth/session";

export default async function SettingsPage() {
  const { user, profile } = await requireCompletedOnboarding();
  const settings = await getUserSettings(user.id);

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap gap-2 rounded-[22px] border border-[rgba(15,26,20,0.06)] bg-[rgba(255,251,247,0.72)] px-3 py-3 text-sm">
        <Link className="rounded-full bg-white/80 px-3 py-1.5 font-medium ring-1 ring-[rgba(15,26,20,0.06)]" href="/goals">
          Objetivos
        </Link>
        <Link className="rounded-full bg-white/80 px-3 py-1.5 font-medium ring-1 ring-[rgba(15,26,20,0.06)]" href="/schedule">
          Horarios
        </Link>
        <Link className="rounded-full bg-white/80 px-3 py-1.5 font-medium ring-1 ring-[rgba(15,26,20,0.06)]" href="/programs">
          Programas
        </Link>
        <Link className="rounded-full bg-white/80 px-3 py-1.5 font-medium ring-1 ring-[rgba(15,26,20,0.06)]" href="/upgrade">
          Upgrade
        </Link>
        {profile?.role === "super_admin" ? (
          <Link
            className="rounded-full bg-[rgba(15,26,20,0.88)] px-3 py-1.5 font-medium text-[#F4EFE6]"
            href="/admin"
          >
            Admin
          </Link>
        ) : null}
      </div>
      <SettingsForm settings={settings} />
    </div>
  );
}
