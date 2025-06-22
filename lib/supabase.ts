import { createClientComponentClient, createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export const createClient = () => createClientComponentClient()

export const createServerClient = () => createServerComponentClient({ cookies })

// Database types
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          user_id: string
          title: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          role: "user" | "assistant"
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          role: "user" | "assistant"
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          role?: "user" | "assistant"
          content?: string
          created_at?: string
        }
      }
      Advisor: {
        Row: {
          id: number // Auto-incrementing primary key
          created_at: string
          content_saved: string | null
          user_id: string
        }
        Insert: {
          id?: never // Auto-increment, so never specify on insert
          created_at?: string
          content_saved?: string | null
          user_id: string
        }
        Update: {
          id?: never // Primary key shouldn't be updated
          created_at?: string
          content_saved?: string | null
          user_id?: string
        }
      }
    }
  }
}
