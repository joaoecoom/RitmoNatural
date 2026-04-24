export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          age: number | null;
          life_phase: string | null;
          primary_goal: string | null;
          onboarding_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          age?: number | null;
          life_phase?: string | null;
          primary_goal?: string | null;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          age?: number | null;
          life_phase?: string | null;
          primary_goal?: string | null;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      onboarding_answers: {
        Row: {
          id: string;
          user_id: string;
          symptoms: string[];
          stress_level: number;
          sleep_quality: number;
          notes: string | null;
          accepts_notifications: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          symptoms?: string[];
          stress_level: number;
          sleep_quality: number;
          notes?: string | null;
          accepts_notifications?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          symptoms?: string[];
          stress_level?: number;
          sleep_quality?: number;
          notes?: string | null;
          accepts_notifications?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      daily_checkins: {
        Row: {
          id: string;
          user_id: string;
          stress_score: number;
          energy_score: number;
          bloating_score: number;
          vent_text: string | null;
          vent_audio_url: string | null;
          voice_response: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          stress_score: number;
          energy_score: number;
          bloating_score: number;
          vent_text?: string | null;
          vent_audio_url?: string | null;
          voice_response?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          stress_score?: number;
          energy_score?: number;
          bloating_score?: number;
          vent_text?: string | null;
          vent_audio_url?: string | null;
          voice_response?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      meal_entries: {
        Row: {
          id: string;
          user_id: string;
          meal_text: string;
          image_url: string | null;
          interpretation: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          meal_text: string;
          image_url?: string | null;
          interpretation?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          meal_text?: string;
          image_url?: string | null;
          interpretation?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      voice_messages: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          body: string;
          audio_url: string | null;
          message_type: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          body: string;
          audio_url?: string | null;
          message_type?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          body?: string;
          audio_url?: string | null;
          message_type?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      voice_message_reads: {
        Row: {
          user_id: string;
          voice_message_id: string;
          read_at: string;
        };
        Insert: {
          user_id: string;
          voice_message_id: string;
          read_at?: string;
        };
        Update: {
          user_id?: string;
          voice_message_id?: string;
          read_at?: string;
        };
        Relationships: [];
      };
      daily_adjustments: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string;
          adjustment_type: string;
          is_completed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description: string;
          adjustment_type?: string;
          is_completed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string;
          adjustment_type?: string;
          is_completed?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      progress_states: {
        Row: {
          id: string;
          user_id: string;
          state_label: string;
          score: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          state_label: string;
          score: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          state_label?: string;
          score?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      user_settings: {
        Row: {
          user_id: string;
          appearance_mode: string;
          push_notifications: boolean;
          daily_voice_reminder: boolean;
          meal_reminders: boolean;
          weekly_reflection: boolean;
          soundscape_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          appearance_mode?: string;
          push_notifications?: boolean;
          daily_voice_reminder?: boolean;
          meal_reminders?: boolean;
          weekly_reflection?: boolean;
          soundscape_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          appearance_mode?: string;
          push_notifications?: boolean;
          daily_voice_reminder?: boolean;
          meal_reminders?: boolean;
          weekly_reflection?: boolean;
          soundscape_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
