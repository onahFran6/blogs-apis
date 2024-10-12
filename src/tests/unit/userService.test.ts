import bcrypt from 'bcrypt';
import * as userRepository from '../../repositories/userRepository';
import * as redisService from '../../services/redisService';
import * as jwt from '../../utility/jwt';
import * as passwordUtils from '../../utility/passwordUtils';
import {
  createUserService,
  loginUserService,
  getUsersService,
  getTopUsersWithMostPostsAndLatestCommentsService,
  getTopUsersWithMostPostsAndLatestOptimizedCommentsService,
} from '../../services/userService';
import { CustomError } from '../../utility/customError';
import { RedisKeys } from '../../types/redis.enum';
import { ErrorType } from '../../types/errorType';
import {
  getTopUsersWithLatestComments,
  getTopUsersWithLatestCommentsOptimized,
} from '../../repositories/userRepository';

jest.mock('../../services/redisService');
jest.mock('../../repositories/userRepository');

jest.mock('../../repositories/userRepository');
jest.mock('../../services/redisService');
jest.mock('../../utility/jwt');
jest.mock('../../utility/passwordUtils');
jest.mock('bcrypt');

describe('User Service', () => {
  describe('createUserService', () => {
    it('should create a new user and return user data with a token', async () => {
      const mockUser = { id: 1, name: 'Test', email: 'test@test.com' };

      // Mock the findUserByEmail, hashPassword, createUser, and generateToken functions
      (userRepository.findUserByEmail as jest.Mock).mockResolvedValue(null);
      (passwordUtils.hashPassword as jest.Mock).mockResolvedValue('hashedPassword');
      (userRepository.createUser as jest.Mock).mockResolvedValue(mockUser);
      (jwt.generateToken as jest.Mock).mockReturnValue('fake-jwt-token');
      (redisService.setDataToRedis as jest.Mock).mockResolvedValue(null);

      const result = await createUserService('Test', 'test@test.com', 'password123');

      expect(userRepository.findUserByEmail).toHaveBeenCalledWith('test@test.com');
      expect(passwordUtils.hashPassword).toHaveBeenCalledWith('password123');
      expect(userRepository.createUser).toHaveBeenCalledWith(
        'Test',
        'test@test.com',
        'hashedPassword',
      );
      expect(jwt.generateToken).toHaveBeenCalledWith(mockUser.id);
      expect(redisService.setDataToRedis).toHaveBeenCalledWith(RedisKeys.FETCH_ALL_USERS, null);

      expect(result).toEqual({
        user: {
          id: 1,
          name: 'Test',
          email: 'test@test.com',
        },
        token: 'fake-jwt-token',
      });
    });

    it('should throw a CustomError if the user already exists', async () => {
      (userRepository.findUserByEmail as jest.Mock).mockResolvedValue({
        id: 1,
        email: 'test@test.com',
      });

      await expect(createUserService('Test', 'test@test.com', 'password123')).rejects.toThrow(
        CustomError,
      );
      await expect(createUserService('Test', 'test@test.com', 'password123')).rejects.toThrowError(
        new CustomError(
          'User already exists with this email address',
          409,
          ErrorType.USER_CONFLICT,
        ),
      );

      expect(userRepository.findUserByEmail).toHaveBeenCalledWith('test@test.com');
    });

    it('should throw a CustomError if user creation fails', async () => {
      (userRepository.findUserByEmail as jest.Mock).mockResolvedValue(null);
      (passwordUtils.hashPassword as jest.Mock).mockResolvedValue('hashedPassword');
      (userRepository.createUser as jest.Mock).mockResolvedValue(null); // Simulate failure

      await expect(createUserService('Test', 'test@test.com', 'password123')).rejects.toThrow(
        CustomError,
      );
      await expect(createUserService('Test', 'test@test.com', 'password123')).rejects.toThrowError(
        new CustomError('Failed to create user', 500, ErrorType.SERVER),
      );
    });
  });

  describe('loginUserService', () => {
    it('should log in the user and return user data with a token', async () => {
      const mockUser = { id: 1, name: 'Test', email: 'test@test.com', password: 'hashedPassword' };

      (userRepository.findUserByEmail as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true); // Password is valid
      (jwt.generateToken as jest.Mock).mockReturnValue('fake-jwt-token');

      const result = await loginUserService('test@test.com', 'password123');

      expect(userRepository.findUserByEmail).toHaveBeenCalledWith('test@test.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
      expect(jwt.generateToken).toHaveBeenCalledWith(mockUser.id);

      expect(result).toEqual({
        user: { id: 1, name: 'Test', email: 'test@test.com' },
        token: 'fake-jwt-token',
      });
    });

    it('should throw a CustomError if the user is not found', async () => {
      (userRepository.findUserByEmail as jest.Mock).mockResolvedValue(null);

      await expect(loginUserService('test@test.com', 'password123')).rejects.toThrow(CustomError);
      await expect(loginUserService('test@test.com', 'password123')).rejects.toThrowError(
        new CustomError('Invalid Credentials', 400, ErrorType.AUTHENTICATION),
      );
    });

    it('should throw a CustomError if the password is incorrect', async () => {
      const mockUser = { id: 1, name: 'Test', email: 'test@test.com', password: 'hashedPassword' };

      (userRepository.findUserByEmail as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false); // Password is invalid

      await expect(loginUserService('test@test.com', 'wrongpassword')).rejects.toThrow(CustomError);
      await expect(loginUserService('test@test.com', 'wrongpassword')).rejects.toThrowError(
        new CustomError('Invalid Credentials', 400, ErrorType.AUTHENTICATION),
      );
    });
  });

  describe('User Service - getUsersService', () => {
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleErrorSpy.mockRestore();
    });

    it('should return cached users if found in Redis', async () => {
      const mockUsers = [{ id: 1, name: 'Test User' }];
      (redisService.fetchDataFromRedis as jest.Mock).mockResolvedValue(mockUsers);

      const result = await getUsersService();

      expect(redisService.fetchDataFromRedis).toHaveBeenCalledWith(RedisKeys.FETCH_ALL_USERS);
      expect(result).toEqual(mockUsers);
    });

    it('should fetch users from the database and cache them if not found in Redis', async () => {
      const mockUsers = [{ id: 1, name: 'Test User' }];
      (redisService.fetchDataFromRedis as jest.Mock).mockResolvedValue(null);
      (userRepository.getAllUsersWithoutPassword as jest.Mock).mockResolvedValue(mockUsers);
      (redisService.setDataToRedis as jest.Mock).mockResolvedValue(null);

      const result = await getUsersService();

      expect(userRepository.getAllUsersWithoutPassword).toHaveBeenCalled();
      expect(redisService.setDataToRedis).toHaveBeenCalledWith(
        RedisKeys.FETCH_ALL_USERS,
        mockUsers,
      );
      expect(result).toEqual(mockUsers);
    });

    it('should throw CustomError if no users are found', async () => {
      (redisService.fetchDataFromRedis as jest.Mock).mockResolvedValue(null);
      (userRepository.getAllUsersWithoutPassword as jest.Mock).mockResolvedValue([]);

      await expect(getUsersService()).rejects.toThrowError(
        new CustomError('No users found', 404, ErrorType.NOT_FOUND),
      );
    });

    it('should throw an error if something goes wrong', async () => {
      (redisService.fetchDataFromRedis as jest.Mock).mockRejectedValue(new Error('Redis Error'));

      await expect(getUsersService()).rejects.toThrow('Redis Error');
    });
  });

  describe('User Service - getTopUsersWithMostPostsAndLatestCommentsService', () => {
    it('should return top users with most posts and latest comments', async () => {
      const mockUsers = [{ id: 1, name: 'User 1' }];

      (getTopUsersWithLatestComments as jest.Mock).mockResolvedValue(mockUsers);

      const result = await getTopUsersWithMostPostsAndLatestCommentsService();

      expect(getTopUsersWithLatestComments).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
    });

    it('should throw an error if fetching top users fails', async () => {
      (getTopUsersWithLatestComments as jest.Mock).mockRejectedValue(new Error('Database Error'));

      await expect(getTopUsersWithMostPostsAndLatestCommentsService()).rejects.toThrow(
        'Failed to fetch top users with latest comments: Database Error',
      );
    });
  });

  describe('User Service - getTopUsersWithMostPostsAndLatestOptimizedCommentsService', () => {
    it('should return optimized top users with most posts and latest comments', async () => {
      const mockUsers = [
        {
          id: 2,
          name: 'onah test',
          title: 'fran',
          content: 'This is a comment on the post.',
        },
        {
          id: 4,
          name: 'User2',
          title: 'fran user',
          content: 'This is a comment on the post.',
        },
        {
          id: 4,
          name: 'User2',
          title: 'fran user',
          content: 'This is a comment on the post. LATEST',
        },
      ];

      // Mock the implementation of the repository function
      (getTopUsersWithLatestCommentsOptimized as jest.Mock).mockResolvedValue(mockUsers);

      const result = await getTopUsersWithMostPostsAndLatestOptimizedCommentsService();

      // Ensure the repository function was called and the result is as expected
      expect(getTopUsersWithLatestCommentsOptimized).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
    });
    it('should throw an error if fetching optimized top users fails', async () => {
      (getTopUsersWithLatestCommentsOptimized as jest.Mock).mockRejectedValue(
        new Error('Database Error'),
      );

      await expect(getTopUsersWithMostPostsAndLatestOptimizedCommentsService()).rejects.toThrow(
        'Failed to fetch optimized top users with latest comments: Database Error',
      );
    });
  });
});
