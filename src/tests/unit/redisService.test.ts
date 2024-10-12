import {
  fetchDataFromRedis,
  setDataToRedis,
  setDataToRedisWithExpiration,
} from '../../services/redisService';
import redisClient from '../../config/redisClient';
import logger from '../../config/logger';

// Mocking the logger and Redis client
jest.mock('../../config/logger');
jest.mock('../../config/redisClient');

describe('Redis Service', () => {
  const redisUniqueId = 'test_unique_id';
  const testData = { key: 'value' };

  afterEach(() => {
    jest.clearAllMocks(); // Clear mock calls after each test
  });

  describe('fetchDataFromRedis', () => {
    it('should return parsed data if cache hit', async () => {
      (redisClient.get as jest.Mock).mockResolvedValueOnce(JSON.stringify(testData));

      const result = await fetchDataFromRedis(redisUniqueId);

      expect(result).toEqual(testData);
      expect(logger.info).toHaveBeenCalledWith(`Cache hit for ${redisUniqueId}`);
    });

    it('should return null if cache miss', async () => {
      (redisClient.get as jest.Mock).mockResolvedValueOnce(null);

      const result = await fetchDataFromRedis(redisUniqueId);

      expect(result).toBeNull();
      expect(logger.info).toHaveBeenCalledWith(`Cache miss for ${redisUniqueId}`);
    });

    it('should log an error if fetching from Redis fails', async () => {
      const errorMessage = 'Redis fetch error';
      (redisClient.get as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

      const result = await fetchDataFromRedis(redisUniqueId);

      expect(result).toBeNull();
      expect(logger.error).toHaveBeenCalledWith(`Error fetching from Redis: ${errorMessage}`);
    });
  });

  describe('setDataToRedis', () => {
    it('should successfully cache data', async () => {
      await setDataToRedis(redisUniqueId, testData);

      expect(redisClient.setEx).toHaveBeenCalledWith(
        redisUniqueId,
        expect.any(Number),
        JSON.stringify(testData),
      );
      expect(logger.info).toHaveBeenCalledWith(`Successfully cached data for ${redisUniqueId}`);
    });

    it('should log an error if setting data fails', async () => {
      const errorMessage = 'Redis set error';
      (redisClient.setEx as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

      await setDataToRedis(redisUniqueId, testData);

      expect(logger.error).toHaveBeenCalledWith(`Error setting Redis data: ${errorMessage}`);
    });
  });

  describe('setDataToRedisWithExpiration', () => {
    it('should successfully cache data with custom expiration', async () => {
      const expirationTimeInSeconds = 60;

      await setDataToRedisWithExpiration(redisUniqueId, testData, expirationTimeInSeconds);

      expect(redisClient.setEx).toHaveBeenCalledWith(
        redisUniqueId,
        expirationTimeInSeconds,
        JSON.stringify(testData),
      );
      expect(logger.info).toHaveBeenCalledWith(
        `Successfully cached data for ${redisUniqueId} with expiration time of ${expirationTimeInSeconds} seconds`,
      );
    });

    it('should log an error if setting data with custom expiration fails', async () => {
      const errorMessage = 'Redis set with expiration error';
      (redisClient.setEx as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

      await setDataToRedisWithExpiration(redisUniqueId, testData, 60);

      expect(logger.error).toHaveBeenCalledWith(
        `Error setting Redis data with custom expiration: ${errorMessage}`,
      );
    });
  });
});
