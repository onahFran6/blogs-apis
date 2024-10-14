// import { query } from '../config/database';
import { CustomError } from '../utility/customError';
import pool from '../config/database';
import logger from '../config/logger';
import { ErrorType } from '../types/errorType';
import { User } from 'src/types/userType';

// Fetch all users
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const result = await pool.query<User>('SELECT * FROM users');
    return result.rows;
  } catch (error) {
    throw new Error('Database error: Could not fetch users');
  }
};

// Fetch all users without password
export const getAllUsersWithoutPassword = async (): Promise<User[]> => {
  try {
    const result = await pool.query('SELECT id, name, email,"createdAt" FROM users');
    return result.rows;
  } catch (error) {
    throw new CustomError('Database error: Could not fetch users', 500, ErrorType.DATABASE);
  }
};

// Fetch user by ID
export const getUserById = async (userId: number): Promise<User | null> => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (result.rows.length > 0) {
      return result.rows[0];
    }
    return null;
  } catch (error) {
    throw new Error(`Failed to fetch user with ID ${userId}: ${error.message}`);
  }
};

// Create a new user
export const createUser = async (
  name: string,
  email: string,
  hashedPassword: string,
): Promise<User> => {
  try {
    const result = await pool.query(
      'INSERT INTO users (name, email,password) VALUES ($1, $2,$3) RETURNING *',
      [name, email, hashedPassword],
    );
    return result.rows[0];
  } catch (error) {
    throw new Error(`Failed to create user'}: ${error.message}`);
  }
};

export const getTopUsersWithLatestComments = async () => {
  try {
    const query = `
    SELECT users.id, users.name, posts.title, comments.content
    FROM users
    LEFT JOIN posts ON users.id = posts."userId"
    LEFT JOIN comments ON posts.id = comments."postId"
    WHERE comments."createdAt" = (
      SELECT MAX("createdAt")
      FROM comments
      WHERE "postId"= posts.id
    )
    ORDER BY (
      SELECT COUNT(posts.id)
      FROM posts
      WHERE posts."userId" = users.id
    ) DESC
    LIMIT 3;
  `;
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    throw new Error('Database error: Could not fetch top users with latest comments');
  }
};

export const getTopUsersWithLatestCommentsOptimized = async () => {
  try {
      const query = `
      SELECT 
        u.id AS user_id, 
        u.name, 
        tu.post_count, 
        c.content AS latest_comment, 
        c."createdAt" AS latest_comment_date
      FROM (
        -- Get top 3 users with the most posts
        SELECT 
          p."userId", 
          COUNT(p.id) AS post_count
        FROM 
          posts p
        GROUP BY 
          p."userId"
        ORDER BY 
          post_count DESC
        LIMIT 3
      ) tu
      JOIN users u ON u.id = tu."userId"
      LEFT JOIN LATERAL (
        -- Get the latest comment per user
        SELECT 
          content, 
          "createdAt"
        FROM 
          comments c
        WHERE 
          c."userId" = u.id
        ORDER BY 
          "createdAt" DESC
        LIMIT 1
      ) c ON true;
    `;
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    throw new Error('Database error: Could not fetch top users with latest comments');
  }
};

// Fetch user by email
export const findUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length > 0) {
      return result.rows[0];
    }
    return null;
  } catch (error) {
    logger.error(`❌ Failed to fetch user by email: ${email}`, error);
    throw new Error('Database error: Could not fetch user by email');
  }
};
