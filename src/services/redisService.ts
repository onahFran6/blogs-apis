import dotenv from '../config/dotenv';
import logger from '../config/logger';
import redisClient, { connectRedis, disconnectRedis } from '../config/redisClient';

const redisExpiration = dotenv.redisExpiration;

/**
 * Fetch data from Redis by unique identifier.
 *
 * @param redisUniqueId - Unique identifier for the Redis cache entry
 * @returns Parsed data from Redis or null if not found
 */
export const fetchDataFromRedis = async (redisUniqueId: string): Promise<any> => {
  try {
    await connectRedis();
    const data = await redisClient.get(redisUniqueId);

    if (data) {
      logger.info(`Cache hit for ${redisUniqueId}`);
      return JSON.parse(data);
    } else {
      logger.info(`Cache miss for ${redisUniqueId}`);
      return null;
    }
  } catch (err) {
    logger.error(`Error fetching from Redis: ${err.message}`);
    return null; // You can choose to return null or handle it differently if needed
  } finally {
    await disconnectRedis();
  }
};

/**
 * Set data to Redis with default expiration time.
 *
 * @param redisUniqueId - Unique identifier for the Redis cache entry
 * @param data - Data to be cached
 */
export const setDataToRedis = async (redisUniqueId: string, data: any): Promise<void> => {
  try {
    await connectRedis();
    await redisClient.setEx(redisUniqueId, redisExpiration, JSON.stringify(data));
    logger.info(`Successfully cached data for ${redisUniqueId}`);
  } catch (err) {
    console.log(err);
    logger.error(`Error setting Redis data: ${err.message}`);
  } finally {
    await disconnectRedis();
  }
};

/**
 * Set data to Redis with a custom expiration time in seconds.
 *
 * @param redisUniqueId - Unique identifier for the Redis cache entry
 * @param data - Data to be cached
 * @param expirationTimeInSeconds - Expiration time in seconds for the cached data
 */
export const setDataToRedisWithExpiration = async (
  redisUniqueId: string,
  data: any,
  expirationTimeInSeconds: number,
): Promise<void> => {
  try {
    await connectRedis();
    await redisClient.setEx(redisUniqueId, expirationTimeInSeconds, JSON.stringify(data));
    logger.info(
      `Successfully cached data for ${redisUniqueId} with expiration time of ${expirationTimeInSeconds} seconds`,
    );
  } catch (err) {
    logger.error(`Error setting Redis data with custom expiration: ${err.message}`);
  } finally {
    await disconnectRedis();
  }
};
