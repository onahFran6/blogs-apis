import express from 'express';
import {
  createUser,
  getTopUsersWithMostPostsAndLatestComments,
  getTopUsersWithMostPostsAndLatestCommentsOptimized,
  getUsers,
  loginUser,
} from '../controllers/userController';
import { validateLogin, validateUserRegistration } from '../middlewares/validators';

const router = express.Router();

router.post('/signup', validateUserRegistration, createUser);
router.post('/login', validateLogin, loginUser);
router.get('/', getUsers);
router.get('/top-users-posts-comments', getTopUsersWithMostPostsAndLatestComments);
router.get(
  '/top-users-posts-comments-optimized',
  getTopUsersWithMostPostsAndLatestCommentsOptimized,
);

export default router;
