import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import commentService from '../services/commentService';
import { AppResponse } from '../utility/customResponse';
import { RequestUserAuth } from '../types/generalType';

export const addCommentToPost = async (
  req: RequestUserAuth,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        errors: errors.array(),
      });
      return;
    }

    const postId = parseInt(req.params.postId, 10);
    const { content } = req.body;
    const userId = Number(req.userId);

    const comment = await commentService.addCommentService(postId, userId, content);
    AppResponse({
      res,
      statusCode: 201,
      message: 'Comment added successfully',
      data: comment,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
