export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed', details?: unknown) {
    super(401, message, details);
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Forbidden', details?: unknown) {
    super(403, message, details);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation error', details?: unknown) {
    super(422, message, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', details?: unknown) {
    super(404, message, details);
  }
}