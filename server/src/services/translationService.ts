import { supabase, type TranslationRecord } from '../database/supabase.js';
import { randomUUID } from 'node:crypto';
import { extractISLGloss, generateSigningVideo } from './geminiService.js';
import { getPublicVideoUrl, uploadTranslationVideo } from './storageService.js';
import { normalizeInput } from '../utils/normalizeText.js';
import { buildVeoVideoPrompt } from '../utils/promptBuilder.js';

export interface CachedTranslation {
  cached: true;
  status: 'completed';
  translationId: string;
  videoUrl: string;
  signSequence: string[];
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
    status: 'completed',
    translationId: record.id,
    videoUrl: getPublicVideoUrl(record.video_path),
    signSequence: Array.isArray(record.sign_sequence)
      ? record.sign_sequence.filter((token): token is string => typeof token === 'string')
      : [],
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

export interface GeneratedTranslation {
  cached: boolean;
  status: 'completed';
  translationId: string;
  videoUrl: string;
  signSequence: string[];
}

export async function handleTranslation(
  rawText: string,
  language: 'en' | 'ta' = 'en',
): Promise<GeneratedTranslation | CachedTranslation> {
  const normalizedText = normalizeInput(rawText);
  if (!normalizedText) throw new Error('Text must not be empty');

  const cached = await findCachedTranslation(normalizedText, language);
  if (cached) return cached;

  const { data: pendingData, error: insertError } = await supabase
    .from('translations')
    .insert({
      input_text: rawText,
      normalized_text: normalizedText,
      language,
      prompt_version: 'v1',
      video_path: '',
      status: 'processing',
      sign_sequence: [],
    } as never)
    .select('*')
    .single();
  const pending = pendingData as unknown as TranslationRecord | null;
  if (insertError || !pending) {
    throw new Error(`Could not create translation job: ${insertError?.message ?? 'no record returned'}`);
  }

  try {
    const glossTokens = await extractISLGloss(rawText, language);
    const veoPrompt = buildVeoVideoPrompt(rawText, glossTokens);
    const videoBuffer = await generateSigningVideo(veoPrompt);
    const uploaded = await uploadTranslationVideo(pending.id, videoBuffer);
    const { data: completed, error: updateError } = await supabase
      .from('translations')
      .update({ status: 'completed', sign_sequence: glossTokens, video_path: uploaded.path } as never)
      .eq('id', pending.id)
      .select('*')
      .single();
    const completedRecord = completed as unknown as TranslationRecord | null;
    if (updateError || !completedRecord) {
      throw new Error(`Could not finalize translation: ${updateError?.message ?? 'no record returned'}`);
    }
    return {
      cached: false,
      status: 'completed',
      translationId: completedRecord.id,
      videoUrl: uploaded.publicUrl,
      signSequence: glossTokens,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown generation failure';
    await supabase.from('translations').update({ status: 'failed' } as never).eq('id', pending.id);
    console.error(`Translation ${pending.id} failed: ${message}`);
    throw new Error(`Translation generation failed: ${message}`);
  }
}

export const translateTextToISL = handleTranslation;
