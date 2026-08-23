import express from 'express';
import PostController from '../controllers/post.controller';

const router = express.Router();

router.get('/archive', PostController.getArchive);
router.get('/:slug', PostController.getBySlug);

export default router;
