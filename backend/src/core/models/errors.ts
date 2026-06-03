export interface NotFoundError {
  code: 'NOT_FOUND';
  message: string;
}

export interface ConflictError {
  code: 'CONFLICT';
  message: string;
}

export interface ValidationError {
  code: 'VALIDATION_ERROR';
  message: string;
  details: string[];
}
