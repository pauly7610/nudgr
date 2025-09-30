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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      alerts_config: {
        Row: {
          alert_type: string
          conditions: Json
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          last_triggered_at: string | null
          name: string
          notification_channels: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          alert_type: string
          conditions: Json
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          name: string
          notification_channels?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          alert_type?: string
          conditions?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          name?: string
          notification_channels?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_config_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      api_keys: {
        Row: {
          allowed_domains: string[] | null
          api_key: string
          created_at: string
          id: string
          is_active: boolean | null
          key_name: string
          last_used_at: string | null
          metadata: Json | null
          rate_limit_per_minute: number | null
          user_id: string
        }
        Insert: {
          allowed_domains?: string[] | null
          api_key: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          key_name: string
          last_used_at?: string | null
          metadata?: Json | null
          rate_limit_per_minute?: number | null
          user_id: string
        }
        Update: {
          allowed_domains?: string[] | null
          api_key?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          key_name?: string
          last_used_at?: string | null
          metadata?: Json | null
          rate_limit_per_minute?: number | null
          user_id?: string
        }
        Relationships: []
      }
      cohorts: {
        Row: {
          created_at: string
          created_by: string | null
          criteria: Json
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          criteria: Json
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          criteria?: Json
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cohorts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboard_configs: {
        Row: {
          created_at: string
          description: string | null
          filters: Json | null
          id: string
          is_default: boolean | null
          is_shared: boolean | null
          layout: Json
          name: string
          shared_with_roles: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          filters?: Json | null
          id?: string
          is_default?: boolean | null
          is_shared?: boolean | null
          layout?: Json
          name: string
          shared_with_roles?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          filters?: Json | null
          id?: string
          is_default?: boolean | null
          is_shared?: boolean | null
          layout?: Json
          name?: string
          shared_with_roles?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dashboard_configs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      export_jobs: {
        Row: {
          completed_at: string | null
          created_at: string
          error_message: string | null
          export_type: string
          id: string
          parameters: Json | null
          status: string
          storage_path: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          export_type: string
          id?: string
          parameters?: Json | null
          status?: string
          storage_path?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          export_type?: string
          id?: string
          parameters?: Json | null
          status?: string
          storage_path?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "export_jobs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      form_analytics: {
        Row: {
          abandonment_count: number | null
          abandonment_rate: number | null
          avg_time_to_complete_ms: number | null
          common_error_messages: Json | null
          created_at: string
          date_bucket: string
          error_rate: number | null
          field_name: string
          field_type: string | null
          form_selector: string
          id: string
          page_url: string
          total_errors: number | null
          total_interactions: number | null
          updated_at: string
        }
        Insert: {
          abandonment_count?: number | null
          abandonment_rate?: number | null
          avg_time_to_complete_ms?: number | null
          common_error_messages?: Json | null
          created_at?: string
          date_bucket?: string
          error_rate?: number | null
          field_name: string
          field_type?: string | null
          form_selector: string
          id?: string
          page_url: string
          total_errors?: number | null
          total_interactions?: number | null
          updated_at?: string
        }
        Update: {
          abandonment_count?: number | null
          abandonment_rate?: number | null
          avg_time_to_complete_ms?: number | null
          common_error_messages?: Json | null
          created_at?: string
          date_bucket?: string
          error_rate?: number | null
          field_name?: string
          field_type?: string | null
          form_selector?: string
          id?: string
          page_url?: string
          total_errors?: number | null
          total_interactions?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      friction_events: {
        Row: {
          created_at: string
          element_selector: string | null
          error_message: string | null
          event_type: string
          id: string
          metadata: Json | null
          page_url: string
          screenshot_url: string | null
          session_id: string
          severity_score: number
          timestamp: string
          user_action: string | null
        }
        Insert: {
          created_at?: string
          element_selector?: string | null
          error_message?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          page_url: string
          screenshot_url?: string | null
          session_id: string
          severity_score: number
          timestamp?: string
          user_action?: string | null
        }
        Update: {
          created_at?: string
          element_selector?: string | null
          error_message?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          page_url?: string
          screenshot_url?: string | null
          session_id?: string
          severity_score?: number
          timestamp?: string
          user_action?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "friction_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      heatmap_data: {
        Row: {
          avg_duration_ms: number | null
          created_at: string
          date_bucket: string
          element_selector: string
          friction_score: number | null
          id: string
          interaction_count: number | null
          interaction_type: string
          page_url: string
          total_duration_ms: number | null
          updated_at: string
          viewport_height: number | null
          viewport_width: number | null
          x_position: number | null
          y_position: number | null
        }
        Insert: {
          avg_duration_ms?: number | null
          created_at?: string
          date_bucket?: string
          element_selector: string
          friction_score?: number | null
          id?: string
          interaction_count?: number | null
          interaction_type: string
          page_url: string
          total_duration_ms?: number | null
          updated_at?: string
          viewport_height?: number | null
          viewport_width?: number | null
          x_position?: number | null
          y_position?: number | null
        }
        Update: {
          avg_duration_ms?: number | null
          created_at?: string
          date_bucket?: string
          element_selector?: string
          friction_score?: number | null
          id?: string
          interaction_count?: number | null
          interaction_type?: string
          page_url?: string
          total_duration_ms?: number | null
          updated_at?: string
          viewport_height?: number | null
          viewport_width?: number | null
          x_position?: number | null
          y_position?: number | null
        }
        Relationships: []
      }
      notification_log: {
        Row: {
          alert_id: string | null
          created_at: string
          error_message: string | null
          id: string
          message: string
          notification_type: string
          recipient: string
          sent_at: string | null
          status: string
          subject: string | null
        }
        Insert: {
          alert_id?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          message: string
          notification_type: string
          recipient: string
          sent_at?: string | null
          status?: string
          subject?: string | null
        }
        Update: {
          alert_id?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          message?: string
          notification_type?: string
          recipient?: string
          sent_at?: string | null
          status?: string
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_log_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "alerts_config"
            referencedColumns: ["id"]
          },
        ]
      }
      page_performance_metrics: {
        Row: {
          avg_first_contentful_paint_ms: number | null
          avg_load_time_ms: number | null
          avg_time_on_page_seconds: number | null
          avg_time_to_interactive_ms: number | null
          bounce_rate: number | null
          created_at: string
          date_bucket: string
          exit_rate: number | null
          id: string
          page_url: string
          total_page_views: number | null
          updated_at: string
        }
        Insert: {
          avg_first_contentful_paint_ms?: number | null
          avg_load_time_ms?: number | null
          avg_time_on_page_seconds?: number | null
          avg_time_to_interactive_ms?: number | null
          bounce_rate?: number | null
          created_at?: string
          date_bucket?: string
          exit_rate?: number | null
          id?: string
          page_url: string
          total_page_views?: number | null
          updated_at?: string
        }
        Update: {
          avg_first_contentful_paint_ms?: number | null
          avg_load_time_ms?: number | null
          avg_time_on_page_seconds?: number | null
          avg_time_to_interactive_ms?: number | null
          bounce_rate?: number | null
          created_at?: string
          date_bucket?: string
          exit_rate?: number | null
          id?: string
          page_url?: string
          total_page_views?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          created_at: string | null
          endpoint: string
          id: string
          identifier: string
          request_count: number | null
          window_start: string | null
        }
        Insert: {
          created_at?: string | null
          endpoint: string
          id?: string
          identifier: string
          request_count?: number | null
          window_start?: string | null
        }
        Update: {
          created_at?: string | null
          endpoint?: string
          id?: string
          identifier?: string
          request_count?: number | null
          window_start?: string | null
        }
        Relationships: []
      }
      scroll_depth_analytics: {
        Row: {
          avg_scroll_percentage: number
          bounce_at_percentage: number | null
          created_at: string
          date_bucket: string
          id: string
          max_scroll_percentage: number
          page_url: string
          total_sessions: number | null
          updated_at: string
        }
        Insert: {
          avg_scroll_percentage: number
          bounce_at_percentage?: number | null
          created_at?: string
          date_bucket?: string
          id?: string
          max_scroll_percentage: number
          page_url: string
          total_sessions?: number | null
          updated_at?: string
        }
        Update: {
          avg_scroll_percentage?: number
          bounce_at_percentage?: number | null
          created_at?: string
          date_bucket?: string
          id?: string
          max_scroll_percentage?: number
          page_url?: string
          total_sessions?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      session_recordings: {
        Row: {
          created_at: string
          duration_seconds: number | null
          file_size_bytes: number | null
          friction_events_count: number | null
          id: string
          metadata: Json | null
          recording_end: string | null
          recording_start: string
          session_id: string
          storage_path: string
        }
        Insert: {
          created_at?: string
          duration_seconds?: number | null
          file_size_bytes?: number | null
          friction_events_count?: number | null
          id?: string
          metadata?: Json | null
          recording_end?: string | null
          recording_start: string
          session_id: string
          storage_path: string
        }
        Update: {
          created_at?: string
          duration_seconds?: number | null
          file_size_bytes?: number | null
          friction_events_count?: number | null
          id?: string
          metadata?: Json | null
          recording_end?: string | null
          recording_start?: string
          session_id?: string
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_recordings_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          created_at: string
          id: string
          ip_address: string | null
          metadata: Json | null
          page_url: string
          session_end: string | null
          session_start: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          page_url: string
          session_end?: string | null
          session_start?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          page_url?: string
          session_end?: string | null
          session_start?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_old_rate_limits: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      upsert_heatmap_data: {
        Args: {
          p_element_selector: string
          p_friction_score: number
          p_interaction_type: string
          p_page_url: string
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "analyst" | "viewer"
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
      app_role: ["admin", "analyst", "viewer"],
    },
  },
} as const
