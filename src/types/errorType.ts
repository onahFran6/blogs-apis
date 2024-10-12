export interface CustomErrorResponse {
  message: string;
  statusCode: number;
  errorType: string;
}

export enum ErrorType {
  USER_CONFLICT = 'UserConflictError',
  AUTHENTICATION = 'AuthenticationError',
  VALIDATION = 'ValidationError',
  DATABASE = 'DatabaseError',
  NOT_FOUND = 'NotFoundError',
  SERVER = 'ServerError',
}
