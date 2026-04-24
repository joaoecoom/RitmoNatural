import Link from "next/link";

import { startProgramCheckoutAction } from "@/features/billing/server/actions";
import { Card } from "@/components/ui/card";
import { SectionCard } from "@/components/ui/section-card";
import type { ProgramWithAccess } from "@/features/programs/server/queries";

const perks = [
  "Fotos ilimitadas de refeicoes",
  "Protocolos extra guiados",
  "Audios da Voz (TTS quando OPENAI_API_KEY esta ativa)",
  "Planos especiais de 3 e 7 dias",
];

export function UpgradeOverview({
  programs,
  checkout,
  fullAccess,
}: {
  programs: ProgramWithAccess[];
  checkout?: string | null;
  fullAccess?: boolean;
}) {
  const purchasable = programs.filter((p) => p.can_checkout);

  return (
    <div className="grid gap-6">
      {checkout === "cancel" ? (
        <Card className="px-4 py-3 text-sm text-[rgba(15,26,20,0.62)]" tone="soft">
          Checkout cancelado. Quando quiseres, volta a tentar.
        </Card>
      ) : null}
      {checkout === "erro" || checkout === "indisponivel" ? (
        <Card className="px-4 py-3 text-sm text-[#6b2c2c]" tone="soft">
          Nao foi possivel abrir o checkout. Confirma o Price ID do programa (Supabase ou
          STRIPE_PROGRAM_PRICE_IDS) e a chave STRIPE_SECRET_KEY.
        </Card>
      ) : null}

      {fullAccess ? (
        <Card className="border border-[rgba(92,122,95,0.35)] bg-[rgba(92,122,95,0.08)] px-4 py-4 text-sm text-[#2d3f2f]">
          A tua conta tem acesso total: nao precisas de comprar programas individualmente.
        </Card>
      ) : null}

      <SectionCard
        description="Stripe Checkout em modo pagamento unico. Apos pagamento, o webhook concede acesso ao programa."
        eyebrow="Upgrade"
        title="Desbloqueia mais profundidade no teu ritmo"
      >
        <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="px-5 py-5" tone="dark">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[rgba(244,239,230,0.55)]">
              O que podes ganhar
            </p>
            <ul className="mt-4 grid gap-3 text-sm leading-7 text-[rgba(244,239,230,0.82)]">
              {perks.map((p) => (
                <li key={p}>— {p}</li>
              ))}
            </ul>
          </Card>
          <Card className="px-5 py-5" tone="soft">
            <p className="text-sm leading-7 text-[rgba(15,26,20,0.58)]">
              Configura no Stripe um produto por programa, copia o Price ID para a coluna{" "}
              <span className="font-mono text-xs">programs.stripe_price_id</span> ou para o JSON{" "}
              <span className="font-mono text-xs">STRIPE_PROGRAM_PRICE_IDS</span>. O webhook em{" "}
              <span className="font-mono text-xs">/api/stripe/webhook</span> ativa o acesso.
            </p>
            <Link
              className="mt-5 inline-flex min-h-12 items-center justify-center rounded-full bg-[linear-gradient(180deg,#D4AF37,#C6A75E)] px-6 py-3 text-sm font-semibold text-[#201B16] shadow-[0_16px_34px_rgba(198,167,94,0.22)] transition hover:-translate-y-0.5 hover:brightness-[1.02]"
              href="/programs"
            >
              Ver programas
            </Link>
          </Card>
        </div>
      </SectionCard>

      {purchasable.length > 0 ? (
        <SectionCard
          description="Pagamento seguro via Stripe. A conta fica associada ao email com que iniciaste sessao."
          eyebrow="Comprar"
          title="Programas disponiveis para checkout"
        >
          <ul className="grid gap-3">
            {purchasable.map((p) => (
              <li key={p.id}>
                <Card className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                  <div className="min-w-0">
                    <p className="font-medium text-[#0F1A14]">{p.name}</p>
                    {p.description ? (
                      <p className="mt-2 text-sm leading-7 text-[rgba(15,26,20,0.56)]">{p.description}</p>
                    ) : null}
                  </div>
                  <form action={startProgramCheckoutAction}>
                    <input name="program_slug" type="hidden" value={p.slug} />
                    <button
                      className="min-h-12 w-full rounded-full bg-[linear-gradient(180deg,#D4AF37,#C6A75E)] px-6 text-sm font-semibold text-[#201B16] shadow-[0_16px_34px_rgba(198,167,94,0.22)] sm:w-auto"
                      type="submit"
                    >
                      Pagar e desbloquear
                    </button>
                  </form>
                </Card>
              </li>
            ))}
          </ul>
        </SectionCard>
      ) : !fullAccess ? (
        <Card className="px-4 py-4 text-sm leading-7 text-[rgba(15,26,20,0.58)]" tone="soft">
          Nenhum programa com preço Stripe configurado. Define Price IDs na base de dados ou em{" "}
          <span className="font-mono text-xs">STRIPE_PROGRAM_PRICE_IDS</span> no ambiente.
        </Card>
      ) : null}
    </div>
  );
}
