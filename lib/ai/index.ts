import "server-only";

import { env } from "@/lib/config/env";
import { pickMealInterpretation, pickVoiceResponse } from "@/lib/utils/progress";

export interface MealInterpretationInput {
  mealText: string;
  context?: string;
}

export interface VoiceReplyInput {
  context: string;
  purpose?: "welcome" | "checkin" | "encouragement";
}

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_MODEL = "openai/gpt-4.1-mini";

function normaliseModelText(value: string) {
  return value
    .replace(/\s+/g, " ")
    .replace(/^["'\s]+|["'\s]+$/g, "")
    .trim();
}

function getVoiceSystemPrompt(purpose: VoiceReplyInput["purpose"]) {
  const basePrompt = `
És a "A Voz" da app Ritmo Natural.

Responde sempre em portugues de Portugal.
Escreve com tom calmo, premium, feminino, acolhedor e emocional.
Nunca uses linguagem tecnica, fria ou clinica.
Nunca fales de calorias, macros, treino, culpa, castigo, dieta restritiva ou controlo extremo.
Nao prometas resultados medicos nem diagnostiques nada.
Escreve no maximo 3 frases curtas.
Deve soar humano, simples e regulador.
`.trim();

  if (purpose === "welcome") {
    return `${basePrompt}

Objetivo especifico:
- dar boas-vindas
- criar sensacao de seguranca
- mostrar que esta nova fase pode ser leve
- soar pessoal, nunca generico`;
  }

  if (purpose === "encouragement") {
    return `${basePrompt}

Objetivo especifico:
- recentrar a utilizadora
- oferecer um pequeno passo para o momento presente
- reduzir pressao e ruido interno`;
  }

  return `${basePrompt}

Objetivo especifico:
- responder ao estado do corpo no check-in
- refletir o momento atual sem dramatizar
- sugerir um proximo passo simples e realista`;
}

function getMealSystemPrompt() {
  return `
És a camada de leitura emocional da app Ritmo Natural.

Responde sempre em portugues de Portugal.
Analisa a refeicao de forma simples, leve e acolhedora.
Nao contes calorias, nao fales de macros, nao uses tom de dieta ou fitness.
Foca-te em previsibilidade, saciedade, energia, leveza e seguranca para o corpo.
Escreve no maximo 3 frases curtas.
Primeiro faz uma leitura simples da refeicao.
Depois, se fizer sentido, sugere um pequeno ajuste gentil.
Nunca julgues a utilizadora.
`.trim();
}

async function requestOpenRouterCompletion({
  messages,
  maxTokens,
}: {
  messages: Array<{ role: "system" | "user"; content: string }>;
  maxTokens: number;
}) {
  if (!env.openRouterApiKey) {
    return null;
  }

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.openRouterApiKey}`,
        "Content-Type": "application/json",
        "X-Title": "Ritmo Natural",
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages,
        temperature: 0.7,
        max_tokens: maxTokens,
      }),
      signal: AbortSignal.timeout(20000),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("[OPENROUTER_ERROR]", {
        status: response.status,
        body: errorBody.slice(0, 500),
      });

      return null;
    }

    const data = (await response.json()) as {
      choices?: Array<{
        message?: {
          content?: string | Array<{ type?: string; text?: string }>;
        };
      }>;
    };

    const content = data.choices?.[0]?.message?.content;
    const text =
      typeof content === "string"
        ? content
        : content
            ?.map((item) => ("text" in item ? item.text ?? "" : ""))
            .join(" ")
            .trim();

    return text ? normaliseModelText(text) : null;
  } catch (error) {
    console.error("[OPENROUTER_REQUEST_FAILED]", {
      message: error instanceof Error ? error.message : "unknown error",
    });

    return null;
  }
}

export async function interpretMealWithOpenRouter(input: MealInterpretationInput) {
  const completion = await requestOpenRouterCompletion({
    maxTokens: 180,
    messages: [
      {
        role: "system",
        content: getMealSystemPrompt(),
      },
      {
        role: "user",
        content: `
Leitura da refeicao:
${input.mealText}

Contexto adicional:
${input.context ?? "Sem contexto adicional."}
        `.trim(),
      },
    ],
  });

  if (completion) {
    return {
      provider: "openrouter",
      interpretation: completion,
    };
  }

  return {
    provider: "mock",
    interpretation: pickMealInterpretation(input.mealText),
  };
}

export async function generateVoiceReply(input: VoiceReplyInput) {
  const completion = await requestOpenRouterCompletion({
    maxTokens: 180,
    messages: [
      {
        role: "system",
        content: getVoiceSystemPrompt(input.purpose),
      },
      {
        role: "user",
        content: input.context,
      },
    ],
  });

  if (completion) {
    return {
      provider: "openrouter",
      message: completion,
    };
  }

  return {
    provider: "mock",
    message: pickVoiceResponse(input.context),
  };
}
