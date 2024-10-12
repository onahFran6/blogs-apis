import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from '../config/dotenv';
import { RequestUserAuth } from '../types/generalType';
import { CustomError } from '../utility/customError';
import { ErrorType } from '../types/errorType';

const secretKey = dotenv.jwtSecret;

// Middleware to authenticate token
export const authenticateToken = (req: RequestUserAuth, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // If no token is found, throw a CustomError for missing token
    return next(new CustomError('Access Denied. No token provided', 401, ErrorType.AUTHENTICATION));
  }

  try {
    const decoded = jwt.verify(token, secretKey) as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch (err) {
    // Handle invalid or expired token errors by throwing a CustomError
    return next(new CustomError('Invalid or expired token', 403, ErrorType.AUTHENTICATION));
  }
};
