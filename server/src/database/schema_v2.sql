-- Stage 19-21 migration for prompt versioning, lifecycle state, and deduplication.

alter table public.translations
  add column if not exists error_message text;

-- Existing exports used `processing`; migrate those rows before tightening the lifecycle.
update public.translations
set status = 'failed',
    error_message = coalesce(error_message, 'Migrated from legacy processing state')
where status = 'processing';

alter table public.translations
  drop constraint if exists translations_status_check;

alter table public.translations
  drop constraint if exists valid_status;

alter table public.translations
  add constraint valid_status
  check (status in ('pending', 'generating', 'completed', 'failed'));

create unique index if not exists idx_unique_active_translation
  on public.translations (normalized_text, language, prompt_version)
  where status in ('pending', 'generating', 'completed');

create index if not exists translations_version_cache_lookup_idx
  on public.translations (normalized_text, language, prompt_version, status);
