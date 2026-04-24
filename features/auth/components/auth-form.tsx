"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight } from "lucide-react";

import { AppScreen } from "@/components/layout/app-screen";
import { BrandHeader } from "@/components/ui/brand-header";
import { GlassCard } from "@/components/ui/glass-card";
import { InputField } from "@/components/ui/input-field";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { VoiceOrb } from "@/components/ui/voice-orb";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type AuthMode = "login" | "register";

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setMessage(null);
    setPending(true);

    const supabase = createSupabaseBrowserClient();

    if (!supabase) {
      setError("Configura primeiro as variaveis do Supabase para usar a autenticacao.");
      setPending(false);
      return;
    }

    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    if (mode === "register") {
      const fullName = String(formData.get("full_name") ?? "");

      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setPending(false);
        return;
      }

      setMessage(
        "Conta criada. Se a confirmacao por email estiver ativa no Supabase, valida primeiro o teu email. Depois entra para continuar.",
      );
      setPending(false);
      router.push("/login?registered=1");
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setPending(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <AppScreen centered compact>
      <div className="screen-stack">
        <div className="flex justify-center">
          <VoiceOrb label={mode === "login" ? "Entrar" : "Criar"} size="lg" />
        </div>

        <BrandHeader
          align="center"
          description={
            mode === "login"
              ? "A tua jornada continua aqui, com mais clareza e menos ruído."
              : "Vamos construir um espaço simples, elegante e guiado para o teu corpo."
          }
          eyebrow={mode === "login" ? "Bem-vinda de volta" : "Criar conta"}
          title={
            mode === "login"
              ? "O teu ritmo continua aqui."
              : "Começamos com leveza e presença."
          }
        />

        <GlassCard className="space-y-5">
          <form action={handleSubmit} className="space-y-4">
            {mode === "register" ? (
              <InputField
                label="Nome"
                name="full_name"
                placeholder="Como gostas de ser chamada?"
                required
                type="text"
              />
            ) : null}

            <InputField
              label="Email"
              name="email"
              placeholder="o-teu-email@exemplo.com"
              required
              type="email"
            />

            <InputField
              label="Palavra-passe"
              name="password"
              placeholder="Mínimo de 6 caracteres"
              required
              type="password"
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
              {pending ? "A preparar..." : mode === "login" ? "Entrar" : "Criar conta"}
              <ArrowRight className="ml-2 size-4" />
            </PrimaryButton>
          </form>

          <div className="space-y-3 text-center text-sm text-[rgba(77,70,53,0.78)]">
            {mode === "login" ? (
              <Link
                className="block underline decoration-[rgba(198,167,94,0.45)] underline-offset-4"
                href="/forgot-password"
              >
                Esqueci-me da palavra-passe
              </Link>
            ) : null}

            <p>
              {mode === "login" ? "Ainda não tens conta?" : "Já tens conta?"}{" "}
              <Link
                className="font-semibold text-[#201B16] underline decoration-[rgba(198,167,94,0.45)] underline-offset-4"
                href={mode === "login" ? "/register" : "/login"}
              >
                {mode === "login" ? "Criar conta" : "Entrar"}
              </Link>
            </p>
          </div>
        </GlassCard>

        <div className="flex justify-center">
          <Link href="/welcome">
            <SecondaryButton>Voltar ao início</SecondaryButton>
          </Link>
        </div>
      </div>
    </AppScreen>
  );
}
