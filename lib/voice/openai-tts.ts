import "server-only";

import { env } from "@/lib/config/env";

/** Gera MP3 com voz calma (OpenAI TTS). Devolve null se OPENAI_API_KEY nao existir ou a API falhar. */
export async function synthesizeVoiceMp3(text: string): Promise<Buffer | null> {
  if (!env.openaiApiKey) {
    return null;
  }

  const input = text.replace(/\s+/g, " ").trim().slice(0, 3800);
  if (!input) {
    return null;
  }

  try {
    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "tts-1",
        voice: "nova",
        input,
        response_format: "mp3",
      }),
      signal: AbortSignal.timeout(45_000),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("[OPENAI_TTS]", response.status, errText.slice(0, 400));
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error("[OPENAI_TTS_FAILED]", error);
    return null;
  }
}
