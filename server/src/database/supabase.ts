import { createClient } from '@supabase/supabase-js';

type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type TranslationStatus = 'pending' | 'generating' | 'completed' | 'failed';

export interface TranslationRecord {
  id: string;
  input_text: string;
  normalized_text: string;
  language: 'en' | 'ta';
  prompt_version: string;
  video_path: string;
  status: TranslationStatus;
  error_message: string | null;
  sign_sequence: Json;
  created_at: string;
}

export interface UserHistoryRecord {
  id: string;
  user_id: string;
  translation_id: string;
  viewed_at: string;
  translation?: TranslationRecord;
}

export interface SavedTranslationRecord {
  id: string;
  user_id: string;
  translation_id: string;
  created_at: string;
  translation?: TranslationRecord;
}

export interface SignRecord {
  id: string;
  word: string;
  category: string;
  description: string | null;
  video_path: string;
  created_at: string;
}

interface Database {
  public: {
    Tables: {
      translations: {
        Row: TranslationRecord;
        Insert: Omit<TranslationRecord, 'id' | 'created_at' | 'error_message'> &
          Partial<Pick<TranslationRecord, 'error_message'>> &
          Partial<Pick<TranslationRecord, 'id' | 'created_at'>>;
        Update: Partial<TranslationRecord>;
        Relationships: [];
      };
      user_history: {
        Row: UserHistoryRecord;
        Insert: Omit<UserHistoryRecord, 'id' | 'viewed_at' | 'translation'>;
        Update: Partial<UserHistoryRecord>;
        Relationships: [];
      };
      saved_translations: {
        Row: SavedTranslationRecord;
        Insert: Omit<SavedTranslationRecord, 'id' | 'created_at' | 'translation'>;
        Update: Partial<SavedTranslationRecord>;
        Relationships: [];
      };
      signs: {
        Row: SignRecord;
        Insert: Omit<SignRecord, 'id' | 'created_at'>;
        Update: Partial<SignRecord>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

function requiredEnvironment(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

/** Server-side Supabase client. The service-role key must never be exposed to clients. */
export const supabase = createClient<Database>(
  requiredEnvironment('SUPABASE_URL'),
  requiredEnvironment('SUPABASE_SERVICE_ROLE_KEY'),
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);
