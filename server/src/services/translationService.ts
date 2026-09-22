import { supabase, type TranslationRecord } from '../database/supabase.js';
import {
  CONCURRENCY_POLL_INTERVAL_MS,
  CURRENT_PROMPT_VERSION,
  MAX_CONCURRENCY_WAIT_SECONDS,
} from '../config/constants.js';
import { extractISLGloss, generateSigningVideo } from './geminiService.js';
import { getPublicVideoUrl, uploadTranslationVideo } from './storageService.js';
import { normalizeInput } from '../utils/normalizeText.js';
import { buildVeoVideoPrompt } from '../utils/promptBuilder.js';
import { DomainError } from '../utils/errors.js';

export interface TranslationPayload {
  cached: boolean;
  status: 'completed';
  translationId: string;
  videoUrl: string;
  signSequence: string[];
}

export class TranslationWaitTimeoutError extends DomainError {
  constructor() {
    super('GENERATION_FAILED', 504, 'Translation is still generating. Please retry shortly.');
  }
}

export class TranslationGenerationFailedError extends DomainError {
  constructor(message: string) {
    super('GENERATION_FAILED', 502, `We couldn't generate the ISL video. Please try again. (${message})`);
  }
}

function asStringSequence(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((token): token is string => typeof token === 'string')
    : [];
}

function toCompletedPayload(record: TranslationRecord, cached: boolean): TranslationPayload {
  return {
    cached,
    status: 'completed',
    translationId: record.id,
    videoUrl: getPublicVideoUrl(record.video_path),
    signSequence: asStringSequence(record.sign_sequence),
  };
}

export async function findCachedTranslation(
  normalizedText: string,
  language: 'en' | 'ta',
): Promise<TranslationPayload | null> {
  const { data, error } = await supabase
    .from('translations')
    .select('*')
    .eq('normalized_text', normalizedText)
    .eq('language', language)
    .eq('prompt_version', CURRENT_PROMPT_VERSION)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`Translation cache lookup failed: ${error.message}`);
  return data ? toCompletedPayload(data as unknown as TranslationRecord, true) : null;
}

async function findInFlightTranslation(
  normalizedText: string,
  language: 'en' | 'ta',
): Promise<TranslationRecord | null> {
  const { data, error } = await supabase
    .from('translations')
    .select('*')
    .eq('normalized_text', normalizedText)
    .eq('language', language)
    .eq('prompt_version', CURRENT_PROMPT_VERSION)
    .in('status', ['pending', 'generating'])
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`In-flight translation lookup failed: ${error.message}`);
  return data as unknown as TranslationRecord | null;
}

function sleep(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export async function waitForCompletion(recordId: string): Promise<TranslationPayload> {
  const deadline = Date.now() + MAX_CONCURRENCY_WAIT_SECONDS * 1000;
  while (Date.now() < deadline) {
    const { data, error } = await supabase
      .from('translations')
      .select('*')
      .eq('id', recordId)
      .maybeSingle();
    if (error) throw new Error(`Translation status lookup failed: ${error.message}`);

    const record = data as unknown as TranslationRecord | null;
    if (record?.status === 'completed') return toCompletedPayload(record, true);
    if (record?.status === 'failed') {
      throw new TranslationGenerationFailedError(record.error_message ?? 'The generation job failed');
    }
    await sleep(CONCURRENCY_POLL_INTERVAL_MS);
  }
  throw new TranslationWaitTimeoutError();
}

export async function getTranslationHistory(limit: number): Promise<TranslationRecord[]> {
  const { data, error } = await supabase
    .from('translations')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(Math.min(Math.max(limit, 1), 100));
  if (error) throw new Error(`History lookup failed: ${error.message}`);
  return (data ?? []) as unknown as TranslationRecord[];
}

export async function getOrCreateTranslation(
  inputText: string,
  language: 'en' | 'ta' = 'en',
): Promise<TranslationPayload> {
  const normalized = normalizeInput(inputText);
  if (!normalized) throw new Error('Text must not be empty');

  const cached = await findCachedTranslation(normalized, language);
  if (cached) return cached;

  const existing = await findInFlightTranslation(normalized, language);
  if (existing) return waitForCompletion(existing.id);

  const { data: insertedData, error: insertError } = await supabase
    .from('translations')
    .insert({
      input_text: inputText,
      normalized_text: normalized,
      language,
      prompt_version: CURRENT_PROMPT_VERSION,
      video_path: '',
      status: 'generating',
      sign_sequence: [],
    } as never)
    .select('*')
    .single();
  const record = insertedData as unknown as TranslationRecord | null;

  if (insertError || !record) {
    if (insertError?.code === '23505') {
      const racedRecord = await findInFlightTranslation(normalized, language);
      if (racedRecord) return waitForCompletion(racedRecord.id);
      const racedCache = await findCachedTranslation(normalized, language);
      if (racedCache) return racedCache;
    }
    throw new Error(`Could not acquire translation generation lock: ${insertError?.message ?? 'no record returned'}`);
  }

  try {
    const glossTokens = await extractISLGloss(normalized, language);
    const veoPrompt = buildVeoVideoPrompt(inputText, glossTokens);
    const videoBuffer = await generateSigningVideo(veoPrompt);
    const uploaded = await uploadTranslationVideo(record.id, videoBuffer);
    const { data: completedData, error: updateError } = await supabase
      .from('translations')
      .update({
        status: 'completed',
        sign_sequence: glossTokens,
        video_path: uploaded.path,
        error_message: null,
      } as never)
      .eq('id', record.id)
      .select('*')
      .single();
    const completed = completedData as unknown as TranslationRecord | null;
    if (updateError || !completed) {
      throw new Error(`Could not finalize translation: ${updateError?.message ?? 'no record returned'}`);
    }
    return {
      ...toCompletedPayload(completed, false),
      videoUrl: uploaded.publicUrl,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown generation failure';
    const { error: failureUpdateError } = await supabase
      .from('translations')
      .update({ status: 'failed', error_message: message } as never)
      .eq('id', record.id);
    if (failureUpdateError) {
      console.error(`Could not mark translation ${record.id} as failed: ${failureUpdateError.message}`);
    }
    console.error(`Translation ${record.id} failed: ${message}`);
    throw new TranslationGenerationFailedError(message);
  }
}

export const handleTranslation = getOrCreateTranslation;
export const translateTextToISL = getOrCreateTranslation;
