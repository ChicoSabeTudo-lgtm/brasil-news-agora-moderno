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
      analytics_audience_peaks: {
        Row: {
          created_at: string
          date: string
          id: string
          peak_count: number
          peak_time: string
        }
        Insert: {
          created_at?: string
          date?: string
          id?: string
          peak_count: number
          peak_time?: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          peak_count?: number
          peak_time?: string
        }
        Relationships: []
      }
      analytics_heartbeats: {
        Row: {
          article_id: string | null
          created_at: string
          id: string
          last_seen: string
          session_id: string
          visitor_ip: unknown | null
        }
        Insert: {
          article_id?: string | null
          created_at?: string
          id?: string
          last_seen?: string
          session_id: string
          visitor_ip?: unknown | null
        }
        Update: {
          article_id?: string | null
          created_at?: string
          id?: string
          last_seen?: string
          session_id?: string
          visitor_ip?: unknown | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_heartbeats_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "news"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_page_views: {
        Row: {
          article_id: string | null
          created_at: string
          id: string
          page_url: string
          referrer: string | null
          session_id: string
          user_agent: string | null
          visitor_ip: unknown | null
        }
        Insert: {
          article_id?: string | null
          created_at?: string
          id?: string
          page_url: string
          referrer?: string | null
          session_id: string
          user_agent?: string | null
          visitor_ip?: unknown | null
        }
        Update: {
          article_id?: string | null
          created_at?: string
          id?: string
          page_url?: string
          referrer?: string | null
          session_id?: string
          user_agent?: string | null
          visitor_ip?: unknown | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_page_views_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "news"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_read_time: {
        Row: {
          article_id: string | null
          created_at: string
          id: string
          seconds: number
          session_id: string
        }
        Insert: {
          article_id?: string | null
          created_at?: string
          id?: string
          seconds?: number
          session_id: string
        }
        Update: {
          article_id?: string | null
          created_at?: string
          id?: string
          seconds?: number
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "analytics_read_time_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "news"
            referencedColumns: ["id"]
          },
        ]
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
      finance_advertisements: {
        Row: {
          ad_type: string
          client_name: string
          contact_id: string | null
          created_at: string
          end_date: string
          id: string
          link: string | null
          notes: string | null
          start_date: string
          updated_at: string
        }
        Insert: {
          ad_type: string
          client_name: string
          contact_id?: string | null
          created_at?: string
          end_date: string
          id?: string
          link?: string | null
          notes?: string | null
          start_date: string
          updated_at?: string
        }
        Update: {
          ad_type?: string
          client_name?: string
          contact_id?: string | null
          created_at?: string
          end_date?: string
          id?: string
          link?: string | null
          notes?: string | null
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "finance_advertisements_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "finance_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_attachments: {
        Row: {
          created_at: string
          id: string
          mime_type: string | null
          name: string
          path: string
          size_bytes: number | null
          transaction_id: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          mime_type?: string | null
          name: string
          path: string
          size_bytes?: number | null
          transaction_id: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          mime_type?: string | null
          name?: string
          path?: string
          size_bytes?: number | null
          transaction_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "finance_attachments_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "finance_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_categories: {
        Row: {
          created_at: string
          id: string
          name: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      finance_contacts: {
        Row: {
          company: string | null
          contact_person: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          type: string
          updated_at: string
        }
        Insert: {
          company?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          company?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      finance_projects: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      finance_transactions: {
        Row: {
          category_id: string | null
          contact_id: string | null
          created_at: string
          description: string
          due_date: string
          id: string
          method: string | null
          pay_date: string | null
          project_id: string | null
          receipt_url: string | null
          status: string
          supplier: string | null
          type: string
          updated_at: string
          value: number
        }
        Insert: {
          category_id?: string | null
          contact_id?: string | null
          created_at?: string
          description: string
          due_date: string
          id?: string
          method?: string | null
          pay_date?: string | null
          project_id?: string | null
          receipt_url?: string | null
          status: string
          supplier?: string | null
          type: string
          updated_at?: string
          value: number
        }
        Update: {
          category_id?: string | null
          contact_id?: string | null
          created_at?: string
          description?: string
          due_date?: string
          id?: string
          method?: string | null
          pay_date?: string | null
          project_id?: string | null
          receipt_url?: string | null
          status?: string
          supplier?: string | null
          type?: string
          updated_at?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "finance_transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "finance_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_transactions_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "finance_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_transactions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "finance_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      instagram_images: {
        Row: {
          created_at: string
          id: string
          image_url: string
          title: string | null
          updated_at: string
          user_id: string
          visual_data: Json | null
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          title?: string | null
          updated_at?: string
          user_id: string
          visual_data?: Json | null
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          title?: string | null
          updated_at?: string
          user_id?: string
          visual_data?: Json | null
        }
        Relationships: []
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
          cron_job_id: number | null
          embed_code: string | null
          id: string
          is_breaking: boolean | null
          is_featured: boolean | null
          is_published: boolean | null
          meta_description: string
          published_at: string | null
          scheduled_publish_at: string | null
          slug: string | null
          status: string
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
          cron_job_id?: number | null
          embed_code?: string | null
          id?: string
          is_breaking?: boolean | null
          is_featured?: boolean | null
          is_published?: boolean | null
          meta_description: string
          published_at?: string | null
          scheduled_publish_at?: string | null
          slug?: string | null
          status?: string
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
          cron_job_id?: number | null
          embed_code?: string | null
          id?: string
          is_breaking?: boolean | null
          is_featured?: boolean | null
          is_published?: boolean | null
          meta_description?: string
          published_at?: string | null
          scheduled_publish_at?: string | null
          slug?: string | null
          status?: string
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
          is_cover: boolean
          news_id: string
          path: string | null
          public_url: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          image_url: string
          is_cover?: boolean
          news_id: string
          path?: string | null
          public_url?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          image_url?: string
          is_cover?: boolean
          news_id?: string
          path?: string | null
          public_url?: string | null
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
          user_password: string | null
        }
        Insert: {
          code: string
          created_at?: string
          expires_at: string
          id?: string
          user_email: string
          user_password?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          expires_at?: string
          id?: string
          user_email?: string
          user_password?: string | null
        }
        Relationships: []
      }
      poll_options: {
        Row: {
          created_at: string
          id: string
          option_text: string
          poll_id: string
          sort_order: number
          updated_at: string
          vote_count: number
        }
        Insert: {
          created_at?: string
          id?: string
          option_text: string
          poll_id: string
          sort_order?: number
          updated_at?: string
          vote_count?: number
        }
        Update: {
          created_at?: string
          id?: string
          option_text?: string
          poll_id?: string
          sort_order?: number
          updated_at?: string
          vote_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "poll_options_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_votes: {
        Row: {
          created_at: string
          id: string
          option_id: string
          poll_id: string
          voted_at_date: string | null
          voter_ip: unknown | null
          voter_session_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          option_id: string
          poll_id: string
          voted_at_date?: string | null
          voter_ip?: unknown | null
          voter_session_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          option_id?: string
          poll_id?: string
          voted_at_date?: string | null
          voter_ip?: unknown | null
          voter_session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "poll_votes_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "poll_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "poll_votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
      polls: {
        Row: {
          allow_multiple_votes: boolean
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          is_active: boolean
          is_published: boolean
          title: string
          updated_at: string
          vote_limit_type: string | null
          vote_reset_time: string | null
        }
        Insert: {
          allow_multiple_votes?: boolean
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          is_published?: boolean
          title: string
          updated_at?: string
          vote_limit_type?: string | null
          vote_reset_time?: string | null
        }
        Update: {
          allow_multiple_votes?: boolean
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          is_published?: boolean
          title?: string
          updated_at?: string
          vote_limit_type?: string | null
          vote_reset_time?: string | null
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
          live_stream_block_enabled: boolean | null
          logo_url: string | null
          mockup_image_url: string | null
          otp_webhook_url: string | null
          poll_block_enabled: boolean | null
          social_webhook_url: string | null
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
          live_stream_block_enabled?: boolean | null
          logo_url?: string | null
          mockup_image_url?: string | null
          otp_webhook_url?: string | null
          poll_block_enabled?: boolean | null
          social_webhook_url?: string | null
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
          live_stream_block_enabled?: boolean | null
          logo_url?: string | null
          mockup_image_url?: string | null
          otp_webhook_url?: string | null
          poll_block_enabled?: boolean | null
          social_webhook_url?: string | null
          updated_at?: string
          updated_by?: string | null
          webhook_url?: string | null
        }
        Relationships: []
      }
      social_scheduled_posts: {
        Row: {
          content: string
          created_at: string
          created_by: string
          cron_job_id: number | null
          error_message: string | null
          id: string
          image_url: string | null
          news_id: string
          platform: string
          published_at: string | null
          scheduled_for: string
          status: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by: string
          cron_job_id?: number | null
          error_message?: string | null
          id?: string
          image_url?: string | null
          news_id: string
          platform: string
          published_at?: string | null
          scheduled_for: string
          status?: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string
          cron_job_id?: number | null
          error_message?: string | null
          id?: string
          image_url?: string | null
          news_id?: string
          platform?: string
          published_at?: string | null
          scheduled_for?: string
          status?: string
          updated_at?: string
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
        Args:
          | { admin_user_id: string; reason?: string; target_user_id: string }
          | { reason?: string; target_user_id: string }
        Returns: boolean
      }
      can_user_vote: {
        Args: {
          poll_id_param: string
          voter_ip_param?: unknown
          voter_session_id_param?: string
        }
        Returns: boolean
      }
      cancel_post_schedule: {
        Args: { p_post_id: string }
        Returns: undefined
      }
      cancel_social_schedule: {
        Args: { p_post_id: string }
        Returns: undefined
      }
      cleanup_expired_otp_codes: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_old_heartbeats: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_old_social_posts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      delete_user_safe: {
        Args:
          | { admin_user_id: string; reason?: string; target_user_id: string }
          | { reason?: string; target_user_id: string }
        Returns: boolean
      }
      generate_slug: {
        Args: { title: string }
        Returns: string
      }
      get_average_read_time: {
        Args: { days_back?: number }
        Returns: number
      }
      get_image_url_with_fallback: {
        Args: { p_image_url: string; p_path: string; p_public_url: string }
        Returns: string
      }
      get_online_visitors_count: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_public_profiles: {
        Args: { p_user_ids: string[] }
        Returns: {
          full_name: string
          user_id: string
        }[]
      }
      get_todays_peak_audience: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_video_views: {
        Args: { video_id: string }
        Returns: undefined
      }
      publish_post: {
        Args: { p_post_id: string }
        Returns: undefined
      }
      publish_scheduled_news: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      publish_social_post: {
        Args: { p_post_id: string }
        Returns: undefined
      }
      reorder_news_images: {
        Args: { p_image_orders: Json; p_news_id: string }
        Returns: undefined
      }
      revoke_user_access: {
        Args:
          | { admin_user_id: string; reason?: string; target_user_id: string }
          | { reason?: string; target_user_id: string }
        Returns: boolean
      }
      schedule_post_publish: {
        Args: { p_post_id: string; p_when: string }
        Returns: undefined
      }
      schedule_social_post: {
        Args: { p_post_id: string; p_when: string }
        Returns: undefined
      }
      set_news_cover: {
        Args: { p_image_id: string; p_news_id: string }
        Returns: undefined
      }
      update_user_role: {
        Args: {
          admin_user_id: string
          new_role: Database["public"]["Enums"]["app_role"]
          reason?: string
          target_user_id: string
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
