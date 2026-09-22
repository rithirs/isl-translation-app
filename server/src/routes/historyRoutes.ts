import { Router, type Request, type Response } from 'express';
import { getHistory, getSavedTranslations, recordHistory, removeSavedTranslation, saveTranslation } from '../services/historyService.js';

export const historyRouter = Router();

historyRouter.post('/history', async (request: Request, response: Response) => {
  const { userId, translationId } = request.body as { userId?: unknown; translationId?: unknown };
  if (typeof userId !== 'string' || typeof translationId !== 'string') {
    response.status(400).json({ error: 'userId and translationId are required' }); return;
  }
  response.status(201).json(await recordHistory(userId, translationId));
});

historyRouter.get('/history', async (request: Request, response: Response) => {
  const userId = typeof request.query.userId === 'string' ? request.query.userId : '';
  if (!userId) { response.status(400).json({ error: 'userId is required' }); return; }
  response.json(await getHistory(userId));
});

historyRouter.post('/saved', async (request: Request, response: Response) => {
  const { userId, translationId } = request.body as { userId?: unknown; translationId?: unknown };
  if (typeof userId !== 'string' || typeof translationId !== 'string') {
    response.status(400).json({ error: 'userId and translationId are required' }); return;
  }
  response.status(201).json(await saveTranslation(userId, translationId));
});

historyRouter.get('/saved', async (request: Request, response: Response) => {
  const userId = typeof request.query.userId === 'string' ? request.query.userId : '';
  if (!userId) { response.status(400).json({ error: 'userId is required' }); return; }
  response.json(await getSavedTranslations(userId));
});

historyRouter.delete('/saved/:id', async (request: Request, response: Response) => {
  const id = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;
  await removeSavedTranslation(id);
  response.status(204).send();
});