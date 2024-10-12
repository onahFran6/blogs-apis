import dotenv from 'dotenv';
import logger from './logger';

dotenv.config();

if (!process.env.DATABASE_URL) {
  logger.error('DATABASE_URL environment variable is not defined!');
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  logger.error('JWT_SECRET environment variable is not set. Application cannot start without it.');
  process.exit(1);
}

if (!process.env.REDIS_URL) {
  logger.error('REDIS_URL environment variable is not defined!');
  process.exit(1);
}

export default {
  port: process.env.PORT || 3000,
  databaseUrl: process.env.DATABASE_URL,
  whitelistIps: process.env.WHITELISTED_IPS ? process.env.WHITELISTED_IPS : '',
  redisExpiration: Number(process.env.REDIS_EXPIRATION) || 3600,
  redisPassword: process.env.REDIS_PASSWORD || undefined,
  allowedOrigins: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [],
  sessionSecret: process.env.SESSION_STORAGE || 'sessionSecrtet',
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiration: process.env.JWT_EXPIRATION || '24h',
  redisUrl: process.env.REDIS_URL,
  isAllowAll: process.env.IS_ALLOW_ALL_IP_ADDRESS ? process.env.IS_ALLOW_ALL_IP_ADDRESS : false,
};
