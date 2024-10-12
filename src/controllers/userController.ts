import { Request, Response, NextFunction } from 'express';
import userService from '../services/userService';
import { validationResult } from 'express-validator';
import { AppResponse } from '../utility/customResponse';
import { token } from 'morgan';

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorResponse = {
        success: false,
        errors: errors.array(),
      };
      res.status(400).json(errorResponse);
      return;
    }
    const { name, email, password } = req.body;
    const newUser = await userService.createUserService(name, email, password);
    AppResponse({
      res,
      statusCode: 201,
      message: 'User created successfully',
      data: newUser,
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        errors: errors.array(),
      });
      return;
    }

    const { email, password } = req.body;
    const user = await userService.loginUserService(email, password);

    AppResponse({
      res,
      statusCode: 200,
      message: 'User logged in successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await userService.getUsersService();
    AppResponse({
      res,
      statusCode: 200,
      message: 'Users retrieved successfully',
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

export const getTopUsersWithMostPostsAndLatestComments = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const users = await userService.getTopUsersWithMostPostsAndLatestCommentsService();
    AppResponse({
      res,
      statusCode: 200,
      message: 'Top users with most posts and latest comments retrieved successfully',
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

export const getTopUsersWithMostPostsAndLatestCommentsOptimized = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const users = await userService.getTopUsersWithMostPostsAndLatestOptimizedCommentsService();
    AppResponse({
      res,
      statusCode: 200,
      message:
        'Top users with most posts and latest comments retrieved successfully optimized version',
      data: users,
    });
  } catch (error) {
    next(error);
  }
};
