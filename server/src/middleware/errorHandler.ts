import type { ErrorRequestHandler } from 'express';
import { DomainError } from '../utils/errors.js';

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  const domainError = error instanceof DomainError ? error : null;
  if (domainError) {
    console.error(`[${domainError.code}]`, error.stack ?? error.message);
    response.status(domainError.statusCode).json({ success: false, error: { code: domainError.code, message: domainError.message } });
    return;
  }

  console.error('[INTERNAL_ERROR]', error instanceof Error ? error.stack : error);
  if (response.headersSent) return;
  response.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Something went wrong. Please try again.' } });
};
