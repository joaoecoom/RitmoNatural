"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { AppScreen } from "@/components/layout/app-screen";
import { BrandHeader } from "@/components/ui/brand-header";
import { GlassCard } from "@/components/ui/glass-card";
import { InputField } from "@/components/ui/input-field";
import { PrimaryButton } from "@/components/ui/primary-button";
import { VoiceOrb } from "@/components/ui/voice-orb";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function PasswordResetForm() {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    setMessage(null);

    const supabase = createSupabaseBrowserClient();

    if (!supabase) {
      setError("Supabase não configurado.");
      setPending(false);
      return;
    }

    const email = String(formData.get("email") ?? "").trim();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });

    if (resetError) {
      setError(resetError.message);
      setPending(false);
      return;
    }

    setMessage("Enviámos um email para redefinires a tua palavra-passe.");
    setPending(false);
  }

  return (
    <AppScreen centered compact>
      <div className="screen-stack">
        <div className="flex justify-center">
          <VoiceOrb label="RN" size="md" />
        </div>

        <BrandHeader
          align="center"
          description="Vamos ajudar-te a recuperar o acesso com simplicidade."
          eyebrow="Recuperar acesso"
          title="Trazemos-te de volta ao teu ritmo."
        />

        <GlassCard className="space-y-5">
          <form action={handleSubmit} className="space-y-4">
            <InputField
              label="Email"
              name="email"
              placeholder="o-teu-email@exemplo.com"
              required
              type="email"
            />

            {error ? (
              <p className="rounded-[20px] bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </p>
            ) : null}

            {message ? (
              <p className="rounded-[20px] bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {message}
              </p>
            ) : null}

            <PrimaryButton disabled={pending} fullWidth>
              {pending ? "A enviar..." : "Enviar link de recuperação"}
              <ArrowRight className="ml-2 size-4" />
            </PrimaryButton>
          </form>

          <Link
            className="inline-flex items-center text-sm text-[rgba(77,70,53,0.78)]"
            href="/login"
          >
            <ArrowLeft className="mr-2 size-4" />
            Voltar ao login
          </Link>
        </GlassCard>
      </div>
    </AppScreen>
  );
}
