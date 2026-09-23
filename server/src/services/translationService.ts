import { supabase, type TranslationRecord } from '../database/supabase.js';
import {
  CONCURRENCY_POLL_INTERVAL_MS,
  CURRENT_PROMPT_VERSION,
  MAX_CONCURRENCY_WAIT_SECONDS,
} from '../config/constants.js';
import { extractISLGloss, generateSigningVideo } from './geminiService.js';
import { getPublicVideoUrl, uploadTranslationVideo, videoExists } from './storageService.js';
import { normalizeInput } from '../utils/normalizeText.js';
import { buildVeoVideoPrompt } from '../utils/promptBuilder.js';
import { AssetNotFoundError, DomainError } from '../utils/errors.js';

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
  if (!data) return null;
  const record = data as unknown as TranslationRecord;
  if (!(await videoExists(record.video_path))) {
    throw new AssetNotFoundError(`The translation video for ${record.input_text} is missing from Storage.`);
  }
  return toCompletedPayload(record, true);
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

async function findPreSavedSign(normalizedText: string): Promise<{ word: string; video_path: string } | null> {
  const exact = await supabase
    .from('signs')
    .select('word, video_path')
    .eq('word', normalizedText)
    .limit(1)
    .maybeSingle();
  if (exact.error) throw new Error(`Pre-saved sign lookup failed: ${exact.error.message}`);
  if (exact.data) return exact.data as unknown as { word: string; video_path: string };

  const alias = await supabase
    .from('sign_aliases')
    .select('sign_id')
    .eq('alias', normalizedText)
    .limit(1)
    .maybeSingle();
  if (alias.error) throw new Error(`Pre-saved alias lookup failed: ${alias.error.message}`);
  if (!alias.data) return null;

  const sign = await supabase
    .from('signs')
    .select('word, video_path')
    .eq('id', (alias.data as unknown as { sign_id: string }).sign_id)
    .maybeSingle();
  if (sign.error) throw new Error(`Aliased sign lookup failed: ${sign.error.message}`);
  return sign.data as unknown as { word: string; video_path: string } | null;
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

  // Use an uploaded, verified catalog video before spending a Gemini/Veo call.
  const preSavedSign = await findPreSavedSign(normalized);
  if (preSavedSign) {
    if (!(await videoExists(preSavedSign.video_path))) {
      throw new AssetNotFoundError(`The pre-saved video for ${preSavedSign.word} is missing from Storage.`);
    }
    const { data: savedData, error: savedError } = await supabase
      .from('translations')
      .insert({
        input_text: inputText,
        normalized_text: normalized,
        language,
        prompt_version: CURRENT_PROMPT_VERSION,
        video_path: preSavedSign.video_path,
        status: 'completed',
        sign_sequence: preSavedSign.word.split(/\s+/u),
        error_message: null,
      } as never)
      .select('*')
      .single();
    const savedRecord = savedData as unknown as TranslationRecord | null;
    if (!savedError && savedRecord) return toCompletedPayload(savedRecord, false);
    if (savedError?.code !== '23505') {
      throw new Error(`Could not cache pre-saved translation: ${savedError?.message ?? 'no record returned'}`);
    }
    const existingSaved = await findCachedTranslation(normalized, language);
    if (existingSaved) return existingSaved;
  }

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
