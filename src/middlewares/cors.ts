import cors from 'cors';
import dotenv from '../config/dotenv';
import logger from '../config/logger';

const allowedOrigins = dotenv.allowedOrigins;

if (!allowedOrigins || !Array.isArray(allowedOrigins) || allowedOrigins.length === 0) {
  logger.error('CORS configuration error: ALLOWED_ORIGINS is either not set or invalid');
  throw new Error('Invalid CORS configuration: ALLOWED_ORIGINS must be a non-empty array.');
}

// Use CORS middleware with dynamic origin handling and detailed logging
export const useCors = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      // Origin is in the allowed list
      logger.info(`CORS: Allowed origin - ${origin}`);
      return callback(null, true);
    } else {
      // Origin is not allowed
      logger.warn(`CORS: Blocked origin - ${origin}`);
      return callback(
        new Error(`CORS policy does not allow access from the origin: ${origin}`),
        false,
      );
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 204,
});
