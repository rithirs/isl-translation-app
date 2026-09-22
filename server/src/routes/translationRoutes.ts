import { Router, type Request, type Response } from 'express';
import { findCachedTranslation, getTranslationHistory } from '../services/translationService.js';
import { normalizeInput } from '../utils/normalizeText.js';

export const translationRouter = Router();

function isLanguage(value: unknown): value is 'en' | 'ta' {
  return value === 'en' || value === 'ta';
}

translationRouter.post('/translate', async (request: Request, response: Response) => {
  const { text, language } = request.body as { text?: unknown; language?: unknown };
  if (typeof text !== 'string' || !text.trim()) {
    response.status(400).json({ error: 'Text must be a non-empty string' });
    return;
  }
  if (language !== undefined && !isLanguage(language)) {
    response.status(400).json({ error: 'Language must be "en" or "ta"' });
    return;
  }
  const selectedLanguage = language ?? 'en';
  const normalizedText = normalizeInput(text, selectedLanguage);
  const cached = await findCachedTranslation(normalizedText, selectedLanguage);
  if (cached) {
    response.status(200).json(cached);
    return;
  }
  response.status(200).json({
    cached: false,
    normalizedText,
    status: 'generation_required',
  });
});

translationRouter.get('/history', async (request: Request, response: Response) => {
  const parsedLimit = Number.parseInt(String(request.query.limit ?? '20'), 10);
  const history = await getTranslationHistory(Number.isFinite(parsedLimit) ? parsedLimit : 20);
  response.json(history);
});

translationRouter.get('/categories', (_request: Request, response: Response) => {
  response.json([
    { id: 'greetings', name: 'Greetings', vocabulary: ['HELLO', 'GOOD MORNING', 'THANK YOU'] },
    { id: 'daily-life', name: 'Daily life', vocabulary: ['EAT', 'DRINK', 'HOME', 'HELP'] },
    { id: 'people', name: 'People', vocabulary: ['FAMILY', 'FRIEND', 'TEACHER'] },
  ]);
});
