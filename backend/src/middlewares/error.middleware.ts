import { Request, Response, NextFunction } from 'express';
import { MulterError } from 'multer';
import { ERROR_CODES, ErrorCode } from '../constants/errorCodes';
import { ENV } from '../config/env';

export class AppError extends Error {
  public statusCode: number;
  public code: ErrorCode;

  constructor(statusCode: number, code: ErrorCode, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  if (ENV.NODE_ENV !== 'test') {
    console.error('💥 Error caught by handler:', err);
  }

  // 1. AppError (explicit application errors)
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
      },
    });
    return;
  }

  // 2. Multer Errors
  if (err instanceof MulterError) {
    let message = err.message;
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'Image file size exceeds the 10MB limit.';
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      message = 'Too many files uploaded at once (maximum 10 images).';
    }

    res.status(400).json({
      error: {
        code: ERROR_CODES.VALIDATION_ERROR,
        message,
      },
    });
    return;
  }

  // 3. Custom file filter errors from multer
  if (err.code === ERROR_CODES.INVALID_FILE_TYPE) {
    res.status(400).json({
      error: {
        code: ERROR_CODES.INVALID_FILE_TYPE,
        message: err.message || 'Only image files are allowed.',
      },
    });
    return;
  }

  // 4. Default 500 Internal Server Error
  const statusCode = err.status || err.statusCode || 500;
  const code = err.code && typeof err.code === 'string' && ERROR_CODES[err.code as keyof typeof ERROR_CODES]
    ? (err.code as ErrorCode)
    : ERROR_CODES.INTERNAL_SERVER_ERROR;
  const message =
    ENV.NODE_ENV === 'production' && statusCode === 500
      ? 'An unexpected error occurred on the server.'
      : err.message || 'Internal server error';

  res.status(statusCode).json({
    error: {
      code,
      message,
    },
  });
};
