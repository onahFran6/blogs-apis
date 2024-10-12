import { createComment, getCommentsByPostId } from '../repositories/commentRepository';
import { getUserById } from '../repositories/userRepository';
import { getPostById } from '../repositories/postRepository';
import { RedisKeys } from '../types/redis.enum';
import { fetchDataFromRedis, setDataToRedis } from './redisService';

export const addCommentService = async (postId: number, userId: number, content: string) => {
  if (!postId || isNaN(postId)) {
    throw new Error('Invalid post ID');
  }

  if (!userId || isNaN(userId)) {
    throw new Error('Invalid user ID');
  }

  const redisUniqueKey = `${RedisKeys.FETCH_COMMENTS_BY_POST_ID}_${postId}`;

  // Check if the post exists
  const post = await getPostById(postId);
  if (!post) {
    throw new Error(`Post with ID ${postId} does not exist`);
  }

  // Check if the user exists
  const user = await getUserById(userId);
  if (!user) {
    throw new Error(`User with ID ${userId} does not exist`);
  }

  // Create the comment
  const newComment = await createComment(postId, userId, content);

  // // Fetch all comments for the post and update cache
  // const comments = await getCommentsByPostId(postId);
  // await setDataToRedis(redisUniqueKey, comments);

  return newComment;
};

export default {
  addCommentService,
};
