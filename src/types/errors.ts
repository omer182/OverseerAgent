// Domain Errors
export class ExternalServiceError extends Error {
  constructor(
    message: string,
    public readonly service: string,
    public readonly statusCode?: number,
    public readonly retryAfter?: number
  ) {
    super(message);
    this.name = 'ExternalServiceError';
  }
}

export class TimeoutError extends Error {
  constructor(message: string, public readonly service: string) {
    super(message);
    this.name = 'TimeoutError';
  }
} 