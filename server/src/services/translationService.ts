import { supabase, type TranslationRecord } from '../database/supabase.js';
import { getPublicVideoUrl } from './storageService.js';

export interface CachedTranslation {
  cached: true;
  translationId: string;
  videoUrl: string;
  signSequence: unknown[];
  inputText: string;
}

export async function findCachedTranslation(
  normalizedText: string,
  language: 'en' | 'ta',
): Promise<CachedTranslation | null> {
  const { data, error } = await supabase
    .from('translations')
    .select('*')
    .eq('normalized_text', normalizedText)
    .eq('language', language)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`Translation cache lookup failed: ${error.message}`);
  if (!data) return null;

  const record = data as TranslationRecord;
  return {
    cached: true,
    translationId: record.id,
    videoUrl: getPublicVideoUrl(record.video_path),
    signSequence: record.sign_sequence,
    inputText: record.input_text,
  };
}

export async function getTranslationHistory(limit: number): Promise<TranslationRecord[]> {
  const { data, error } = await supabase
    .from('translations')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(Math.min(Math.max(limit, 1), 100));
  if (error) throw new Error(`History lookup failed: ${error.message}`);
  return data ?? [];
}
