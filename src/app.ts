import express, { Request, Response } from 'express';
import path from 'path';
import compression from 'compression';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import lusca from 'lusca';
import session from 'express-session';
import { limiter } from './middlewares/rateLimiter';
import { useCors } from './middlewares/cors';
import { ipWhitelist } from './middlewares/ipWhitelist';
import { errorHandler } from './middlewares/errorHandler';
import dotenv from './config/dotenv';
import redisClient, { ensureRedisConnection } from './config/redisClient';
import logger from './config/logger';
import RedisStore from 'connect-redis';
import userRouter from './routes/userRoutes';
import postRouter from './routes/postRoutes';

const app = express();

// Security and compression middlewares
app.set('port', dotenv.port || 3001);
app.use(compression());
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Lusca for enhanced security
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));

//Ensure Redis connection before session middleware
app.use(async (req, res, next) => {
  try {
    await ensureRedisConnection();
    next();
  } catch (err) {
    logger.error('❌ Could not connect to Redis, failing request');
    res.status(500).send('Internal Server Error');
  }
});

// Session management using Redis store
app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: dotenv.sessionSecret || 'secretKey',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day expiration
    },
  }),
);

// app.use(lusca.csrf());

// Static files
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1y' }));

// Custom middleware for CORS and IP whitelisting
app.use(limiter);
app.use(useCors);
app.use(ipWhitelist);

// API Routes
app.use('/api/v1/users', userRouter);
app.use('/api/v1/posts', postRouter);

app.get('/', (req: Request, res: Response) => {
  res.send('Server is healthy and running');
});

// Global error handling middleware
app.use(errorHandler);

export default app;
