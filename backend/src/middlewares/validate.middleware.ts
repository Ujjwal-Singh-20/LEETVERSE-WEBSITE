import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny, ZodError } from 'zod';
import { ERROR_CODES } from '../constants/errorCodes';

export const validateBody = (schema: ZodTypeAny) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const firstIssue = error.issues[0];
        const fieldName = firstIssue?.path.join('.') || 'payload';
        const message = `${firstIssue?.message || 'Invalid input'} (field: ${fieldName})`;
        res.status(400).json({
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message,
          },
        });
        return;
      }
      next(error);
    }
  };
};

export const validateQuery = (schema: ZodTypeAny) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.query = await schema.parseAsync(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const firstIssue = error.issues[0];
        const fieldName = firstIssue?.path.join('.') || 'query';
        const message = `${firstIssue?.message || 'Invalid query parameters'} (field: ${fieldName})`;
        res.status(400).json({
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message,
          },
        });
        return;
      }
      next(error);
    }
  };
};

export const validateParams = (schema: ZodTypeAny) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.params = await schema.parseAsync(req.params);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const firstIssue = error.issues[0];
        const fieldName = firstIssue?.path.join('.') || 'param';
        const message = `${firstIssue?.message || 'Invalid path parameter'} (field: ${fieldName})`;
        res.status(400).json({
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message,
          },
        });
        return;
      }
      next(error);
    }
  };
};
