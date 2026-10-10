import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as c from '../controllers/cartController.js';

const router = Router();
router.use(requireAuth);

router.get('/', c.getCart);
router.post('/items', c.addItem);
router.put('/items/:productSlug', c.updateItem);
router.delete('/items/:productSlug', c.removeItem);
router.delete('/', c.clearCart);

export default router;