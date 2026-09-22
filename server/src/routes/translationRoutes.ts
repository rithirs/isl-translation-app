import { Router, type Request, type Response } from 'express';
import {
  getOrCreateTranslation,
  getTranslationHistory,
} from '../services/translationService.js';
import { ValidationError } from '../utils/errors.js';

export const translationRouter = Router();

function isLanguage(value: unknown): value is 'en' | 'ta' {
  return value === 'en' || value === 'ta';
}

translationRouter.post('/translate', async (request: Request, response: Response) => {
  const { text, language } = request.body as { text?: unknown; language?: unknown };
  if (typeof text !== 'string' || text.trim().length < 1 || text.trim().length > 500) {
    throw new ValidationError(typeof text === 'string' && text.trim().length === 0 ? 'Please enter text to translate.' : 'Please shorten your message (max 500 characters).');
  }
  if (language !== undefined && !isLanguage(language)) {
    throw new ValidationError('Language must be "en" or "ta".');
  }
  const result = await getOrCreateTranslation(text, language ?? 'en');
  response.status(200).json(result);
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
