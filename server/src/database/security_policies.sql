-- Stages 28-29: Supabase RLS and Storage policies.
-- The backend uses the service_role key and bypasses RLS. Never ship that key to Expo.

alter table public.translations enable row level security;
alter table public.signs enable row level security;
alter table public.user_history enable row level security;
alter table public.saved_translations enable row level security;

create policy "Completed translations are publicly readable"
  on public.translations for select to anon, authenticated
  using (status = 'completed');

create policy "Signs are publicly readable"
  on public.signs for select to anon, authenticated
  using (true);

-- user_id supports either auth.uid()::text or an anonymous device identifier.
-- Anonymous device IDs should be replaced with authenticated identities when auth is added.
create policy "Users read their own history"
  on public.user_history for select to anon, authenticated
  using (user_id = coalesce(auth.uid()::text, current_setting('request.headers', true)::json->>'x-device-id'));

create policy "Users create their own history"
  on public.user_history for insert to anon, authenticated
  with check (user_id = coalesce(auth.uid()::text, current_setting('request.headers', true)::json->>'x-device-id'));

create policy "Users delete their own history"
  on public.user_history for delete to anon, authenticated
  using (user_id = coalesce(auth.uid()::text, current_setting('request.headers', true)::json->>'x-device-id'));

create policy "Users read their own saved translations"
  on public.saved_translations for select to anon, authenticated
  using (user_id = coalesce(auth.uid()::text, current_setting('request.headers', true)::json->>'x-device-id'));

create policy "Users save their own translations"
  on public.saved_translations for insert to anon, authenticated
  with check (user_id = coalesce(auth.uid()::text, current_setting('request.headers', true)::json->>'x-device-id'));

create policy "Users delete their own saved translations"
  on public.saved_translations for delete to anon, authenticated
  using (user_id = coalesce(auth.uid()::text, current_setting('request.headers', true)::json->>'x-device-id'));

create policy "Public Read Access"
  on storage.objects for select to public
  using (bucket_id = 'isl-videos');

create policy "Service Role Uploads Only"
  on storage.objects for insert to service_role
  with check (bucket_id = 'isl-videos');

create policy "Service Role Updates Only"
  on storage.objects for update to service_role
  using (bucket_id = 'isl-videos')
  with check (bucket_id = 'isl-videos');

create policy "Service Role Deletes Only"
  on storage.objects for delete to service_role
  using (bucket_id = 'isl-videos');
