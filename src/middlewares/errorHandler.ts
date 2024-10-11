import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const isProduction = process.env.NODE_ENV === 'production';

  const statusCode = err.statusCode || 500;
  const errorResponse = {
    success: false,
    statusCode,
    message: err.message || 'Internal Server Error',
    ...(isProduction ? null : { stack: err.stack }), // Show stack trace only in development
    errorType: err.name || 'ServerError', // Add error type for easier categorization
  };

  // Log error details to file or console
  logger.error(`[${err.name || 'ServerError'}] ${err.message}`, {
    statusCode,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
  });

  // Send response to client
  res.status(statusCode).json(errorResponse);
};
