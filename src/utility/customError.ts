import { ErrorType } from '../types/errorType';

export class CustomError extends Error {
  public statusCode: number;
  public errorType: ErrorType;

  constructor(message: string, statusCode: number, errorType: ErrorType) {
    super(message);
    this.statusCode = statusCode;
    this.errorType = errorType;
    Error.captureStackTrace(this, this.constructor);
  }
}
