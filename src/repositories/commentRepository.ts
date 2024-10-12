import pool from '../config/database';
import { Comment } from '../types/commentType';

// Create a new comment for a post
export const createComment = async (
  postId: number,
  userId: number,
  content: string,
): Promise<Comment> => {
  try {
    const result = await pool.query(
      'INSERT INTO comments ("postId", "userId", content, "createdAt") VALUES ($1, $2, $3, NOW()) RETURNING *',
      [postId, userId, content],
    );
    return result.rows[0];
  } catch (error) {
    throw new Error(`Failed to create comment for post ID ${postId}: ${error.message}`);
  }
};

// Fetch all comments for a specific post ID
export const getCommentsByPostId = async (postId: number): Promise<Comment[]> => {
  try {
    const result = await pool.query(
      'SELECT * FROM comments WHERE "postId" = $1 ORDER BY created_at DESC',
      [postId],
    );
    return result.rows;
  } catch (error) {
    throw new Error(`Failed to fetch comments for post ID ${postId}: ${error.message}`);
  }
};
