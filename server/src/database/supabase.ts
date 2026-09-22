import { createClient } from '@supabase/supabase-js';

export interface TranslationRecord {
  id: string;
  input_text: string;
  normalized_text: string;
  language: 'en' | 'ta';
  prompt_version: string;
  video_path: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  sign_sequence: unknown[];
  created_at: string;
}

interface Database {
  public: {
    Tables: {
      translations: {
        Row: TranslationRecord;
        Insert: Omit<TranslationRecord, 'id' | 'created_at'> &
          Partial<Pick<TranslationRecord, 'id' | 'created_at'>>;
        Update: Partial<TranslationRecord>;
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
