import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as c from '../controllers/orderController.js';

const router = Router();
router.use(requireAuth);
router.post('/', c.createOrder);
router.get('/', c.listOrders);
router.get('/:orderNumber', c.getOrder);

export default router;