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
      admin_audit_logs: {
        Row: {
          action: string
          admin_user_id: string
          created_at: string
          entity_id: string | null
          entity_name: string | null
          entity_type: string
          id: string
          ip_address: string | null
          new_values: Json | null
          old_values: Json | null
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_user_id: string
          created_at?: string
          entity_id?: string | null
          entity_name?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_user_id?: string
          created_at?: string
          entity_id?: string | null
          entity_name?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
        }
        Relationships: []
      }
      announcement_reads: {
        Row: {
          announcement_id: string
          id: string
          read_at: string
          user_id: string
        }
        Insert: {
          announcement_id: string
          id?: string
          read_at?: string
          user_id: string
        }
        Update: {
          announcement_id?: string
          id?: string
          read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcement_reads_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "announcements"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          content: string
          course_id: string | null
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          is_published: boolean
          published_at: string | null
          target_audience: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          content: string
          course_id?: string | null
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_published?: boolean
          published_at?: string | null
          target_audience?: string
          title: string
          type?: string
          updated_at?: string
        }
        Update: {
          content?: string
          course_id?: string | null
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_published?: boolean
          published_at?: string | null
          target_audience?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_chat_messages: {
        Row: {
          content: string
          course_id: string | null
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          course_id?: string | null
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          course_id?: string | null
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_chat_messages_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      badges: {
        Row: {
          category: string
          created_at: string
          description: string
          icon: string
          id: string
          name: string
          requirement_type: string
          requirement_value: number
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          icon: string
          id?: string
          name: string
          requirement_type: string
          requirement_value: number
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          icon?: string
          id?: string
          name?: string
          requirement_type?: string
          requirement_value?: number
        }
        Relationships: []
      }
      certificates: {
        Row: {
          certificate_number: string
          course_id: string
          created_at: string
          id: string
          issued_at: string
          pdf_url: string | null
          user_id: string
        }
        Insert: {
          certificate_number: string
          course_id: string
          created_at?: string
          id?: string
          issued_at?: string
          pdf_url?: string | null
          user_id: string
        }
        Update: {
          certificate_number?: string
          course_id?: string
          created_at?: string
          id?: string
          issued_at?: string
          pdf_url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      corporate_accounts: {
        Row: {
          company_name: string
          contact_email: string
          contact_name: string | null
          created_at: string | null
          employee_count: number | null
          id: string
          notes: string | null
          phone: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          company_name: string
          contact_email: string
          contact_name?: string | null
          created_at?: string | null
          employee_count?: number | null
          id?: string
          notes?: string | null
          phone?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          company_name?: string
          contact_email?: string
          contact_name?: string | null
          created_at?: string | null
          employee_count?: number | null
          id?: string
          notes?: string | null
          phone?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      corporate_enrollments: {
        Row: {
          corporate_account_id: string | null
          enrolled_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          corporate_account_id?: string | null
          enrolled_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          corporate_account_id?: string | null
          enrolled_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "corporate_enrollments_corporate_account_id_fkey"
            columns: ["corporate_account_id"]
            isOneToOne: false
            referencedRelation: "corporate_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      course_prerequisites: {
        Row: {
          course_id: string
          created_at: string
          id: string
          is_required: boolean
          prerequisite_course_id: string
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          is_required?: boolean
          prerequisite_course_id: string
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          is_required?: boolean
          prerequisite_course_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_prerequisites_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_prerequisites_prerequisite_course_id_fkey"
            columns: ["prerequisite_course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      cost_estimates: {
        Row: {
          ai_cost: number
          created_at: string
          date: string
          db_cost: number
          edge_function_cost: number
          id: string
          storage_cost: number
          total_cost: number
          usage_data: Json | null
        }
        Insert: {
          ai_cost?: number
          created_at?: string
          date?: string
          db_cost?: number
          edge_function_cost?: number
          id?: string
          storage_cost?: number
          total_cost?: number
          usage_data?: Json | null
        }
        Update: {
          ai_cost?: number
          created_at?: string
          date?: string
          db_cost?: number
          edge_function_cost?: number
          id?: string
          storage_cost?: number
          total_cost?: number
          usage_data?: Json | null
        }
        Relationships: []
      }
      course_reviews: {
        Row: {
          content: string | null
          course_id: string
          created_at: string
          helpful_count: number | null
          id: string
          is_verified_purchase: boolean | null
          rating: number
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string | null
          course_id: string
          created_at?: string
          helpful_count?: number | null
          id?: string
          is_verified_purchase?: boolean | null
          rating: number
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string | null
          course_id?: string
          created_at?: string
          helpful_count?: number | null
          id?: string
          is_verified_purchase?: boolean | null
          rating?: number
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_reviews_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_syllabuses: {
        Row: {
          course_id: string
          created_at: string
          id: string
          objective: string | null
          syllabus_areas: Json
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          objective?: string | null
          syllabus_areas?: Json
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          objective?: string | null
          syllabus_areas?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_syllabuses_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: true
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          created_at: string
          deleted_at: string | null
          description: string | null
          duration_hours: number | null
          id: string
          image_url: string | null
          level: string
          price: number
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          duration_hours?: number | null
          id?: string
          image_url?: string | null
          level?: string
          price?: number
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          duration_hours?: number | null
          id?: string
          image_url?: string | null
          level?: string
          price?: number
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      discussion_posts: {
        Row: {
          content: string
          course_id: string
          created_at: string
          id: string
          is_pinned: boolean | null
          is_resolved: boolean | null
          lesson_id: string | null
          parent_id: string | null
          title: string | null
          updated_at: string
          upvotes: number | null
          user_id: string
        }
        Insert: {
          content: string
          course_id: string
          created_at?: string
          id?: string
          is_pinned?: boolean | null
          is_resolved?: boolean | null
          lesson_id?: string | null
          parent_id?: string | null
          title?: string | null
          updated_at?: string
          upvotes?: number | null
          user_id: string
        }
        Update: {
          content?: string
          course_id?: string
          created_at?: string
          id?: string
          is_pinned?: boolean | null
          is_resolved?: boolean | null
          lesson_id?: string | null
          parent_id?: string | null
          title?: string | null
          updated_at?: string
          upvotes?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "discussion_posts_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discussion_posts_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discussion_posts_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "discussion_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      discussion_votes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
          vote_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
          vote_type: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
          vote_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "discussion_votes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "discussion_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          access_type: string
          completed_at: string | null
          completed_course_slug: string | null
          course_id: string
          enrolled_at: string
          expires_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          access_type?: string
          completed_at?: string | null
          completed_course_slug?: string | null
          course_id: string
          enrolled_at?: string
          expires_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          access_type?: string
          completed_at?: string | null
          completed_course_slug?: string | null
          course_id?: string
          enrolled_at?: string
          expires_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      flashcard_cards: {
        Row: {
          back: string
          created_at: string
          deck_id: string
          difficulty_level: number
          front: string
          hint: string | null
          id: string
          order_index: number
          times_correct: number
          times_shown: number
        }
        Insert: {
          back: string
          created_at?: string
          deck_id: string
          difficulty_level?: number
          front: string
          hint?: string | null
          id?: string
          order_index?: number
          times_correct?: number
          times_shown?: number
        }
        Update: {
          back?: string
          created_at?: string
          deck_id?: string
          difficulty_level?: number
          front?: string
          hint?: string | null
          id?: string
          order_index?: number
          times_correct?: number
          times_shown?: number
        }
        Relationships: [
          {
            foreignKeyName: "flashcard_cards_deck_id_fkey"
            columns: ["deck_id"]
            isOneToOne: false
            referencedRelation: "flashcard_decks"
            referencedColumns: ["id"]
          },
        ]
      }
      flashcard_decks: {
        Row: {
          card_count: number
          course_id: string
          created_at: string
          description: string | null
          id: string
          is_system_generated: boolean
          lesson_id: string | null
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          card_count?: number
          course_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_system_generated?: boolean
          lesson_id?: string | null
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          card_count?: number
          course_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_system_generated?: boolean
          lesson_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "flashcard_decks_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flashcard_decks_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      flashcard_progress: {
        Row: {
          card_id: string
          created_at: string
          deck_id: string
          ease_factor: number
          id: string
          interval_days: number
          last_reviewed_at: string | null
          next_review_at: string | null
          repetitions: number
          user_id: string
        }
        Insert: {
          card_id: string
          created_at?: string
          deck_id: string
          ease_factor?: number
          id?: string
          interval_days?: number
          last_reviewed_at?: string | null
          next_review_at?: string | null
          repetitions?: number
          user_id: string
        }
        Update: {
          card_id?: string
          created_at?: string
          deck_id?: string
          ease_factor?: number
          id?: string
          interval_days?: number
          last_reviewed_at?: string | null
          next_review_at?: string | null
          repetitions?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "flashcard_progress_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "flashcard_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flashcard_progress_deck_id_fkey"
            columns: ["deck_id"]
            isOneToOne: false
            referencedRelation: "flashcard_decks"
            referencedColumns: ["id"]
          },
        ]
      }
      flashcards: {
        Row: {
          back: string
          created_at: string | null
          deck_id: string | null
          front: string
          id: string
          order_index: number | null
        }
        Insert: {
          back: string
          created_at?: string | null
          deck_id?: string | null
          front: string
          id?: string
          order_index?: number | null
        }
        Update: {
          back?: string
          created_at?: string | null
          deck_id?: string | null
          front?: string
          id?: string
          order_index?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "flashcards_deck_id_fkey"
            columns: ["deck_id"]
            isOneToOne: false
            referencedRelation: "flashcard_decks"
            referencedColumns: ["id"]
          },
        ]
      }
      interest_registrations: {
        Row: {
          course_id: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
        }
        Update: {
          course_id?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "interest_registrations_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          created_at: string
          currency: string
          due_at: string | null
          id: string
          issued_at: string
          paid_at: string | null
          payment_id: string | null
          pdf_url: string | null
          status: string
          stripe_invoice_id: string | null
          subscription_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          due_at?: string | null
          id?: string
          issued_at?: string
          paid_at?: string | null
          payment_id?: string | null
          pdf_url?: string | null
          status?: string
          stripe_invoice_id?: string | null
          subscription_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          due_at?: string | null
          id?: string
          issued_at?: string
          paid_at?: string | null
          payment_id?: string | null
          pdf_url?: string | null
          status?: string
          stripe_invoice_id?: string | null
          subscription_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_path_courses: {
        Row: {
          course_id: string
          created_at: string
          id: string
          is_required: boolean
          order_index: number
          path_id: string
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          is_required?: boolean
          order_index?: number
          path_id: string
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          is_required?: boolean
          order_index?: number
          path_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_path_courses_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_path_courses_path_id_fkey"
            columns: ["path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_paths: {
        Row: {
          created_at: string
          description: string | null
          estimated_hours: number | null
          id: string
          image_url: string | null
          is_published: boolean
          level: string | null
          order_index: number
          slug: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          estimated_hours?: number | null
          id?: string
          image_url?: string | null
          is_published?: boolean
          level?: string | null
          order_index?: number
          slug?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          estimated_hours?: number | null
          id?: string
          image_url?: string | null
          is_published?: boolean
          level?: string | null
          order_index?: number
          slug?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      lesson_tags: {
        Row: {
          lesson_id: string
          tag_id: string
        }
        Insert: {
          lesson_id: string
          tag_id: string
        }
        Update: {
          lesson_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_tags_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_notes: {
        Row: {
          content: string
          created_at: string
          id: string
          lesson_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string
          created_at?: string
          id?: string
          lesson_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          lesson_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_notes_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_progress: {
        Row: {
          completed: boolean
          completed_at: string | null
          id: string
          lesson_id: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          id?: string
          lesson_id: string
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          id?: string
          lesson_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_resources: {
        Row: {
          created_at: string
          description: string | null
          download_count: number | null
          file_size: number | null
          file_type: string
          file_url: string
          id: string
          is_course_level: boolean | null
          lesson_id: string
          order_index: number
          resource_type: string | null
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          download_count?: number | null
          file_size?: number | null
          file_type: string
          file_url: string
          id?: string
          is_course_level?: boolean | null
          lesson_id: string
          order_index?: number
          resource_type?: string | null
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          download_count?: number | null
          file_size?: number | null
          file_type?: string
          file_url?: string
          id?: string
          is_course_level?: boolean | null
          lesson_id?: string
          order_index?: number
          resource_type?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_resources_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          content: string | null
          course_id: string
          created_at: string
          deleted_at: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          order_index: number
          title: string
          video_url: string | null
        }
        Insert: {
          content?: string | null
          course_id: string
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          order_index?: number
          title: string
          video_url?: string | null
        }
        Update: {
          content?: string | null
          course_id?: string
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          order_index?: number
          title?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      mock_exam_specifications: {
        Row: {
          created_at: string
          id: string
          instructions: string | null
          is_proctored: boolean
          passing_score_percentage: number
          quiz_id: string
          sections: Json | null
          time_limit_minutes: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          instructions?: string | null
          is_proctored?: boolean
          passing_score_percentage?: number
          quiz_id: string
          sections?: Json | null
          time_limit_minutes?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          instructions?: string | null
          is_proctored?: boolean
          passing_score_percentage?: number
          quiz_id?: string
          sections?: Json | null
          time_limit_minutes?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mock_exam_specifications_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          course_completion: boolean | null
          created_at: string
          discussion_replies: boolean | null
          enrollment_confirmation: boolean | null
          id: string
          new_content: boolean | null
          progress_reminders: boolean | null
          updated_at: string
          user_id: string
          weekly_digest: boolean | null
        }
        Insert: {
          course_completion?: boolean | null
          created_at?: string
          discussion_replies?: boolean | null
          enrollment_confirmation?: boolean | null
          id?: string
          new_content?: boolean | null
          progress_reminders?: boolean | null
          updated_at?: string
          user_id: string
          weekly_digest?: boolean | null
        }
        Update: {
          course_completion?: boolean | null
          created_at?: string
          discussion_replies?: boolean | null
          enrollment_confirmation?: boolean | null
          id?: string
          new_content?: boolean | null
          progress_reminders?: boolean | null
          updated_at?: string
          user_id?: string
          weekly_digest?: boolean | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          is_read: boolean
          message: string | null
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean
          message?: string | null
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean
          message?: string | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          completed_at: string | null
          course_id: string | null
          created_at: string
          currency: string
          id: string
          metadata: Json | null
          payment_method: string | null
          status: string
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          subscription_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          completed_at?: string | null
          course_id?: string | null
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          subscription_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          completed_at?: string | null
          course_id?: string | null
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          subscription_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_logs: {
        Row: {
          created_at: string
          duration_ms: number | null
          event_type: string
          id: string
          metadata: Json | null
          path: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          duration_ms?: number | null
          event_type: string
          id?: string
          metadata?: Json | null
          path?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          duration_ms?: number | null
          event_type?: string
          id?: string
          metadata?: Json | null
          path?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profile_access_logs: {
        Row: {
          access_type: string
          accessed_at: string
          accessed_by: string
          id: string
          ip_address: string | null
          profile_user_id: string
          user_agent: string | null
        }
        Insert: {
          access_type?: string
          accessed_at?: string
          accessed_by: string
          id?: string
          ip_address?: string | null
          profile_user_id: string
          user_agent?: string | null
        }
        Update: {
          access_type?: string
          accessed_at?: string
          accessed_by?: string
          id?: string
          ip_address?: string | null
          profile_user_id?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          cima_end_date: string | null
          cima_id: string | null
          cima_start_date: string | null
          created_at: string
          first_name: string | null
          full_name: string | null
          id: string
          last_name: string | null
          onboarding_completed: boolean | null
          siebel_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          cima_end_date?: string | null
          cima_id?: string | null
          cima_start_date?: string | null
          created_at?: string
          first_name?: string | null
          full_name?: string | null
          id?: string
          last_name?: string | null
          onboarding_completed?: boolean | null
          siebel_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          cima_end_date?: string | null
          cima_id?: string | null
          cima_start_date?: string | null
          created_at?: string
          first_name?: string | null
          full_name?: string | null
          id?: string
          last_name?: string | null
          onboarding_completed?: boolean | null
          siebel_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      question_tags: {
        Row: {
          question_id: string
          tag_id: string
        }
        Insert: {
          question_id: string
          tag_id: string
        }
        Update: {
          question_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_tags_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "quiz_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_attempts: {
        Row: {
          attempted_at: string
          course_id: string
          focus_violations: number | null
          id: string
          max_score: number
          passed: boolean | null
          quiz_id: string | null
          score: number
          section_scores: Json | null
          time_taken_seconds: number | null
          user_id: string
        }
        Insert: {
          attempted_at?: string
          course_id: string
          focus_violations?: number | null
          id?: string
          max_score: number
          passed?: boolean | null
          quiz_id?: string | null
          score: number
          section_scores?: Json | null
          time_taken_seconds?: number | null
          user_id: string
        }
        Update: {
          attempted_at?: string
          course_id?: string
          focus_violations?: number | null
          id?: string
          max_score?: number
          passed?: boolean | null
          quiz_id?: string | null
          score?: number
          section_scores?: Json | null
          time_taken_seconds?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          correct_answer: number
          correct_answers: number[] | null
          created_at: string
          deleted_at: string | null
          difficulty_level: string | null
          drag_items: Json | null
          drag_targets: Json | null
          explanation: string | null
          hotspot_regions: Json | null
          id: string
          image_url: string | null
          is_practice_pool: boolean | null
          number_answer: number | null
          number_tolerance: number | null
          options: Json
          order_index: number
          question: string
          question_type: string
          quiz_id: string
          syllabus_area_index: number | null
          times_correct: number | null
          times_shown: number | null
        }
        Insert: {
          correct_answer: number
          correct_answers?: number[] | null
          created_at?: string
          deleted_at?: string | null
          difficulty_level?: string | null
          drag_items?: Json | null
          drag_targets?: Json | null
          explanation?: string | null
          hotspot_regions?: Json | null
          id?: string
          image_url?: string | null
          is_practice_pool?: boolean | null
          number_answer?: number | null
          number_tolerance?: number | null
          options?: Json
          order_index?: number
          question: string
          question_type?: string
          quiz_id: string
          syllabus_area_index?: number | null
          times_correct?: number | null
          times_shown?: number | null
        }
        Update: {
          correct_answer?: number
          correct_answers?: number[] | null
          created_at?: string
          deleted_at?: string | null
          difficulty_level?: string | null
          drag_items?: Json | null
          drag_targets?: Json | null
          explanation?: string | null
          hotspot_regions?: Json | null
          id?: string
          image_url?: string | null
          is_practice_pool?: boolean | null
          number_answer?: number | null
          number_tolerance?: number | null
          options?: Json
          order_index?: number
          question?: string
          question_type?: string
          quiz_id?: string
          syllabus_area_index?: number | null
          times_correct?: number | null
          times_shown?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          course_id: string
          created_at: string
          description: string | null
          id: string
          lesson_id: string | null
          order_index: number
          quiz_type: string
          title: string
        }
        Insert: {
          course_id: string
          created_at?: string
          description?: string | null
          id?: string
          lesson_id?: string | null
          order_index?: number
          quiz_type?: string
          title: string
        }
        Update: {
          course_id?: string
          created_at?: string
          description?: string | null
          id?: string
          lesson_id?: string | null
          order_index?: number
          quiz_type?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quizzes_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limits: {
        Row: {
          action_type: string
          created_at: string
          id: string
          request_count: number
          user_id: string
          window_start: string
        }
        Insert: {
          action_type: string
          created_at?: string
          id?: string
          request_count?: number
          user_id: string
          window_start?: string
        }
        Update: {
          action_type?: string
          created_at?: string
          id?: string
          request_count?: number
          user_id?: string
          window_start?: string
        }
        Relationships: []
      }
      referral_codes: {
        Row: {
          code: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      referral_rewards: {
        Row: {
          created_at: string
          description: string | null
          id: string
          referral_id: string
          reward_type: string
          reward_value: number
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          referral_id: string
          reward_type?: string
          reward_value?: number
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          referral_id?: string
          reward_type?: string
          reward_value?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_rewards_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          referred_id: string
          referrer_id: string
          reward_claimed: boolean
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          referred_id: string
          referrer_id: string
          reward_claimed?: boolean
          status?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          referred_id?: string
          referrer_id?: string
          reward_claimed?: boolean
          status?: string
        }
        Relationships: []
      }
      site_images: {
        Row: {
          id: string
          image_url: string
          key: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          image_url: string
          key: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          image_url?: string
          key?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          updated_by: string | null
          value: string
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          updated_by?: string | null
          value: string
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: string
        }
        Relationships: []
      }
      student_activity_log: {
        Row: {
          activity_type: string
          course_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          activity_type: string
          course_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          activity_type?: string
          course_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_activity_log_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      study_goals: {
        Row: {
          actual_minutes: number | null
          completed: boolean | null
          created_at: string | null
          date: string
          id: string
          lessons_completed: Json | null
          lessons_target: Json | null
          plan_id: string | null
          target_minutes: number
        }
        Insert: {
          actual_minutes?: number | null
          completed?: boolean | null
          created_at?: string | null
          date: string
          id?: string
          lessons_completed?: Json | null
          lessons_target?: Json | null
          plan_id?: string | null
          target_minutes: number
        }
        Update: {
          actual_minutes?: number | null
          completed?: boolean | null
          created_at?: string | null
          date?: string
          id?: string
          lessons_completed?: Json | null
          lessons_target?: Json | null
          plan_id?: string | null
          target_minutes?: number
        }
        Relationships: [
          {
            foreignKeyName: "study_goals_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "study_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      study_plans: {
        Row: {
          course_id: string | null
          created_at: string | null
          exam_date: string
          id: string
          is_active: boolean | null
          target_study_hours_per_week: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          course_id?: string | null
          created_at?: string | null
          exam_date: string
          id?: string
          is_active?: boolean | null
          target_study_hours_per_week?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          course_id?: string | null
          created_at?: string | null
          exam_date?: string
          id?: string
          is_active?: boolean | null
          target_study_hours_per_week?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_plans_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      study_sessions: {
        Row: {
          course_id: string | null
          duration_minutes: number
          ended_at: string | null
          id: string
          started_at: string
          user_id: string
        }
        Insert: {
          course_id?: string | null
          duration_minutes?: number
          ended_at?: string | null
          id?: string
          started_at?: string
          user_id: string
        }
        Update: {
          course_id?: string | null
          duration_minutes?: number
          ended_at?: string | null
          id?: string
          started_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_sessions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancelled_at: string | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          trial_ends_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cancelled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_ends_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cancelled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_ends_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tags: {
        Row: {
          category: string | null
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      usage_metrics: {
        Row: {
          count: number
          created_at: string
          date: string
          id: string
          metadata: Json | null
          metric_type: string
        }
        Insert: {
          count?: number
          created_at?: string
          date?: string
          id?: string
          metadata?: Json | null
          metric_type: string
        }
        Update: {
          count?: number
          created_at?: string
          date?: string
          id?: string
          metadata?: Json | null
          metric_type?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_learning_paths: {
        Row: {
          completed_at: string | null
          id: string
          path_id: string
          started_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          path_id: string
          started_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          path_id?: string
          started_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_learning_paths_path_id_fkey"
            columns: ["path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
        ]
      }
      user_question_attempts: {
        Row: {
          attempted_at: string
          course_id: string
          id: string
          is_correct: boolean
          question_id: string
          syllabus_area_index: number | null
          time_taken_seconds: number | null
          user_answer: Json | null
          user_id: string
        }
        Insert: {
          attempted_at?: string
          course_id: string
          id?: string
          is_correct: boolean
          question_id: string
          syllabus_area_index?: number | null
          time_taken_seconds?: number | null
          user_answer?: Json | null
          user_id: string
        }
        Update: {
          attempted_at?: string
          course_id?: string
          id?: string
          is_correct?: boolean
          question_id?: string
          syllabus_area_index?: number | null
          time_taken_seconds?: number | null
          user_answer?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_question_attempts_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "quiz_questions"
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
      user_streaks: {
        Row: {
          current_streak: number | null
          id: string
          last_activity_date: string | null
          longest_streak: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          current_streak?: number | null
          id?: string
          last_activity_date?: string | null
          longest_streak?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          current_streak?: number | null
          id?: string
          last_activity_date?: string | null
          longest_streak?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_syllabus_mastery: {
        Row: {
          course_id: string
          created_at: string
          id: string
          last_attempted_at: string | null
          mastery_score: number | null
          questions_attempted: number | null
          questions_correct: number | null
          syllabus_area_index: number
          syllabus_area_title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          last_attempted_at?: string | null
          mastery_score?: number | null
          questions_attempted?: number | null
          questions_correct?: number | null
          syllabus_area_index: number
          syllabus_area_title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          last_attempted_at?: string | null
          mastery_score?: number | null
          questions_attempted?: number | null
          questions_correct?: number | null
          syllabus_area_index?: number
          syllabus_area_title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      video_progress: {
        Row: {
          completed: boolean
          created_at: string
          duration_seconds: number
          id: string
          lesson_id: string
          progress_seconds: number
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          duration_seconds?: number
          id?: string
          lesson_id: string
          progress_seconds?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          duration_seconds?: number
          id?: string
          lesson_id?: string
          progress_seconds?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      visitor_snapshots: {
        Row: {
          id: string
          recorded_at: string
          user_count: number
          visitor_count: number
        }
        Insert: {
          id?: string
          recorded_at?: string
          user_count?: number
          visitor_count?: number
        }
        Update: {
          id?: string
          recorded_at?: string
          user_count?: number
          visitor_count?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      apply_referral_code: {
        Args: { p_code: string; p_referred_id: string }
        Returns: Json
      }
      check_rate_limit: {
        Args: {
          p_action_type: string
          p_max_per_hour?: number
          p_max_per_minute?: number
          p_user_id: string
        }
        Returns: Json
      }
      cleanup_rate_limits: { Args: never; Returns: undefined }
      complete_referral: { Args: { p_referred_id: string }; Returns: Json }
      generate_referral_code: { Args: never; Returns: string }
      get_adaptive_practice_questions: {
        Args: { p_count?: number; p_course_id: string }
        Returns: {
          difficulty_level: string
          drag_items: Json
          drag_targets: Json
          hotspot_regions: Json
          id: string
          image_url: string
          options: Json
          question: string
          question_type: string
          quiz_id: string
          syllabus_area_index: number
        }[]
      }
      get_admin_dashboard_stats: { Args: never; Returns: Json }
      get_or_create_referral_code: {
        Args: { p_user_id: string }
        Returns: string
      }
      get_platform_analytics: { Args: never; Returns: Json }
      get_quiz_questions: {
        Args: { _quiz_id: string }
        Returns: {
          correct_answer: number
          created_at: string
          explanation: string
          id: string
          options: Json
          order_index: number
          question: string
          quiz_id: string
        }[]
      }
      get_referral_stats: { Args: { p_user_id: string }; Returns: Json }
      get_user_profile_with_audit: {
        Args: { p_user_id: string }
        Returns: {
          avatar_url: string
          cima_end_date: string
          cima_id: string
          cima_start_date: string
          created_at: string
          first_name: string
          full_name: string
          id: string
          last_name: string
          updated_at: string
          user_id: string
        }[]
      }
      get_mock_exam_result: {
        Args: { _attempt_id: string }
        Returns: {
          attempt_id: string
          score: number
          max_score: number
          percentage: number
          passed: boolean
          passing_pct: number
          time_taken: number
          attempted_at: string
        }[]
      }
      has_attempted_quiz: {
        Args: { _quiz_id: string; _user_id: string }
        Returns: boolean
      }
      has_course_access: {
        Args: { _course_id: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_master_admin: { Args: { _user_id: string }; Returns: boolean }
      log_profile_access: {
        Args: { p_access_type?: string; p_profile_user_id: string }
        Returns: undefined
      }
      soft_delete_course: {
        Args: { _course_id: string }
        Returns: undefined
      }
      soft_delete_lesson: {
        Args: { _lesson_id: string }
        Returns: undefined
      }
      update_syllabus_mastery: {
        Args: {
          p_course_id: string
          p_is_correct: boolean
          p_syllabus_area_index: number
          p_syllabus_area_title: string
          p_user_id: string
        }
        Returns: undefined
      }
      user_meets_prerequisites: {
        Args: { _course_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user" | "master_admin"
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
      app_role: ["admin", "user", "master_admin"],
    },
  },
} as const
