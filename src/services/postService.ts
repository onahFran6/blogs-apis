import { getUserById } from '../repositories/userRepository';
import { createPost, getUserPosts } from '../repositories/postRepository';
import { RedisKeys } from '../types/redis.enum';
import { fetchDataFromRedis, setDataToRedis } from './redisService';
import { ErrorType } from '../types/errorType';
import { CustomError } from '../utility/customError';
import { Post, UserPostsResponse } from '../types/postType';

export const getUserPostsService = async (userId: number): Promise<UserPostsResponse> => {
  const redisUniqueKey = `${RedisKeys.FETCH_USER_BY_ID}_${userId}`;
  const cachedUsersPost = await fetchDataFromRedis(redisUniqueKey);

  if (cachedUsersPost) {
    return cachedUsersPost;
  }

  const user = await getUserById(userId);
  if (!user) {
    throw new CustomError(`User with ID ${userId} does not exist`, 404, ErrorType.NOT_FOUND);
  }

  const posts = await getUserPosts(userId);

  if (!posts || posts.length === 0) {
    await setDataToRedis(redisUniqueKey, null);
    return [];
  }

  await setDataToRedis(redisUniqueKey, posts);
  return posts;
};

// Service to create a post for an authenticated user
export const createPostService = async (
  userId: number,
  title: string,
  content: string,
): Promise<Post> => {
  if (!title || !content) {
    throw new CustomError('Title and content are required', 400, ErrorType.VALIDATION);
  }

  const user = await getUserById(userId);
  if (!user) {
    throw new CustomError(`User with ID ${userId} does not exist`, 404, ErrorType.NOT_FOUND);
  }

  const newPost = await createPost(userId, title, content);

  if (!newPost) {
    throw new CustomError('Failed to create post', 500, ErrorType.SERVER);
  }

  const redisUniqueKey = `${RedisKeys.FETCH_USER_BY_ID}_${userId}`;
  const posts = await getUserPosts(userId);

  if (!posts.length) {
    await setDataToRedis(redisUniqueKey, null);
    return newPost;
  }

  await setDataToRedis(redisUniqueKey, posts);
  return newPost;
};

export default {
  getUserPostsService,
  createPostService,
};
