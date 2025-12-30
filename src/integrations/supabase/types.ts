export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      analytics_snapshots: {
        Row: {
          created_at: string | null
          id: string
          listening_average: number | null
          overall_average: number | null
          questions_attempted: number | null
          reading_average: number | null
          snapshot_date: string
          speaking_average: number | null
          total_practice_minutes: number | null
          user_id: string
          writing_average: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          listening_average?: number | null
          overall_average?: number | null
          questions_attempted?: number | null
          reading_average?: number | null
          snapshot_date: string
          speaking_average?: number | null
          total_practice_minutes?: number | null
          user_id: string
          writing_average?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          listening_average?: number | null
          overall_average?: number | null
          questions_attempted?: number | null
          reading_average?: number | null
          snapshot_date?: string
          speaking_average?: number | null
          total_practice_minutes?: number | null
          user_id?: string
          writing_average?: number | null
        }
        Relationships: []
      }
      daily_scoring_limits: {
        Row: {
          attempt_count: number
          created_at: string
          id: string
          scoring_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          attempt_count?: number
          created_at?: string
          id?: string
          scoring_date?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          attempt_count?: number
          created_at?: string
          id?: string
          scoring_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      exam_goals: {
        Row: {
          created_at: string | null
          exam_date: string
          hours_per_day: number | null
          id: string
          study_days_per_week: number | null
          target_listening_score: number | null
          target_overall_score: number | null
          target_reading_score: number | null
          target_speaking_score: number | null
          target_writing_score: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          exam_date: string
          hours_per_day?: number | null
          id?: string
          study_days_per_week?: number | null
          target_listening_score?: number | null
          target_overall_score?: number | null
          target_reading_score?: number | null
          target_speaking_score?: number | null
          target_writing_score?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          exam_date?: string
          hours_per_day?: number | null
          id?: string
          study_days_per_week?: number | null
          target_listening_score?: number | null
          target_overall_score?: number | null
          target_reading_score?: number | null
          target_speaking_score?: number | null
          target_writing_score?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      questions: {
        Row: {
          audio_url: string | null
          correct_answer: Json | null
          created_at: string | null
          difficulty: string | null
          discussion_transcript: Json | null
          id: string
          image_url: string | null
          is_human_reviewed: boolean | null
          max_score: number
          options: Json | null
          prompt: string
          question_type: Database["public"]["Enums"]["question_type"]
          reference_text: string | null
          situation_context: string | null
          tags: string[] | null
          usage_count: number | null
        }
        Insert: {
          audio_url?: string | null
          correct_answer?: Json | null
          created_at?: string | null
          difficulty?: string | null
          discussion_transcript?: Json | null
          id?: string
          image_url?: string | null
          is_human_reviewed?: boolean | null
          max_score: number
          options?: Json | null
          prompt: string
          question_type: Database["public"]["Enums"]["question_type"]
          reference_text?: string | null
          situation_context?: string | null
          tags?: string[] | null
          usage_count?: number | null
        }
        Update: {
          audio_url?: string | null
          correct_answer?: Json | null
          created_at?: string | null
          difficulty?: string | null
          discussion_transcript?: Json | null
          id?: string
          image_url?: string | null
          is_human_reviewed?: boolean | null
          max_score?: number
          options?: Json | null
          prompt?: string
          question_type?: Database["public"]["Enums"]["question_type"]
          reference_text?: string | null
          situation_context?: string | null
          tags?: string[] | null
          usage_count?: number | null
        }
        Relationships: []
      }
      scores: {
        Row: {
          ai_score: number | null
          confidence_score: number | null
          feedback: Json | null
          human_score: number | null
          id: string
          max_score: number
          model_version: string | null
          needs_review: boolean | null
          percentage: number | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          scored_at: string | null
          scoring_latency_ms: number | null
          scoring_method: string | null
          skill_contributions: Json | null
          status: Database["public"]["Enums"]["scoring_status"] | null
          submission_id: string
          total_score: number
          trait_scores: Json | null
          user_id: string
        }
        Insert: {
          ai_score?: number | null
          confidence_score?: number | null
          feedback?: Json | null
          human_score?: number | null
          id?: string
          max_score: number
          model_version?: string | null
          needs_review?: boolean | null
          percentage?: number | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          scored_at?: string | null
          scoring_latency_ms?: number | null
          scoring_method?: string | null
          skill_contributions?: Json | null
          status?: Database["public"]["Enums"]["scoring_status"] | null
          submission_id: string
          total_score: number
          trait_scores?: Json | null
          user_id: string
        }
        Update: {
          ai_score?: number | null
          confidence_score?: number | null
          feedback?: Json | null
          human_score?: number | null
          id?: string
          max_score?: number
          model_version?: string | null
          needs_review?: boolean | null
          percentage?: number | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          scored_at?: string | null
          scoring_latency_ms?: number | null
          scoring_method?: string | null
          skill_contributions?: Json | null
          status?: Database["public"]["Enums"]["scoring_status"] | null
          submission_id?: string
          total_score?: number
          trait_scores?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scores_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      speaking_attempts: {
        Row: {
          audio_url: string | null
          content_score: number
          created_at: string
          detailed_analysis: Json | null
          duration_seconds: number | null
          feedback: Json | null
          fluency_score: number
          id: string
          overall_score: number
          pronunciation_score: number
          question_id: string
          spoken_text: string | null
          test_type: string
          user_id: string
        }
        Insert: {
          audio_url?: string | null
          content_score?: number
          created_at?: string
          detailed_analysis?: Json | null
          duration_seconds?: number | null
          feedback?: Json | null
          fluency_score?: number
          id?: string
          overall_score?: number
          pronunciation_score?: number
          question_id: string
          spoken_text?: string | null
          test_type: string
          user_id: string
        }
        Update: {
          audio_url?: string | null
          content_score?: number
          created_at?: string
          detailed_analysis?: Json | null
          duration_seconds?: number | null
          feedback?: Json | null
          fluency_score?: number
          id?: string
          overall_score?: number
          pronunciation_score?: number
          question_id?: string
          spoken_text?: string | null
          test_type?: string
          user_id?: string
        }
        Relationships: []
      }
      study_schedules: {
        Row: {
          completed_questions: number | null
          created_at: string | null
          estimated_minutes: number | null
          id: string
          is_completed: boolean | null
          question_types: string[]
          scheduled_date: string
          skill_type: string
          target_questions: number | null
          user_id: string
        }
        Insert: {
          completed_questions?: number | null
          created_at?: string | null
          estimated_minutes?: number | null
          id?: string
          is_completed?: boolean | null
          question_types: string[]
          scheduled_date: string
          skill_type: string
          target_questions?: number | null
          user_id: string
        }
        Update: {
          completed_questions?: number | null
          created_at?: string | null
          estimated_minutes?: number | null
          id?: string
          is_completed?: boolean | null
          question_types?: string[]
          scheduled_date?: string
          skill_type?: string
          target_questions?: number | null
          user_id?: string
        }
        Relationships: []
      }
      submissions: {
        Row: {
          audio_url: string | null
          duration_ms: number | null
          id: string
          ordered_items: Json | null
          processing_started_at: string | null
          question_id: string | null
          question_type: Database["public"]["Enums"]["question_type"]
          selected_options: Json | null
          session_id: string | null
          submitted_at: string | null
          text_response: string | null
          user_id: string
        }
        Insert: {
          audio_url?: string | null
          duration_ms?: number | null
          id?: string
          ordered_items?: Json | null
          processing_started_at?: string | null
          question_id?: string | null
          question_type: Database["public"]["Enums"]["question_type"]
          selected_options?: Json | null
          session_id?: string | null
          submitted_at?: string | null
          text_response?: string | null
          user_id: string
        }
        Update: {
          audio_url?: string | null
          duration_ms?: number | null
          id?: string
          ordered_items?: Json | null
          processing_started_at?: string | null
          question_id?: string | null
          question_type?: Database["public"]["Enums"]["question_type"]
          selected_options?: Json | null
          session_id?: string | null
          submitted_at?: string | null
          text_response?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "submissions_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "test_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string | null
          credits_remaining: number | null
          current_period_end: string | null
          current_period_start: string | null
          daily_credits_reset_at: string | null
          daily_credits_used: number | null
          id: string
          polar_customer_id: string | null
          polar_subscription_id: string | null
          status: string | null
          tier: Database["public"]["Enums"]["subscription_tier"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          credits_remaining?: number | null
          current_period_end?: string | null
          current_period_start?: string | null
          daily_credits_reset_at?: string | null
          daily_credits_used?: number | null
          id?: string
          polar_customer_id?: string | null
          polar_subscription_id?: string | null
          status?: string | null
          tier?: Database["public"]["Enums"]["subscription_tier"] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          credits_remaining?: number | null
          current_period_end?: string | null
          current_period_start?: string | null
          daily_credits_reset_at?: string | null
          daily_credits_used?: number | null
          id?: string
          polar_customer_id?: string | null
          polar_subscription_id?: string | null
          status?: string | null
          tier?: Database["public"]["Enums"]["subscription_tier"] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      test_sessions: {
        Row: {
          completed_at: string | null
          completed_questions: number | null
          created_at: string | null
          id: string
          listening_score: number | null
          overall_score: number | null
          reading_score: number | null
          speaking_score: number | null
          started_at: string | null
          test_type: string
          total_questions: number | null
          user_id: string
          writing_score: number | null
        }
        Insert: {
          completed_at?: string | null
          completed_questions?: number | null
          created_at?: string | null
          id?: string
          listening_score?: number | null
          overall_score?: number | null
          reading_score?: number | null
          speaking_score?: number | null
          started_at?: string | null
          test_type: string
          total_questions?: number | null
          user_id: string
          writing_score?: number | null
        }
        Update: {
          completed_at?: string | null
          completed_questions?: number | null
          created_at?: string | null
          id?: string
          listening_score?: number | null
          overall_score?: number | null
          reading_score?: number | null
          speaking_score?: number | null
          started_at?: string | null
          test_type?: string
          total_questions?: number | null
          user_id?: string
          writing_score?: number | null
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          attempt_count: number | null
          average_score: number | null
          best_score: number | null
          id: string
          last_attempt_at: string | null
          question_type: Database["public"]["Enums"]["question_type"]
          skill_type: string
          total_time_spent_ms: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          attempt_count?: number | null
          average_score?: number | null
          best_score?: number | null
          id?: string
          last_attempt_at?: string | null
          question_type: Database["public"]["Enums"]["question_type"]
          skill_type: string
          total_time_spent_ms?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          attempt_count?: number | null
          average_score?: number | null
          best_score?: number | null
          id?: string
          last_attempt_at?: string | null
          question_type?: Database["public"]["Enums"]["question_type"]
          skill_type?: string
          total_time_spent_ms?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_max_score_for_question_type: {
        Args: { p_question_type: Database["public"]["Enums"]["question_type"] }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      reset_daily_credits: { Args: never; Returns: undefined }
      should_have_human_review: {
        Args: { p_question_type: Database["public"]["Enums"]["question_type"] }
        Returns: boolean
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      use_scoring_credit: { Args: { p_user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      question_type:
        | "read_aloud"
        | "repeat_sentence"
        | "retell_lecture"
        | "answer_short_question"
        | "summarise_group_discussion"
        | "respond_to_situation"
        | "summarize_written_text"
        | "write_essay"
        | "mc_single_reading"
        | "mc_multiple_reading"
        | "reorder_paragraphs"
        | "fill_blanks_dropdown"
        | "fill_blanks_drag"
        | "summarize_spoken_text"
        | "mc_multiple_listening"
        | "mc_single_listening"
        | "fill_blanks_listening"
        | "highlight_correct_summary"
        | "select_missing_word"
        | "highlight_incorrect_words"
        | "write_from_dictation"
      scoring_status:
        | "pending"
        | "processing"
        | "completed"
        | "failed"
        | "needs_review"
        | "human_review_pending"
      subscription_tier: "free" | "basic" | "premium" | "enterprise"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      question_type: [
        "read_aloud",
        "repeat_sentence",
        "retell_lecture",
        "answer_short_question",
        "summarise_group_discussion",
        "respond_to_situation",
        "summarize_written_text",
        "write_essay",
        "mc_single_reading",
        "mc_multiple_reading",
        "reorder_paragraphs",
        "fill_blanks_dropdown",
        "fill_blanks_drag",
        "summarize_spoken_text",
        "mc_multiple_listening",
        "mc_single_listening",
        "fill_blanks_listening",
        "highlight_correct_summary",
        "select_missing_word",
        "highlight_incorrect_words",
        "write_from_dictation",
      ],
      scoring_status: [
        "pending",
        "processing",
        "completed",
        "failed",
        "needs_review",
        "human_review_pending",
      ],
      subscription_tier: ["free", "basic", "premium", "enterprise"],
    },
  },
} as const
