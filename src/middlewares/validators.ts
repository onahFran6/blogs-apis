import { body, param } from 'express-validator';

export const validateUserRegistration = [
  body('name').isString().withMessage('Name is required and must be a string.'),
  body('email').isEmail().withMessage('Valid email is required.'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
];

export const validateLogin = [
  body('email').isEmail().withMessage('Valid email is required.'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
];

export const validateCreatePost = [
  body('title').isString().withMessage('Title is required and must be a string.'),
  body('content').isString().withMessage('Content is required and must be a string.'),
];

export const validateAddComment = [
  param('postId').isInt().withMessage('Post ID must be a valid integer.'),
  body('content').isString().notEmpty().withMessage('Content is required and must be a string.'),
];
