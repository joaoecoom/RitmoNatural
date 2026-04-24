import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function SetupNotice() {
  return (
    <Card className="mx-auto max-w-2xl p-8" tone="soft">
      <p className="text-xs uppercase tracking-[0.28em] text-[rgba(15,26,20,0.42)]">
        Configuracao necessaria
      </p>
      <h2 className="mt-3 font-serif text-3xl text-[#0F1A14]">
        Liga o Supabase para ativares o MVP.
      </h2>
      <p className="mt-3 text-sm leading-7 text-[rgba(15,26,20,0.58)]">
        Preenche o ficheiro <code>.env.local</code> com as variaveis do{" "}
        <code>.env.example</code> e corre o SQL em <code>supabase/schema.sql</code>.
      </p>
      <div className="mt-6">
        <Link href="/login">
          <Button size="lg">
            <ArrowRight className="mr-2 size-4" />
            Ir para auth
          </Button>
        </Link>
      </div>
    </Card>
  );
}
