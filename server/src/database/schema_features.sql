-- Stages 22-24: history, saved translations, and the Learn ISL catalog.

create table if not exists public.user_history (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  translation_id uuid not null references public.translations(id) on delete cascade,
  viewed_at timestamptz not null default now()
);

create index if not exists user_history_user_viewed_idx
  on public.user_history (user_id, viewed_at desc);

create table if not exists public.saved_translations (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  translation_id uuid not null references public.translations(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, translation_id)
);

create index if not exists saved_translations_user_created_idx
  on public.saved_translations (user_id, created_at desc);

create table if not exists public.signs (
  id uuid primary key default gen_random_uuid(),
  word text not null,
  category text not null,
  description text,
  video_path text not null,
  created_at timestamptz not null default now()
);

create index if not exists signs_category_idx on public.signs (category);

insert into public.signs (word, category, description, video_path)
values
  ('HELLO', 'Greetings', 'A friendly greeting.', 'signs/hello.mp4'),
  ('GOOD MORNING', 'Greetings', 'A morning greeting.', 'signs/good-morning.mp4'),
  ('THANK YOU', 'Greetings', 'Express gratitude.', 'signs/thank-you.mp4')
on conflict do nothing;
