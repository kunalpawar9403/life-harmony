import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as c from '../controllers/wishlistController.js';

const router = Router();
router.use(requireAuth);
router.get('/', c.getWishlist);
router.get('/ids', c.getWishlistIds);
router.post('/toggle/:productSlug', c.toggleWishlist);

export default router;