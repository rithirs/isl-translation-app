export type TranslationLanguage = 'en' | 'ta';

export function buildISLSequencePrompt(
  text: string,
  language: TranslationLanguage,
): string {
  const languageName = language === 'ta' ? 'Tamil' : 'English';
  return `Translate this ${languageName} input into an Indian Sign Language (ISL) gloss sequence. Preserve the meaning, use concise uppercase gloss tokens, and adapt grammar to natural ISL ordering. Return only a valid JSON string array with no Markdown or explanation. Example: "Good morning" becomes ["GOOD", "MORNING"]. Input: ${JSON.stringify(text)}`;
}

export function buildVeoVideoPrompt(glossTokens: string[]): string {
  const sequence = glossTokens.join(', ');
  return `Generate a clear educational Indian Sign Language signing video for this gloss sequence: ${sequence}. Show one front-facing adult signer from the waist up, signing each token in order with accurate, readable hand and body movements. Use a neutral uncluttered background, even lighting, stable camera, no captions, no text, no music, and no cuts. Return a short vertical MP4 suitable for a mobile learning app.`;
}
