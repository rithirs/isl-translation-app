export type TranslationLanguage = 'en' | 'ta';

export function buildISLGlossSystemPrompt(
  text: string,
  language: TranslationLanguage,
): string {
  const languageName = language === 'ta' ? 'Tamil' : 'English';
  return `Act as a certified Indian Sign Language (ISL) linguist. Translate this ${languageName} phrase into a normalized ISL gloss sequence. Use natural ISL Topic-Comment grammar, omit English or Tamil auxiliary verbs and copulas such as "is" and "are", and prefer concise root vocabulary. Preserve the intended meaning while avoiding invented or decorative signs.

Return only valid JSON matching this exact shape: {"glossTokens":["STRING"],"explanation":"STRING"}. glossTokens must be an uppercase string array in signing order. The explanation must be concise and describe the grammar choice. Input phrase: ${JSON.stringify(text)}`;
}

export function buildVeoVideoPrompt(inputText: string, glossTokens: string[]): string {
  return `Create a short, high-clarity educational Indian Sign Language (ISL) demonstration video.

Purpose:
Accessibility and educational sign language demonstration.

Input phrase:
"${inputText}"

Target ISL Sign Sequence:
${glossTokens.join(' -> ')}

Strict Visual & Framing Guidelines:
- Subject: Single consistent Indian signer, front-facing camera angle, centered.
- Framing: Medium close-up (waist up) with ample clearance. Both hands and upper body must remain fully in frame at all times.
- Hand Visibility: Zero cropping of hands or fingers during signing gestures.
- Gestures: Clear, deliberate, standard ISL movements matching the target sequence. No erratic or non-standard gestures.
- Scene & Lighting: Plain, clean neutral studio background (soft gray/cream), evenly lit with soft studio lighting. No clutter, props, or background movements.
- Camera: Fixed static tripod camera. No panning, zooming, tilts, cuts, or morphing.
- Composition: Portrait aspect ratio (9:16) suitable for mobile accessibility interfaces.
- Text: No captions, burned-in subtitles, watermarks, or overlays over the signer's body or hands.`;
}

/** Backward-compatible alias for callers that still use the earlier name. */
export const buildISLSequencePrompt = buildISLGlossSystemPrompt;
