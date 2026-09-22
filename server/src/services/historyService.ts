import { supabase, type SavedTranslationRecord, type UserHistoryRecord } from '../database/supabase.js';
import { getPublicVideoUrl } from './storageService.js';

function withVideoUrl<T extends { translation?: { video_path: string } }>(record: T): T & { videoUrl?: string } {
  return record.translation
    ? { ...record, videoUrl: getPublicVideoUrl(record.translation.video_path) }
    : record;
}

function requireText(value: string, field: string): string {
  const normalized = value.trim();
  if (!normalized) throw new Error(`${field} is required`);
  return normalized;
}

export async function recordHistory(userId: string, translationId: string): Promise<UserHistoryRecord> {
  const { data, error } = await supabase
    .from('user_history')
    .insert({ user_id: requireText(userId, 'userId'), translation_id: requireText(translationId, 'translationId') } as never)
    .select('*, translation:translations(*)')
    .single();
  if (error || !data) throw new Error(`Could not record history: ${error?.message ?? 'no record returned'}`);
  return data as unknown as UserHistoryRecord;
}

export async function getHistory(userId: string, limit = 50): Promise<UserHistoryRecord[]> {
  const { data, error } = await supabase
    .from('user_history')
    .select('*, translation:translations(*)')
    .eq('user_id', requireText(userId, 'userId'))
    .order('viewed_at', { ascending: false })
    .limit(Math.min(Math.max(limit, 1), 100));
  if (error) throw new Error(`Could not load history: ${error.message}`);
  return (data ?? []).map((record) => withVideoUrl(record as unknown as UserHistoryRecord)) as UserHistoryRecord[];
}

export async function saveTranslation(userId: string, translationId: string): Promise<SavedTranslationRecord> {
  const { data, error } = await supabase
    .from('saved_translations')
    .upsert({ user_id: requireText(userId, 'userId'), translation_id: requireText(translationId, 'translationId') } as never, { onConflict: 'user_id,translation_id' })
    .select('*, translation:translations(*)')
    .single();
  if (error || !data) throw new Error(`Could not save translation: ${error?.message ?? 'no record returned'}`);
  return data as unknown as SavedTranslationRecord;
}

export async function getSavedTranslations(userId: string): Promise<SavedTranslationRecord[]> {
  const { data, error } = await supabase
    .from('saved_translations')
    .select('*, translation:translations(*)')
    .eq('user_id', requireText(userId, 'userId'))
    .order('created_at', { ascending: false });
  if (error) throw new Error(`Could not load saved translations: ${error.message}`);
  return (data ?? []).map((record) => withVideoUrl(record as unknown as SavedTranslationRecord)) as SavedTranslationRecord[];
}

export async function removeSavedTranslation(id: string): Promise<void> {
  const { error } = await supabase.from('saved_translations').delete().eq('id', requireText(id, 'id'));
  if (error) throw new Error(`Could not remove saved translation: ${error.message}`);
}