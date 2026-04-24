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
          role: string;
          full_access: boolean;
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
          role?: string;
          full_access?: boolean;
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
          role?: string;
          full_access?: boolean;
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
      goals: {
        Row: {
          id: string;
          user_id: string;
          primary_goal: string;
          target_weight: number | null;
          deadline: string | null;
          emotional_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          primary_goal: string;
          target_weight?: number | null;
          deadline?: string | null;
          emotional_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          primary_goal?: string;
          target_weight?: number | null;
          deadline?: string | null;
          emotional_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_schedule: {
        Row: {
          id: string;
          user_id: string;
          breakfast_time: string;
          lunch_time: string;
          snack_time: string;
          dinner_time: string;
          sleep_time: string;
          wake_time: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          breakfast_time?: string;
          lunch_time?: string;
          snack_time?: string;
          dinner_time?: string;
          sleep_time?: string;
          wake_time?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          breakfast_time?: string;
          lunch_time?: string;
          snack_time?: string;
          dinner_time?: string;
          sleep_time?: string;
          wake_time?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      daily_journey: {
        Row: {
          id: string;
          user_id: string;
          day_number: number;
          journey_date: string;
          status: string;
          completed_steps: number;
          total_steps: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          day_number: number;
          journey_date: string;
          status?: string;
          completed_steps?: number;
          total_steps?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          day_number?: number;
          journey_date?: string;
          status?: string;
          completed_steps?: number;
          total_steps?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      daily_tasks: {
        Row: {
          id: string;
          user_id: string;
          journey_id: string;
          title: string;
          description: string;
          task_type: string;
          scheduled_time: string | null;
          sort_order: number;
          deep_link: string | null;
          completed: boolean;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          journey_id: string;
          title: string;
          description: string;
          task_type: string;
          scheduled_time?: string | null;
          sort_order?: number;
          deep_link?: string | null;
          completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          journey_id?: string;
          title?: string;
          description?: string;
          task_type?: string;
          scheduled_time?: string | null;
          sort_order?: number;
          deep_link?: string | null;
          completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      notification_preferences: {
        Row: {
          id: string;
          user_id: string;
          checkin_enabled: boolean;
          meal_reminders_enabled: boolean;
          voice_reminders_enabled: boolean;
          water_reminders_enabled: boolean;
          sleep_reminders_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          checkin_enabled?: boolean;
          meal_reminders_enabled?: boolean;
          voice_reminders_enabled?: boolean;
          water_reminders_enabled?: boolean;
          sleep_reminders_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          checkin_enabled?: boolean;
          meal_reminders_enabled?: boolean;
          voice_reminders_enabled?: boolean;
          water_reminders_enabled?: boolean;
          sleep_reminders_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      notification_history: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          body: string;
          type: string;
          scheduled_for: string | null;
          sent_at: string | null;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          body: string;
          type: string;
          scheduled_for?: string | null;
          sent_at?: string | null;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          body?: string;
          type?: string;
          scheduled_for?: string | null;
          sent_at?: string | null;
          read_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      notification_schedule: {
        Row: {
          id: string;
          user_id: string;
          checkin_time: string;
          water_time: string;
          meal_log_time: string;
          voice_time: string;
          sleep_time: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          checkin_time?: string;
          water_time?: string;
          meal_log_time?: string;
          voice_time?: string;
          sleep_time?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          checkin_time?: string;
          water_time?: string;
          meal_log_time?: string;
          voice_time?: string;
          sleep_time?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      programs: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          access_level: string;
          price_reference: string | null;
          stripe_price_id: string | null;
          active: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          access_level?: string;
          price_reference?: string | null;
          stripe_price_id?: string | null;
          active?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          access_level?: string;
          price_reference?: string | null;
          stripe_price_id?: string | null;
          active?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      push_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          endpoint: string;
          p256dh: string;
          auth: string;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          endpoint: string;
          p256dh: string;
          auth: string;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          endpoint?: string;
          p256dh?: string;
          auth?: string;
          user_agent?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      user_program_access: {
        Row: {
          id: string;
          user_id: string;
          program_id: string;
          access_status: string;
          granted_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          program_id: string;
          access_status?: string;
          granted_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          program_id?: string;
          access_status?: string;
          granted_by?: string | null;
          created_at?: string;
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
