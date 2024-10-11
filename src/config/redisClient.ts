import { createClient, RedisClientType } from 'redis';
import logger from './logger';

// Create and configure the Redis client
const redisClient: RedisClientType = createClient({
  url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
});

let isConnected = false;

// Connect to Redis with reconnection logic
export const connectRedis = async (): Promise<void> => {
  if (!redisClient.isOpen) {
    try {
      await redisClient.connect();
      isConnected = true;
      logger.info('🚀 Successfully connected to Redis.');
    } catch (err) {
      isConnected = false;
      logger.error(`❌ Redis connection failed: ${err.message}`);
      throw new Error('Failed to connect to Redis');
    }
  }
};

// Disconnect Redis gracefully
export const disconnectRedis = async (): Promise<void> => {
  if (redisClient.isOpen) {
    try {
      await redisClient.quit();
      isConnected = false;
      logger.info('🔌 Redis connection closed.');
    } catch (err) {
      logger.error(`❌ Error closing Redis connection: ${err.message}`);
      throw new Error('Failed to disconnect Redis');
    }
  }
};

// Check Redis connection status
export const ensureRedisConnection = async (): Promise<void> => {
  if (!isConnected) {
    logger.warn('⚠️ Redis is not connected, attempting to reconnect...');
    await connectRedis();
  }
};

export default redisClient;
