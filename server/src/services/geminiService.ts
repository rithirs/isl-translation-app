import { GoogleGenAI } from '@google/genai';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildISLGlossSystemPrompt, type TranslationLanguage } from '../utils/promptBuilder.js';

const apiKey: string = process.env.GEMINI_API_KEY ?? (() => {
  throw new Error('Missing required environment variable: GEMINI_API_KEY');
})();

const genAI = new GoogleGenAI({ apiKey });
const GLOSS_MODEL = 'gemini-2.5-flash';
const VIDEO_MODEL = 'veo-2.0-generate-001';

export async function extractISLGloss(
  inputText: string,
  language: TranslationLanguage,
): Promise<string[]> {
  const response = await genAI.models.generateContent({
    model: GLOSS_MODEL,
    contents: buildISLGlossSystemPrompt(inputText, language),
    config: { responseMimeType: 'application/json' },
  });

  const raw = response.text?.trim();
  if (!raw) return inputText.split(/\s+/u).map((word) => word.toUpperCase());

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return inputText.split(/\s+/u).map((word) => word.toUpperCase());
  }
  const tokens = parsed && typeof parsed === 'object' && 'glossTokens' in parsed
    ? (parsed as { glossTokens?: unknown }).glossTokens
    : undefined;
  if (Array.isArray(tokens)) {
    const normalized = tokens.filter((token): token is string => typeof token === 'string')
      .map((token) => token.trim().toUpperCase()).filter(Boolean);
    if (normalized.length > 0) return normalized;
  }
  return inputText.split(/\s+/u).map((word) => word.toUpperCase());
}

export async function generateSigningVideo(promptText: string): Promise<Buffer> {
  let operation = await genAI.models.generateVideos({
    model: VIDEO_MODEL,
    prompt: promptText,
    config: {
      numberOfVideos: 1,
      aspectRatio: '9:16',
      durationSeconds: 5,
      personGeneration: 'allow_adult',
    },
  });

  for (let attempt = 0; attempt < 18 && !operation.done; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 10_000));
    operation = await genAI.operations.getVideosOperation({ operation });
  }
  if (!operation.done) throw new Error('Veo video generation timed out after 180 seconds');
  if (operation.error) throw new Error(`Veo video generation failed: ${JSON.stringify(operation.error)}`);

  const video = operation.response?.generatedVideos?.[0]?.video;
  if (!video) throw new Error('Veo did not return a generated video');
  if (video.videoBytes) return Buffer.from(video.videoBytes, 'base64');
  if (!video.uri) throw new Error('Veo did not return a downloadable video URI');

  const temporaryDirectory = await mkdtemp(join(tmpdir(), 'isl-video-'));
  const downloadPath = join(temporaryDirectory, 'generated.mp4');
  try {
    await genAI.files.download({ file: video, downloadPath });
    return await readFile(downloadPath);
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
}

export const generateISLGloss = extractISLGloss;
