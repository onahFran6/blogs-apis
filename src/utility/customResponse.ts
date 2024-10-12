import { Response } from 'express';

interface AppResponseType {
  res: Response;
  statusCode: number;
  message: string;
  data?: Record<string, any> | unknown | null | string;
}

export const AppResponse = ({
  res,
  statusCode,
  message,
  data = null,
}: AppResponseType): Response => {
  return res.status(statusCode).json({
    status: statusCode >= 200 && statusCode < 300 ? 'success' : 'error',
    message: message ?? 'Success',
    data: data || null,
  });
};
