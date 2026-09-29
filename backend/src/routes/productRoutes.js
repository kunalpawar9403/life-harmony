import { Router } from 'express';
import * as c from '../controllers/productController.js';
const router = Router();
router.get('/', c.listProducts);
router.get('/goals', c.listGoals);
router.get('/:id', c.getProduct);
export default router;