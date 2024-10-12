import { Request, Response, NextFunction } from 'express';
import postService from '../services/postService';
import { RequestUserAuth } from '../types/generalType';
import { AppResponse } from '../utility/customResponse';
import { validationResult } from 'express-validator';
import { CustomError } from '../utility/customError';
import { ErrorType } from '../types/errorType';

// Get authenticated user's posts
export const getUserPosts = async (
  req: RequestUserAuth,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = Number(req.userId);

    // Validate userId
    if (!userId) {
      throw new CustomError('Invalid user ID', 400, ErrorType.VALIDATION);
    }

    const posts = await postService.getUserPostsService(userId);
    AppResponse({
      res,
      statusCode: 200,
      message: 'User posts retrieved successfully',
      data: posts,
    });
  } catch (error) {
    next(error);
  }
};

// Create a post for the authenticated user
export const createPost = async (
  req: RequestUserAuth,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        errors: errors.array(),
      });
      return;
    }
    const { title, content } = req.body;
    const userId = Number(req.userId);

    const post = await postService.createPostService(userId, title, content);
    AppResponse({
      res,
      statusCode: 201,
      message: 'Post created successfully',
      data: post,
    });
  } catch (error) {
    next(error);
  }
};
