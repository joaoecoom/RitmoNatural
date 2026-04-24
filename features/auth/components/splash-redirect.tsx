"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { AppScreen } from "@/components/layout/app-screen";
import { BrandHeader } from "@/components/ui/brand-header";
import { VoiceOrb } from "@/components/ui/voice-orb";

export function SplashRedirect({ destination }: { destination: string }) {
  const router = useRouter();

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      router.replace(destination);
    }, 1100);

    return () => window.clearTimeout(timeout);
  }, [destination, router]);

  return (
    <AppScreen centered compact>
      <div className="flex flex-col items-center gap-8 text-center">
        <VoiceOrb label="RN" size="lg" />
        <BrandHeader
          align="center"
          description="Uma presenca calma para ajudar o teu corpo a sair do modo sobrevivencia."
          eyebrow="Ritmo Natural"
          title="O teu ritmo começa aqui."
        />
        <div className="w-40 overflow-hidden rounded-full bg-[rgba(32,27,22,0.08)]">
          <div className="h-[3px] w-1/2 rounded-full bg-[linear-gradient(90deg,#D4AF37,#C6A75E)] animate-pulse" />
        </div>
      </div>
    </AppScreen>
  );
}
