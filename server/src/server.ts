import 'dotenv/config';
import cors from 'cors';
import express, { type ErrorRequestHandler } from 'express';
import { translationRouter } from './routes/translationRoutes.js';

const app = express();
const port = Number.parseInt(process.env.PORT ?? '5000', 10);

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use((request, _response, next) => {
  const startedAt = Date.now();
  _response.on('finish', () => {
    console.log(`${request.method} ${request.originalUrl} ${_response.statusCode} ${Date.now() - startedAt}ms`);
  });
  next();
});

app.get('/health', (_request, response) => {
  response.json({ status: 'ok' });
});
app.use('/api', translationRouter);

const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  console.error(error);
  if (response.headersSent) return;
  response.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
};
app.use(errorHandler);

app.listen(port, () => {
  console.log(`ISL Translator API listening on http://localhost:${port}`);
});
