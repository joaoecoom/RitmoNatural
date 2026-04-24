import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { AppScreen } from "@/components/layout/app-screen";
import { BrandHeader } from "@/components/ui/brand-header";
import { GlassCard } from "@/components/ui/glass-card";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { VoiceOrb } from "@/components/ui/voice-orb";

export function WelcomeScreen() {
  return (
    <AppScreen centered compact>
      <div className="screen-stack">
        <div className="flex justify-center">
          <VoiceOrb label="A Voz" size="lg" />
        </div>

        <BrandHeader
          align="center"
          description="Hoje vamos ajudar o teu corpo a sair do modo sobrevivência e a voltar ao seu ritmo natural."
          eyebrow="Ritmo Natural"
          title="Uma experiência calma, guiada e feita para o teu corpo."
        />

        <GlassCard className="space-y-4 text-center">
          <p className="text-sm leading-7 text-[rgba(77,70,53,0.78)]">
            Sem ruído. Sem linguagem fitness. Apenas presença, clareza e pequenos ajustes que fazem sentido no teu dia.
          </p>

          <div className="flex flex-col gap-3">
            <Link href="/register">
              <PrimaryButton fullWidth>
                Começar agora
                <ArrowRight className="ml-2 size-4" />
              </PrimaryButton>
            </Link>
            <Link href="/login">
              <SecondaryButton fullWidth>Já tenho conta</SecondaryButton>
            </Link>
          </div>
        </GlassCard>
      </div>
    </AppScreen>
  );
}
