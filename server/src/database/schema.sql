-- ISL Translator persistence schema
create extension if not exists pgcrypto;

create table if not exists public.translations (
  id uuid primary key default gen_random_uuid(),
  input_text text not null,
  normalized_text text not null,
  language text not null default 'en' check (language in ('en', 'ta')),
  prompt_version text not null default 'v1',
  video_path text not null,
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  sign_sequence jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists translations_cache_lookup_idx
  on public.translations (normalized_text, language, status);

create index if not exists translations_created_at_idx
  on public.translations (created_at desc);

-- Create this bucket as public in the Supabase dashboard or with the Storage API.
-- The API service uses the service-role key for uploads and public URL lookup.
