import { Post } from '../types/postType';
import pool from '../config/database';

// Fetch all posts by a user ID
export const getUserPosts = async (userId: number): Promise<Post[]> => {
  try {
    const result = await pool.query('SELECT * FROM posts WHERE "userId" = $1', [userId]);
    return result.rows;
  } catch (error) {
    throw new Error(`Failed to fetch posts for user ID ${userId}: ${error.message}`);
  }
};

// Create a new post for a user
export const createPost = async (userId: number, title: string, content: string): Promise<Post> => {
  try {
    const result = await pool.query(
      'INSERT INTO posts ("userId", title, content) VALUES ($1, $2, $3) RETURNING *',
      [userId, title, content],
    );
    return result.rows[0];
  } catch (error) {
    throw new Error(`Failed to create post for user ID ${userId}: ${error.message}`);
  }
};

// Fetch a post by post ID
export const getPostById = async (postId: number): Promise<Post | null> => {
  try {
    const result = await pool.query('SELECT * FROM posts WHERE id = $1', [postId]);
    if (result.rows.length > 0) {
      return result.rows[0];
    } else {
      return null; // Post not found
    }
  } catch (error) {
    throw new Error(`Failed to fetch post by ID ${postId}: ${error.message}`);
  }
};
