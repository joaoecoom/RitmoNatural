import Link from "next/link";
import { Lock, Unlock } from "lucide-react";

import { startProgramCheckoutAction } from "@/features/billing/server/actions";
import { Card } from "@/components/ui/card";
import { SectionCard } from "@/components/ui/section-card";
import type { ProgramWithAccess } from "@/features/programs/server/queries";

export function ProgramsOverview({
  programs,
  fullAccess = false,
}: {
  programs: ProgramWithAccess[];
  fullAccess?: boolean;
}) {
  return (
    <div className="grid gap-6">
      {fullAccess ? (
        <Card className="border border-[rgba(92,122,95,0.35)] bg-[rgba(92,122,95,0.08)] px-4 py-4 text-sm leading-7 text-[#2d3f2f]">
          A tua conta tem <span className="font-semibold">acesso total</span>: todos os programas estao
          disponiveis na experiencia, sem paywall.
        </Card>
      ) : null}
      <SectionCard
        description="O acesso base inclui a experiencia principal. Protocolos extra desbloqueiam caminhos mais guiados."
        eyebrow="Programas"
        title="Escolhe o nivel de acompanhamento"
      >
        <ul className="grid gap-3">
          {programs.map((p) => (
            <li key={p.id}>
              <Card className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {p.has_access ? (
                      <Unlock className="size-4 shrink-0 text-[#5c7a5f]" />
                    ) : (
                      <Lock className="size-4 shrink-0 text-[rgba(15,26,20,0.38)]" />
                    )}
                    <p className="font-medium text-[#0F1A14]">{p.name}</p>
                    {p.price_reference ? (
                      <span className="rounded-full bg-[rgba(236,213,177,0.35)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#5c4a2a]">
                        {p.price_reference}
                      </span>
                    ) : null}
                  </div>
                  {p.description ? (
                    <p className="mt-2 text-sm leading-7 text-[rgba(15,26,20,0.56)]">{p.description}</p>
                  ) : null}
                </div>
                <div className="shrink-0">
                  {p.has_access ? (
                    <span className="text-sm font-medium text-[#5c7a5f]">Ativo na tua conta</span>
                  ) : p.can_checkout ? (
                    <form action={startProgramCheckoutAction}>
                      <input name="program_slug" type="hidden" value={p.slug} />
                      <button
                        className="inline-flex min-h-12 items-center justify-center rounded-full bg-[linear-gradient(180deg,#D4AF37,#C6A75E)] px-5 py-3 text-sm font-semibold text-[#201B16] shadow-[0_16px_34px_rgba(198,167,94,0.22)] transition hover:-translate-y-0.5 hover:brightness-[1.02]"
                        type="submit"
                      >
                        Comprar acesso
                      </button>
                    </form>
                  ) : (
                    <Link
                      className="inline-flex min-h-12 items-center justify-center rounded-full bg-[linear-gradient(180deg,#D4AF37,#C6A75E)] px-5 py-3 text-sm font-semibold text-[#201B16] shadow-[0_16px_34px_rgba(198,167,94,0.22)] transition hover:-translate-y-0.5 hover:brightness-[1.02]"
                      href="/upgrade"
                    >
                      Desbloquear
                    </Link>
                  )}
                </div>
              </Card>
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}
