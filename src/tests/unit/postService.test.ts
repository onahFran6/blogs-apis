// postService.test.ts
import { getUserPostsService, createPostService } from '../../services/postService';
import { getUserById } from '../../repositories/userRepository';
import { createPost, getUserPosts } from '../../repositories/postRepository';
import { fetchDataFromRedis, setDataToRedis } from '../../services/redisService';
import { CustomError } from '../../utility/customError';

jest.mock('../../repositories/userRepository');
jest.mock('../../repositories/postRepository');
jest.mock('../../services/redisService');

describe('Post Service', () => {
  describe('getUserPostsService', () => {
    it('should return cached posts if available', async () => {
      const userId = 1;
      const cachedPosts = [{ id: 1, title: 'Post 1', content: 'Content 1' }];

      (fetchDataFromRedis as jest.Mock).mockResolvedValue(cachedPosts);

      const result = await getUserPostsService(userId);

      expect(fetchDataFromRedis).toHaveBeenCalledWith(`FETCH_USER_BY_ID_${userId}`);
      expect(result).toEqual(cachedPosts);
    });

    it('should throw an error if user does not exist', async () => {
      const userId = 1;

      (fetchDataFromRedis as jest.Mock).mockResolvedValue(null);
      (getUserById as jest.Mock).mockResolvedValue(null);

      await expect(getUserPostsService(userId)).rejects.toThrow('User with ID 1 does not exist');
    });

    it('should return posts if user exists and no cache', async () => {
      const userId = 1;
      const user = { id: userId, name: 'User 1' };
      const posts = [{ id: 1, title: 'Post 1', content: 'Content 1' }];

      (fetchDataFromRedis as jest.Mock).mockResolvedValue(null);
      (getUserById as jest.Mock).mockResolvedValue(user);
      (getUserPosts as jest.Mock).mockResolvedValue(posts);

      const result = await getUserPostsService(userId);

      expect(getUserById).toHaveBeenCalledWith(userId);
      expect(getUserPosts).toHaveBeenCalledWith(userId);
      expect(setDataToRedis).toHaveBeenCalledWith(`FETCH_USER_BY_ID_${userId}`, posts);
      expect(result).toEqual(posts);
    });

    it('should return an empty array if user exists but has no posts', async () => {
      const userId = 1;
      const user = { id: userId, name: 'User 1' };

      (fetchDataFromRedis as jest.Mock).mockResolvedValue(null);
      (getUserById as jest.Mock).mockResolvedValue(user);
      (getUserPosts as jest.Mock).mockResolvedValue([]);

      const result = await getUserPostsService(userId);

      expect(setDataToRedis).toHaveBeenCalledWith(`FETCH_USER_BY_ID_${userId}`, null);
      expect(result).toEqual([]);
    });
  });

  describe('createPostService', () => {
    it('should throw an error if title or content is missing', async () => {
      await expect(createPostService(1, '', '')).rejects.toThrow('Title and content are required');
    });

    it('should throw an error if user does not exist', async () => {
      const userId = 1;

      // Mocking getUserById to return null, simulating user not found
      (getUserById as jest.Mock).mockResolvedValue(null);

      await expect(createPostService(userId, 'Title', 'Content')).rejects.toThrow(
        `User with ID ${userId} does not exist`,
      );
    });

    it('should create a post and cache the posts', async () => {
      const userId = 1;
      const user = { id: userId, name: 'User 1' };
      const newPost = { id: 1, title: 'New Post', content: 'Content' };
      const posts = [newPost];

      // Mocking the user and post creation
      (getUserById as jest.Mock).mockResolvedValue(user);
      (createPost as jest.Mock).mockResolvedValue(newPost);
      (getUserPosts as jest.Mock).mockResolvedValue(posts);

      const result = await createPostService(userId, 'New Post', 'Content');

      expect(createPost).toHaveBeenCalledWith(userId, 'New Post', 'Content');
      expect(setDataToRedis).toHaveBeenCalledWith(`FETCH_USER_BY_ID_${userId}`, posts);
      expect(result).toEqual(newPost);
    });

    it('should throw an error if post creation fails', async () => {
      const userId = 1;
      const user = { id: userId, name: 'User 1' };

      // Mocking the user to exist
      (getUserById as jest.Mock).mockResolvedValue(user);
      // Simulating failure in post creation
      (createPost as jest.Mock).mockResolvedValue(null);

      await expect(createPostService(userId, 'Title', 'Content')).rejects.toThrow(
        'Failed to create post',
      );
    });
  });
});
