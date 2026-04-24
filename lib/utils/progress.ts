import type { BodyStateLabel, Symptom } from "@/types/domain";

const mealInterpretations = [
  "Isto pode estar a manter o teu corpo em alerta.",
  "Boa escolha para ajudar o teu corpo a relaxar.",
  "Cuidado com este tipo de refeicao ao final do dia.",
  "Ha aqui uma base simples para dar mais seguranca ao teu corpo.",
];

const voiceResponses = [
  "Hoje vamos ajudar o teu corpo a sair do modo sobrevivencia.",
  "O teu corpo precisa de sinais de seguranca.",
  "Mais um passo para voltares ao teu ritmo natural.",
  "A Voz esta contigo.",
];

export function calculateProgressScore({
  stressLevel,
  sleepQuality,
  symptoms,
}: {
  stressLevel: number;
  sleepQuality: number;
  symptoms: Symptom[];
}) {
  const symptomPenalty = symptoms.length * 6;
  const rawScore = 100 - stressLevel * 9 + sleepQuality * 8 - symptomPenalty;
  return Math.max(20, Math.min(92, rawScore));
}

export function getBodyStateLabel(score: number): BodyStateLabel {
  if (score < 45) {
    return "Modo Sobrevivencia";
  }

  if (score < 72) {
    return "A sair do Modo Sobrevivencia";
  }

  return "Ritmo Natural em progresso";
}

export function pickMealInterpretation(seed: string) {
  return mealInterpretations[seed.length % mealInterpretations.length];
}

export function pickVoiceResponse(seed: string) {
  return voiceResponses[seed.length % voiceResponses.length];
}

export function getLifePhaseLabel(value: string | null) {
  switch (value) {
    case "postpartum":
      return "Pos-parto";
    case "menopause":
      return "Menopausa ou pre-menopausa";
    case "high_stress":
      return "Stress elevado";
    default:
      return "Nenhuma em particular";
  }
}

export function formatRelativeStateLabel(label: BodyStateLabel | string) {
  switch (label) {
    case "Modo Sobrevivencia":
      return "Hoje o teu corpo esta a pedir mais seguranca.";
    case "A sair do Modo Sobrevivencia":
      return "O teu corpo ja esta a responder melhor aos teus ajustes.";
    case "Ritmo Natural em progresso":
      return "Estas a consolidar um ritmo mais leve e consistente.";
    default:
      return "Mais perto do teu objetivo, com mais leveza e consistencia.";
  }
}
