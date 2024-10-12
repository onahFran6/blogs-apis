import { addCommentService } from '../../services/commentService';
import { createComment, getCommentsByPostId } from '../../repositories/commentRepository';
import { getUserById } from '../../repositories/userRepository';
import { getPostById } from '../../repositories/postRepository';
import { RedisKeys } from '../../types/redis.enum';

jest.mock('../../repositories/commentRepository');
jest.mock('../../repositories/userRepository');
jest.mock('../../repositories/postRepository');
jest.mock('../../services/redisService');

describe('addCommentService', () => {
  it('should throw an error if post ID is invalid', async () => {
    await expect(addCommentService(NaN, 1, 'This is a comment')).rejects.toThrow('Invalid post ID');
  });

  it('should throw an error if user ID is invalid', async () => {
    await expect(addCommentService(1, NaN, 'This is a comment')).rejects.toThrow('Invalid user ID');
  });

  it('should throw an error if the post does not exist', async () => {
    const postId = 1;
    const userId = 1;

    (getPostById as jest.Mock).mockResolvedValue(null);

    await expect(addCommentService(postId, userId, 'This is a comment')).rejects.toThrow(
      `Post with ID ${postId} does not exist`,
    );
  });

  it('should throw an error if the user does not exist', async () => {
    const postId = 1;
    const userId = 1;

    (getPostById as jest.Mock).mockResolvedValue({ id: postId }); // Mock post existence
    (getUserById as jest.Mock).mockResolvedValue(null);

    await expect(addCommentService(postId, userId, 'This is a comment')).rejects.toThrow(
      `User with ID ${userId} does not exist`,
    );
  });

  it('should create a comment successfully', async () => {
    const postId = 1;
    const userId = 1;
    const content = 'This is a comment';
    const newComment = { id: 1, postId, userId, content };

    (getPostById as jest.Mock).mockResolvedValue({ id: postId });
    (getUserById as jest.Mock).mockResolvedValue({ id: userId });
    (createComment as jest.Mock).mockResolvedValue(newComment);

    const result = await addCommentService(postId, userId, content);

    expect(createComment).toHaveBeenCalledWith(postId, userId, content);
    expect(result).toEqual(newComment);
  });
});
