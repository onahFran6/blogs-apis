import bcrypt from 'bcrypt';
import {
  createUser,
  getTopUsersWithLatestComments,
  getTopUsersWithLatestCommentsOptimized,
  findUserByEmail,
  getAllUsersWithoutPassword,
} from '../repositories/userRepository';
import { fetchDataFromRedis, setDataToRedis } from './redisService';
import { RedisKeys } from '../types/redis.enum';
import { generateToken } from '../utility/jwt';
import { hashPassword } from '../utility/passwordUtils';
import { User, UserReturnType } from '../types/userType';
import { CustomError } from '../utility/customError';
import { ErrorType } from '../types/errorType';

export const createUserService = async (
  name: string,
  email: string,
  password: string,
): Promise<UserReturnType> => {
  try {
    // Check if the user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      throw new CustomError(
        'User already exists with this email address',
        409,
        ErrorType.USER_CONFLICT,
      );
    }

    // Hash the password before saving the user
    const hashedPassword = await hashPassword(password);

    // Create a new user with the hashed password
    const newUser = await createUser(name, email, hashedPassword);

    if (!newUser) {
      throw new CustomError('Failed to create user', 500, ErrorType.SERVER);
    }

    // Generate a JWT token
    const token = generateToken(newUser.id);

    // Optionally clear or set cache for users in Redis
    await setDataToRedis(RedisKeys.FETCH_ALL_USERS, null);

    // Return user data and token
    return {
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
      token,
    };
  } catch (error) {
    throw error;
  }
};

export const loginUserService = async (
  email: string,
  password: string,
): Promise<UserReturnType> => {
  try {
    const user = await findUserByEmail(email);
    if (!user) {
      throw new CustomError('Invalid Credentials', 400, ErrorType.AUTHENTICATION);
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      throw new CustomError('Invalid Credentials', 400, ErrorType.AUTHENTICATION);
    }

    const token = generateToken(user.id);
    const { password: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  } catch (error) {
    throw error;
  }
};

export const getUsersService = async (): Promise<User[]> => {
  try {
    // Try to fetch cached users from Redis
    const cachedUsers = await fetchDataFromRedis(RedisKeys.FETCH_ALL_USERS);

    if (cachedUsers) {
      return cachedUsers;
    }

    // Fetch all users from the database without passwords
    const users = await getAllUsersWithoutPassword();
    if (!users.length) {
      throw new CustomError('No users found', 404, ErrorType.NOT_FOUND);
    }

    // Cache the fetched users in Redis
    await setDataToRedis(RedisKeys.FETCH_ALL_USERS, users);
    return users;
  } catch (error) {
    console.error('Failed to get users in service layer:', error);
    throw error;
  }
};

export const getTopUsersWithMostPostsAndLatestCommentsService = async (): Promise<any[]> => {
  try {
    const users = await getTopUsersWithLatestComments();
    return users;
  } catch (error) {
    throw new Error(`Failed to fetch top users with latest comments: ${error.message}`);
  }
};

export const getTopUsersWithMostPostsAndLatestOptimizedCommentsService = async (): Promise<
  any[]
> => {
  try {
    const users = await getTopUsersWithLatestCommentsOptimized();
    return users;
  } catch (error) {
    throw new Error(`Failed to fetch optimized top users with latest comments: ${error.message}`);
  }
};

export default {
  loginUserService,
  getUsersService,
  createUserService,
  getTopUsersWithMostPostsAndLatestCommentsService,
  getTopUsersWithMostPostsAndLatestOptimizedCommentsService,
};
