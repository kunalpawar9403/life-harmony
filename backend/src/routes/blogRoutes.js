import { Router } from 'express';
import * as c from '../controllers/blogController.js';
const router = Router();
router.get('/', c.listPosts);
router.get('/:slug', c.getPost);
export default router;