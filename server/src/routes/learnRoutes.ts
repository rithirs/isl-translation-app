import { Router, type Request, type Response } from 'express';
import { getLearnCategories, getLearnSigns } from '../services/learnService.js';

export const learnRouter = Router();

learnRouter.get('/learn/categories', async (_request: Request, response: Response) => {
  response.json(await getLearnCategories());
});

learnRouter.get('/learn/signs', async (request: Request, response: Response) => {
  const category = typeof request.query.category === 'string' ? request.query.category : undefined;
  response.json(await getLearnSigns(category));
});