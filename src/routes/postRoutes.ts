import express from 'express';
import { getUserPosts, createPost } from '../controllers/postController';
import { addCommentToPost } from '../controllers/commentController';
import { authenticateToken } from '../middlewares/authMiddleware';
import { validateAddComment, validateCreatePost } from '../middlewares/validators';

const router = express.Router();

router.get('/', authenticateToken, getUserPosts);
router.post('/', authenticateToken, validateCreatePost, createPost);
router.post('/:postId/comments', authenticateToken, validateAddComment, addCommentToPost);

export default router;
