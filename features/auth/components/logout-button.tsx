"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MoonStar } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogout() {
    setPending(true);
    setError(null);

    const supabase = createSupabaseBrowserClient();

    if (!supabase) {
      setError("Supabase nao configurado.");
      setPending(false);
      return;
    }

    const { error: signOutError } = await supabase.auth.signOut();

    if (signOutError) {
      setError(signOutError.message);
      setPending(false);
      return;
    }

    router.push("/login");
    router.refresh();
  }

  return (
    <Card className="mx-auto max-w-md p-8 text-center" tone="soft">
      <div className="soft-orb mx-auto flex size-20 items-center justify-center rounded-full bg-[radial-gradient(circle,_rgba(255,255,255,0.95),_rgba(228,211,168,0.54))]">
        <div className="flex size-12 items-center justify-center rounded-full bg-[linear-gradient(180deg,#0F1A14,#203027)] text-[#F6F1EA]">
          <MoonStar className="size-4" />
        </div>
      </div>
      <p className="mt-6 text-xs uppercase tracking-[0.28em] text-[rgba(15,26,20,0.42)]">
        Sessao
      </p>
      <h1 className="mt-3 font-serif text-3xl text-[#0F1A14]">Queres sair por hoje?</h1>
      <p className="mt-3 text-sm leading-7 text-[rgba(15,26,20,0.58)]">
        Podes voltar quando quiseres. A tua jornada fica guardada.
      </p>

      {error ? (
        <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>
      ) : null}

      <div className="mt-6">
        <Button disabled={pending} onClick={handleLogout} size="lg">
          {pending ? "A sair..." : "Confirmar logout"}
        </Button>
      </div>
    </Card>
  );
}
