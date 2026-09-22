export type ErrorCode = 'VALIDATION_ERROR' | 'GENERATION_FAILED' | 'ASSET_NOT_FOUND' | 'RATE_LIMITED' | 'INTERNAL_ERROR';

export class DomainError extends Error {
  constructor(public readonly code: ErrorCode, public readonly statusCode: number, message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = new.target.name;
  }
}

export class ValidationError extends DomainError {
  constructor(message: string) { super('VALIDATION_ERROR', 400, message); }
}

export class GenerationError extends DomainError {
  constructor(message = "We couldn't generate the ISL video. Please try again.", options?: ErrorOptions) { super('GENERATION_FAILED', 502, message, options); }
}

export class AssetNotFoundError extends DomainError {
  constructor(message = 'The sign video is temporarily unavailable.') { super('ASSET_NOT_FOUND', 404, message); }
}

export class RateLimitError extends DomainError {
  constructor(message = 'Too many requests. Please try again shortly.') { super('RATE_LIMITED', 429, message); }
}
