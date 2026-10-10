import { Router } from 'express';
import { requireAdmin } from '../middleware/auth.js';
import {
    getStats,
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    updateProductStock,
    getOrders,
    getOrderById,
    updateOrderStatus,
    getUsers,
    updateUserRole,
} from '../controllers/adminController.js';

const router = Router();

// Protect all admin routes with requireAdmin
router.use(requireAdmin);

// Dashboard stats
router.get('/stats', getStats);

// Products management
router.get('/products', getProducts);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);
router.patch('/products/:id/stock', updateProductStock);

// Orders management
router.get('/orders', getOrders);
router.get('/orders/:id', getOrderById);
router.patch('/orders/:id/status', updateOrderStatus);

// Users management
router.get('/users', getUsers);
router.patch('/users/:id/role', updateUserRole);

export default router;
