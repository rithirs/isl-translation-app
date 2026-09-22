import { Router, type Request, type Response } from 'express';
import { getTranslationHistory, handleTranslation } from '../services/translationService.js';

export const translationRouter = Router();

function isLanguage(value: unknown): value is 'en' | 'ta' {
  return value === 'en' || value === 'ta';
}

translationRouter.post('/translate', async (request: Request, response: Response) => {
  const { text, language } = request.body as { text?: unknown; language?: unknown };
  if (typeof text !== 'string' || text.trim().length < 1 || text.trim().length > 500) {
    response.status(400).json({ error: 'Text must contain between 1 and 500 characters' });
    return;
  }
  if (language !== undefined && !isLanguage(language)) {
    response.status(400).json({ error: 'Language must be "en" or "ta"' });
    return;
  }
  const result = await handleTranslation(text, language ?? 'en');
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
