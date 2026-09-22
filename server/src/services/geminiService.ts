import { GoogleGenAI } from '@google/genai';
import { buildISLSequencePrompt, buildVeoVideoPrompt, type TranslationLanguage } from '../utils/promptBuilder.js';

const apiKey: string = process.env.GEMINI_API_KEY ?? (() => {
  throw new Error('Missing required environment variable: GEMINI_API_KEY');
})();

const genAI = new GoogleGenAI({ apiKey });
const GLOSS_MODEL = 'gemini-2.5-flash';
const VIDEO_MODEL = 'veo-3.1-generate-preview';

export async function generateISLGloss(
  inputText: string,
  lang: TranslationLanguage,
): Promise<string[]> {
  const response = await genAI.models.generateContent({
    model: GLOSS_MODEL,
    contents: buildISLSequencePrompt(inputText, lang),
    config: { responseMimeType: 'application/json' },
  });

  const raw = response.text?.trim();
  if (!raw) throw new Error('Gemini returned an empty gloss sequence');

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('Gemini returned invalid gloss JSON');
  }
  if (!Array.isArray(parsed) || !parsed.every((token): token is string => typeof token === 'string')) {
    throw new Error('Gemini gloss response was not a string array');
  }
  const tokens = parsed.map((token) => token.trim().toUpperCase()).filter(Boolean);
  if (tokens.length === 0) throw new Error('Gemini returned no gloss tokens');
  return tokens;
}

export async function generateSigningVideo(glossTokens: string[]): Promise<Buffer> {
  let operation = await genAI.models.generateVideos({
    model: VIDEO_MODEL,
    prompt: buildVeoVideoPrompt(glossTokens),
    config: { numberOfVideos: 1, aspectRatio: '9:16' },
  });

  while (!operation.done) {
    await new Promise((resolve) => setTimeout(resolve, 5000));
    operation = await genAI.operations.getVideosOperation({ operation });
  }

  const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!videoUri) throw new Error('Veo did not return a generated video URI');

  const videoResponse = await fetch(`${videoUri}&key=${encodeURIComponent(apiKey)}`);
  if (!videoResponse.ok) throw new Error(`Video download failed with HTTP ${videoResponse.status}`);
  return Buffer.from(await videoResponse.arrayBuffer());
}
