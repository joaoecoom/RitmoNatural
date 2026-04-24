export type LifePhase =
  | "postpartum"
  | "menopause"
  | "high_stress"
  | "none";

export type Symptom =
  | "bloating"
  | "weight_loss_resistance"
  | "low_energy"
  | "cravings"
  | "stubborn_belly";

export type BodyStateLabel =
  | "Modo Sobrevivencia"
  | "A sair do Modo Sobrevivencia"
  | "Ritmo Natural em progresso";

export type AdjustmentType =
  | "meal"
  | "rest"
  | "mindset"
  | "hydration"
  | "movement";

export type VoiceMessageType =
  | "daily_guidance"
  | "checkin_response"
  | "meal_reflection"
  | "encouragement";

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url?: string | null;
  age: number | null;
  life_phase: LifePhase | string | null;
  primary_goal: string | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface OnboardingAnswer {
  id: string;
  user_id: string;
  symptoms: Array<Symptom | string>;
  stress_level: number;
  sleep_quality: number;
  notes: string | null;
  accepts_notifications: boolean;
  created_at: string;
}

export interface DailyCheckin {
  id: string;
  user_id: string;
  stress_score: number;
  energy_score: number;
  bloating_score: number;
  vent_text: string | null;
  vent_audio_url?: string | null;
  voice_response: string | null;
  created_at: string;
}

export interface MealEntry {
  id: string;
  user_id: string;
  meal_text: string;
  image_url: string | null;
  interpretation: string | null;
  created_at: string;
}

export interface VoiceMessage {
  id: string;
  user_id: string;
  title: string;
  body: string;
  audio_url: string | null;
  message_type: VoiceMessageType | string;
  created_at: string;
}

export interface DailyAdjustment {
  id: string;
  user_id: string;
  title: string;
  description: string;
  adjustment_type: AdjustmentType | string;
  is_completed: boolean;
  created_at: string;
}

export interface ProgressState {
  id: string;
  user_id: string;
  state_label: BodyStateLabel | string;
  score: number;
  created_at: string;
}

export interface UserSettings {
  user_id: string;
  appearance_mode: "light" | "soft" | "dark" | string;
  push_notifications: boolean;
  daily_voice_reminder: boolean;
  meal_reminders: boolean;
  weekly_reflection: boolean;
  soundscape_enabled: boolean;
  created_at: string;
  updated_at: string;
}
