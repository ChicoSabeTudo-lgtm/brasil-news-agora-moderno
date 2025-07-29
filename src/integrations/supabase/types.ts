export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      advertisements: {
        Row: {
          ad_code: string | null
          created_at: string
          created_by: string | null
          end_date: string | null
          id: string
          image_url: string | null
          is_active: boolean
          link_url: string | null
          position: string
          start_date: string | null
          title: string
          updated_at: string
        }
        Insert: {
          ad_code?: string | null
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          link_url?: string | null
          position: string
          start_date?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          ad_code?: string | null
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          link_url?: string | null
          position?: string
          start_date?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      advertising_requests: {
        Row: {
          advertising_type: string
          budget_range: string
          campaign_description: string
          company_name: string
          contact_name: string
          created_at: string
          email: string
          id: string
          phone: string
          responded_at: string | null
          responded_by: string | null
          status: string
          updated_at: string
          website: string | null
        }
        Insert: {
          advertising_type: string
          budget_range: string
          campaign_description: string
          company_name: string
          contact_name: string
          created_at?: string
          email: string
          id?: string
          phone: string
          responded_at?: string | null
          responded_by?: string | null
          status?: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          advertising_type?: string
          budget_range?: string
          campaign_description?: string
          company_name?: string
          contact_name?: string
          created_at?: string
          email?: string
          id?: string
          phone?: string
          responded_at?: string | null
          responded_by?: string | null
          status?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
          sort_order: number | null
          template_type:
            | Database["public"]["Enums"]["category_template_type"]
            | null
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          sort_order?: number | null
          template_type?:
            | Database["public"]["Enums"]["category_template_type"]
            | null
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          sort_order?: number | null
          template_type?:
            | Database["public"]["Enums"]["category_template_type"]
            | null
          updated_at?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          responded_at: string | null
          responded_by: string | null
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          responded_at?: string | null
          responded_by?: string | null
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          responded_at?: string | null
          responded_by?: string | null
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      daily_briefs: {
        Row: {
          brief_date: string
          brief_time: string
          category_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          image_url: string | null
          priority: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          brief_date?: string
          brief_time?: string
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          priority?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          brief_date?: string
          brief_time?: string
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          priority?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_briefs_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      live_programs: {
        Row: {
          created_at: string
          days_of_week: number[]
          description: string | null
          end_time: string
          id: string
          is_active: boolean
          live_stream_id: string | null
          start_time: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          days_of_week?: number[]
          description?: string | null
          end_time: string
          id?: string
          is_active?: boolean
          live_stream_id?: string | null
          start_time: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          days_of_week?: number[]
          description?: string | null
          end_time?: string
          id?: string
          is_active?: boolean
          live_stream_id?: string | null
          start_time?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_programs_live_stream_id_fkey"
            columns: ["live_stream_id"]
            isOneToOne: false
            referencedRelation: "live_streams"
            referencedColumns: ["id"]
          },
        ]
      }
      live_streams: {
        Row: {
          actual_end: string | null
          actual_start: string | null
          chat_enabled: boolean
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          scheduled_start: string | null
          stream_url: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          viewer_count: number
        }
        Insert: {
          actual_end?: string | null
          actual_start?: string | null
          chat_enabled?: boolean
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          scheduled_start?: string | null
          stream_url?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          viewer_count?: number
        }
        Update: {
          actual_end?: string | null
          actual_start?: string | null
          chat_enabled?: boolean
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          scheduled_start?: string | null
          stream_url?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          viewer_count?: number
        }
        Relationships: []
      }
      news: {
        Row: {
          author_id: string | null
          category_id: string | null
          content: string
          created_at: string
          embed_code: string | null
          id: string
          is_breaking: boolean | null
          is_featured: boolean | null
          is_published: boolean | null
          meta_description: string
          published_at: string | null
          scheduled_publish_at: string | null
          slug: string | null
          subtitle: string | null
          tags: string[] | null
          title: string
          updated_at: string
          views: number | null
        }
        Insert: {
          author_id?: string | null
          category_id?: string | null
          content: string
          created_at?: string
          embed_code?: string | null
          id?: string
          is_breaking?: boolean | null
          is_featured?: boolean | null
          is_published?: boolean | null
          meta_description: string
          published_at?: string | null
          scheduled_publish_at?: string | null
          slug?: string | null
          subtitle?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          views?: number | null
        }
        Update: {
          author_id?: string | null
          category_id?: string | null
          content?: string
          created_at?: string
          embed_code?: string | null
          id?: string
          is_breaking?: boolean | null
          is_featured?: boolean | null
          is_published?: boolean | null
          meta_description?: string
          published_at?: string | null
          scheduled_publish_at?: string | null
          slug?: string | null
          subtitle?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "news_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      news_advertisements: {
        Row: {
          advertisement_id: string
          created_at: string
          id: string
          is_active: boolean
          news_id: string
          paragraph_position: number
          updated_at: string
        }
        Insert: {
          advertisement_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          news_id: string
          paragraph_position?: number
          updated_at?: string
        }
        Update: {
          advertisement_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          news_id?: string
          paragraph_position?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_advertisements_advertisement_id_fkey"
            columns: ["advertisement_id"]
            isOneToOne: false
            referencedRelation: "advertisements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "news_advertisements_news_id_fkey"
            columns: ["news_id"]
            isOneToOne: false
            referencedRelation: "news"
            referencedColumns: ["id"]
          },
        ]
      }
      news_downloads: {
        Row: {
          created_at: string
          description: string | null
          file_size: number | null
          file_type: string | null
          file_url: string
          filename: string
          id: string
          news_id: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url: string
          filename: string
          id?: string
          news_id: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          filename?: string
          id?: string
          news_id?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_news_downloads_news"
            columns: ["news_id"]
            isOneToOne: false
            referencedRelation: "news"
            referencedColumns: ["id"]
          },
        ]
      }
      news_images: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          image_url: string
          is_featured: boolean
          news_id: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          image_url: string
          is_featured?: boolean
          news_id: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          image_url?: string
          is_featured?: boolean
          news_id?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_images_news_id_fkey"
            columns: ["news_id"]
            isOneToOne: false
            referencedRelation: "news"
            referencedColumns: ["id"]
          },
        ]
      }
      news_media: {
        Row: {
          created_at: string
          duration: number | null
          file_name: string
          file_size: number | null
          file_type: string
          file_url: string
          id: string
          mime_type: string
          news_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          duration?: number | null
          file_name: string
          file_size?: number | null
          file_type: string
          file_url: string
          id?: string
          mime_type: string
          news_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          duration?: number | null
          file_name?: string
          file_size?: number | null
          file_type?: string
          file_url?: string
          id?: string
          mime_type?: string
          news_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      otp_codes: {
        Row: {
          code: string
          created_at: string
          expires_at: string
          id: string
          user_email: string
        }
        Insert: {
          code: string
          created_at?: string
          expires_at: string
          id?: string
          user_email: string
        }
        Update: {
          code?: string
          created_at?: string
          expires_at?: string
          id?: string
          user_email?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          access_revoked: boolean | null
          approved_at: string | null
          approved_by: string | null
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          is_approved: boolean | null
          revoked_at: string | null
          revoked_by: string | null
          updated_at: string
          user_id: string
          whatsapp_phone: string | null
        }
        Insert: {
          access_revoked?: boolean | null
          approved_at?: string | null
          approved_by?: string | null
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_approved?: boolean | null
          revoked_at?: string | null
          revoked_by?: string | null
          updated_at?: string
          user_id: string
          whatsapp_phone?: string | null
        }
        Update: {
          access_revoked?: boolean | null
          approved_at?: string | null
          approved_by?: string | null
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_approved?: boolean | null
          revoked_at?: string | null
          revoked_by?: string | null
          updated_at?: string
          user_id?: string
          whatsapp_phone?: string | null
        }
        Relationships: []
      }
      role_audit_log: {
        Row: {
          changed_at: string
          changed_by: string
          id: string
          new_role: Database["public"]["Enums"]["app_role"] | null
          old_role: Database["public"]["Enums"]["app_role"] | null
          reason: string | null
          user_id: string
        }
        Insert: {
          changed_at?: string
          changed_by: string
          id?: string
          new_role?: Database["public"]["Enums"]["app_role"] | null
          old_role?: Database["public"]["Enums"]["app_role"] | null
          reason?: string | null
          user_id: string
        }
        Update: {
          changed_at?: string
          changed_by?: string
          id?: string
          new_role?: Database["public"]["Enums"]["app_role"] | null
          old_role?: Database["public"]["Enums"]["app_role"] | null
          reason?: string | null
          user_id?: string
        }
        Relationships: []
      }
      site_configurations: {
        Row: {
          ads_txt_content: string | null
          created_at: string
          footer_code: string | null
          header_code: string | null
          id: string
          logo_url: string | null
          mockup_image_url: string | null
          updated_at: string
          updated_by: string | null
          webhook_url: string | null
        }
        Insert: {
          ads_txt_content?: string | null
          created_at?: string
          footer_code?: string | null
          header_code?: string | null
          id?: string
          logo_url?: string | null
          mockup_image_url?: string | null
          updated_at?: string
          updated_by?: string | null
          webhook_url?: string | null
        }
        Update: {
          ads_txt_content?: string | null
          created_at?: string
          footer_code?: string | null
          header_code?: string | null
          id?: string
          logo_url?: string | null
          mockup_image_url?: string | null
          updated_at?: string
          updated_by?: string | null
          webhook_url?: string | null
        }
        Relationships: []
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
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      videos: {
        Row: {
          category_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          duration: string
          id: string
          is_published: boolean
          published_at: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          video_url: string
          views: number
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration: string
          id?: string
          is_published?: boolean
          published_at?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          video_url: string
          views?: number
        }
        Update: {
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration?: string
          id?: string
          is_published?: boolean
          published_at?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          video_url?: string
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "videos_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_user_access: {
        Args: { target_user_id: string; reason?: string }
        Returns: boolean
      }
      cleanup_expired_otp_codes: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      delete_user_safe: {
        Args: { target_user_id: string; reason?: string }
        Returns: boolean
      }
      generate_slug: {
        Args: { title: string }
        Returns: string
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      increment_video_views: {
        Args: { video_id: string }
        Returns: undefined
      }
      publish_scheduled_news: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      revoke_user_access: {
        Args: { target_user_id: string; reason?: string }
        Returns: boolean
      }
      update_user_role: {
        Args: {
          target_user_id: string
          new_role: Database["public"]["Enums"]["app_role"]
          reason?: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "redator"
      category_template_type: "standard" | "grid" | "list" | "magazine"
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
      app_role: ["admin", "redator"],
      category_template_type: ["standard", "grid", "list", "magazine"],
    },
  },
} as const
