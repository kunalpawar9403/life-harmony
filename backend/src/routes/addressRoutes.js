import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as c from '../controllers/addressController.js';

const router = Router();
router.use(requireAuth);
router.get('/', c.listAddresses);
router.post('/', c.addAddress);
router.delete('/:id', c.removeAddress);

export default router;