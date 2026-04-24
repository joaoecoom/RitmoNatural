"use client";

import { useActionState, useState } from "react";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Slider } from "@/components/ui/slider";
import { VoiceJournalField } from "@/components/ui/voice-journal-field";
import {
  submitCheckinAction,
  type CheckinActionState,
} from "@/features/checkins/server/actions";

const initialState: CheckinActionState = {
  success: false,
  message: "",
};

export function CheckinForm() {
  const [state, action, pending] = useActionState(submitCheckinAction, initialState);
  const [stressScore, setStressScore] = useState(6);
  const [energyScore, setEnergyScore] = useState(5);
  const [bloatingScore, setBloatingScore] = useState(5);
  const [voiceCapture, setVoiceCapture] = useState<{
    audioFile: File | null;
    transcript: string;
  }>({
    audioFile: null,
    transcript: "",
  });

  function handleSubmit(formData: FormData) {
    if (voiceCapture.audioFile) {
      formData.set("vent_audio", voiceCapture.audioFile);
    }

    if (voiceCapture.transcript) {
      formData.set("vent_transcript", voiceCapture.transcript);
    }

    action(formData);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
      <Card className="overflow-hidden" tone="soft">
        <p className="text-xs uppercase tracking-[0.28em] text-[rgba(15,26,20,0.42)]">
          Check-in diario
        </p>
        <h1 className="mt-3 font-serif text-4xl text-[#0F1A14]">
          Como esta o teu corpo hoje?
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-8 text-[rgba(15,26,20,0.58)]">
          Uma leitura simples. Sem pressionar. Sem tecnicismos.
        </p>

        <form action={handleSubmit} className="mt-8 space-y-6">
          <Slider
            hint="Um valor alto pode significar que o corpo ainda esta em alerta."
            label="Stress"
            name="stress_score"
            value={stressScore}
            onValueChange={setStressScore}
          />

          <Slider
            hint="Quando a energia sobe, o corpo sente mais seguranca."
            label="Energia"
            name="energy_score"
            value={energyScore}
            onValueChange={setEnergyScore}
          />

          <Slider
            hint="Usa este nivel para registar como o teu corpo se sente hoje."
            label="Inchaco"
            name="bloating_score"
            value={bloatingScore}
            onValueChange={setBloatingScore}
          />

          <VoiceJournalField onVoiceCaptureChange={setVoiceCapture} />

          <Button disabled={pending} size="lg" type="submit" variant="gold">
            <ArrowRight className="mr-2 size-4" />
            {pending ? "A guardar..." : "Guardar check-in"}
          </Button>
        </form>
      </Card>

      <Modal className="h-full">
        <div className="soft-orb mx-auto flex size-24 items-center justify-center rounded-full bg-[radial-gradient(circle,_rgba(255,255,255,0.95),_rgba(228,211,168,0.54))]">
          <div className="flex size-14 items-center justify-center rounded-full bg-[linear-gradient(180deg,#0F1A14,#203027)] text-sm font-medium text-[#F6F1EA]">
            Voz
          </div>
        </div>

        <p className="mt-7 text-center text-xs uppercase tracking-[0.28em] text-[rgba(15,26,20,0.42)]">
          Resposta da Voz
        </p>
        <h2 className="mt-3 text-center font-serif text-4xl leading-tight text-[#0F1A14]">
          {state.success
            ? "A Voz respondeu."
            : "Quando terminares, vais receber uma resposta curta."}
        </h2>

        <p className="mx-auto mt-5 max-w-md text-center text-sm leading-8 text-[rgba(15,26,20,0.60)]">
          {state.voiceResponse ??
            "Hoje vamos ajudar o teu corpo a sair do modo sobrevivencia."}
        </p>

        {state.message ? (
          <p className="mx-auto mt-7 max-w-md rounded-[24px] bg-[rgba(255,251,247,0.8)] px-4 py-4 text-center text-sm text-[rgba(15,26,20,0.56)]">
            {state.message}
          </p>
        ) : null}
      </Modal>
    </div>
  );
}
