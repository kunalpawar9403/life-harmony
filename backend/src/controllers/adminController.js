import { pool, query } from '../config/database.js';
import * as orderStore from '../services/orderStore.js';
import * as productStore from '../services/productStore.js';
import { fallbackProducts } from '../data/fallbackData.js';
import { memoryUsers as authMemoryUsers } from './authController.js';

// Default users for admin view (admins only)
const defaultAdmins = [
    { id: 1, name: 'kunal pawar', email: 'kunalpawar@gmail.com', role: 'admin', created_at: '2026-09-20T10:00:00.000Z' },
    { id: 3, name: 'Admin Life Harmony', email: 'admin@lifeharmony.com', role: 'admin', created_at: '2026-09-22T10:00:00.000Z' },
];

// GET /api/admin/stats
export async function getStats(_req, res) {
    try {
        // 1. Revenue & Order totals
        const revenueResult = await query(
            `SELECT 
                COUNT(*) as totalOrders,
                COALESCE(SUM(CASE WHEN status != 'Cancelled' THEN total ELSE 0 END), 0) as totalRevenue,
                COALESCE(SUM(CASE WHEN status = 'Processing' THEN 1 ELSE 0 END), 0) as processingOrders,
                COALESCE(SUM(CASE WHEN status = 'Shipped' THEN 1 ELSE 0 END), 0) as shippedOrders,
                COALESCE(SUM(CASE WHEN status = 'Delivered' THEN 1 ELSE 0 END), 0) as deliveredOrders,
                COALESCE(SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END), 0) as cancelledOrders
             FROM orders`
        );
        const stats = revenueResult[0] || {};

        // 2. Customers and Products count
        const [usersCount] = await query("SELECT COUNT(*) as count FROM users WHERE role = 'customer'");
        const [totalUsersCount] = await query("SELECT COUNT(*) as count FROM users");
        const [productsCount] = await query("SELECT COUNT(*) as count FROM products");
        const [lowStockCount] = await query("SELECT COUNT(*) as count FROM products WHERE stock < 15");

        // 3. Recent 7-day revenue trend
        const dailyTrends = await query(
            `SELECT 
                DATE(created_at) as date,
                COUNT(*) as orderCount,
                COALESCE(SUM(CASE WHEN status != 'Cancelled' THEN total ELSE 0 END), 0) as dailyRevenue
             FROM orders
             WHERE created_at >= (CURRENT_DATE - INTERVAL '14 days')
             GROUP BY DATE(created_at)
             ORDER BY date ASC`
        );

        // 4. Recent orders (latest 6)
        const recentOrders = await query(
            `SELECT 
                o.id, o.order_number, o.status, o.total, o.created_at, o.payment_method,
                o.ship_name, o.ship_email,
                COUNT(oi.id) as itemCount
             FROM orders o
             LEFT JOIN order_items oi ON oi.order_id = o.id
             GROUP BY o.id
             ORDER BY o.created_at DESC
             LIMIT 6`
        );

        // 5. Category distribution
        const categoryCounts = await query(
            `SELECT category, COUNT(*) as count, AVG(price) as avgPrice
             FROM products
             GROUP BY category`
        );

        return res.json({
            success: true,
            totalRevenue: Number(stats.totalRevenue ?? stats.totalrevenue ?? 0),
            totalOrders: Number(stats.totalOrders ?? stats.totalorders ?? 0),
            processingOrders: Number(stats.processingOrders ?? stats.processingorders ?? 0),
            shippedOrders: Number(stats.shippedOrders ?? stats.shippedorders ?? 0),
            deliveredOrders: Number(stats.deliveredOrders ?? stats.deliveredorders ?? 0),
            cancelledOrders: Number(stats.cancelledOrders ?? stats.cancelledorders ?? 0),
            totalCustomers: Number(usersCount?.count) || 0,
            totalUsers: Number(totalUsersCount?.count) || 0,
            totalProducts: Number(productsCount?.count) || 0,
            lowStockProducts: Number(lowStockCount?.count) || 0,
            dailyTrends: dailyTrends.map(d => ({
                date: d.date instanceof Date ? d.date.toISOString().slice(0, 10) : String(d.date),
                orders: Number(d.orderCount ?? d.ordercount ?? 0),
                revenue: Number(d.dailyRevenue ?? d.dailyrevenue ?? 0),
            })),
            recentOrders: recentOrders.map(o => ({
                ...o,
                itemCount: Number(o.itemCount ?? o.itemcount ?? 0),
            })),
            categoryCounts: categoryCounts.map(c => ({
                ...c,
                avgPrice: Number(c.avgPrice ?? c.avgprice ?? 0),
                count: Number(c.count ?? 0),
            })),
        });
    } catch (err) {
        console.warn('DB error in admin getStats, computing from memory store:', err.message);

        const allOrders = orderStore.getAllOrders();
        const activeOrders = allOrders.filter(o => o.status !== 'Cancelled');
        const totalRevenue = activeOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
        const processingOrders = allOrders.filter(o => o.status === 'Processing').length;
        const shippedOrders = allOrders.filter(o => o.status === 'Shipped').length;
        const deliveredOrders = allOrders.filter(o => o.status === 'Delivered').length;
        const cancelledOrders = allOrders.filter(o => o.status === 'Cancelled').length;

        const allProds = productStore.getAllProducts();
        const lowStock = allProds.filter(p => (Number(p.stock) || 0) < 15).length;

        // Group categories
        const catMap = {};
        allProds.forEach(p => {
            const cat = p.category || 'supplements';
            if (!catMap[cat]) catMap[cat] = { count: 0, sum: 0 };
            catMap[cat].count += 1;
            catMap[cat].sum += Number(p.price) || 0;
        });
        const categoryCounts = Object.entries(catMap).map(([category, val]) => ({
            category,
            count: val.count,
            avgPrice: Math.round(val.sum / val.count),
        }));

        // Group 7-day trend
        const trendMap = {};
        allOrders.forEach(o => {
            const d = (o.date || new Date().toISOString()).slice(0, 10);
            if (!trendMap[d]) trendMap[d] = { orders: 0, revenue: 0 };
            trendMap[d].orders += 1;
            if (o.status !== 'Cancelled') trendMap[d].revenue += Number(o.total) || 0;
        });
        const dailyTrends = Object.entries(trendMap).map(([date, val]) => ({
            date,
            orders: val.orders,
            revenue: Math.round(val.revenue),
        })).sort((a, b) => a.date.localeCompare(b.date));

            const allMemUsers = [...defaultAdmins, ...Array.from(authMemoryUsers.values()).filter(u => !defaultAdmins.some(a => a.email === u.email))];
            return res.json({
                success: true,
                totalRevenue: Math.round(totalRevenue * 100) / 100,
                totalOrders: allOrders.length,
                processingOrders,
                shippedOrders,
                deliveredOrders,
                cancelledOrders,
                totalCustomers: allMemUsers.filter(u => u.role === 'customer').length,
                totalUsers: allMemUsers.length,
            totalProducts: allProds.length,
            lowStockProducts: lowStock,
            dailyTrends: dailyTrends.length ? dailyTrends : [
                { date: new Date().toISOString().slice(0, 10), orders: allOrders.length, revenue: Math.round(totalRevenue) }
            ],
            recentOrders: allOrders.slice(0, 6).map(o => ({
                id: o.dbId || o.id,
                order_number: o.orderNumber || o.id,
                status: o.status,
                total: o.total,
                created_at: o.date,
                payment_method: o.payment?.method || 'razorpay',
                ship_name: o.shippingAddress?.name || 'Customer',
                ship_email: o.shippingAddress?.email || 'customer@lifeharmony.com',
                itemCount: o.items?.length || 1,
            })),
            categoryCounts,
        });
    }
}

// GET /api/admin/products
export async function getProducts(req, res) {
    const { search, category, sort } = req.query;

    try {
        let sql = `
            SELECT p.*,
                   (SELECT COUNT(*) FROM order_items oi WHERE oi.product_id = p.id) as salesCount
            FROM products p
            WHERE 1=1
        `;
        const params = [];

        if (search) {
            sql += ` AND (p.name LIKE ? OR p.subtitle LIKE ? OR p.slug LIKE ?)`;
            const term = `%${search.trim()}%`;
            params.push(term, term, term);
        }

        if (category && category !== 'all') {
            sql += ` AND p.category = ?`;
            params.push(category);
        }

        if (sort === 'price_asc') sql += ` ORDER BY p.price ASC`;
        else if (sort === 'price_desc') sql += ` ORDER BY p.price DESC`;
        else if (sort === 'stock_asc') sql += ` ORDER BY p.stock ASC`;
        else if (sort === 'sales_desc') sql += ` ORDER BY salesCount DESC`;
        else sql += ` ORDER BY p.id DESC`;

        const products = await query(sql, params);

        // Attach goals & benefits
        const goals = await query('SELECT pg.product_id, g.slug, g.label FROM product_goals pg JOIN goals g ON g.id = pg.goal_id');
        const benefits = await query('SELECT product_id, text FROM product_benefits');

        const goalsMap = {};
        for (const g of goals) {
            if (!goalsMap[g.product_id]) goalsMap[g.product_id] = [];
            goalsMap[g.product_id].push(g.slug);
        }

        const benefitsMap = {};
        for (const b of benefits) {
            if (!benefitsMap[b.product_id]) benefitsMap[b.product_id] = [];
            benefitsMap[b.product_id].push(b.text);
        }

        const formatted = products.map(p => ({
            ...p,
            price: Number(p.price),
            originalPrice: p.original_price ? Number(p.original_price) : null,
            goals: goalsMap[p.id] || [],
            benefits: benefitsMap[p.id] || [],
        }));

        return res.json({ success: true, count: formatted.length, products: formatted });
    } catch (err) {
        console.warn('DB error in admin getProducts, using productStore catalog:', err.message);
        const list = productStore.getAllProducts(req.query);
        return res.json({ success: true, count: list.length, products: list });
    }
}

// POST /api/admin/products
export async function createProduct(req, res) {
    const {
        name,
        subtitle = '',
        description = '',
        price,
        originalPrice = null,
        image = '',
        category = 'supplements',
        stock = 100,
        isFeatured = 0,
        goals = [],
        benefits = [],
    } = req.body;

    if (!name || price === undefined) {
        return res.status(400).json({ message: 'Name and price are required.' });
    }

    const slug = req.body.slug
        ? req.body.slug.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')
        : name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString().slice(-4);

    let conn = null;
    try {
        conn = await pool.getConnection();
    } catch (connErr) {
        console.warn('DB pool error in createProduct:', connErr.message);
        conn = null;
    }

    if (conn) {
        try {
            await conn.beginTransaction();

            const [result] = await conn.execute(
                `INSERT INTO products (slug, name, subtitle, description, price, original_price, image, category, stock, rating, is_featured)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 5.0, ?)`,
                [slug, name.trim(), subtitle.trim(), description.trim(), price, originalPrice || null, image.trim(), category, stock, isFeatured ? 1 : 0]
            );
            const productId = result.insertId;

            // Goals
            if (Array.isArray(goals) && goals.length) {
                for (const gSlug of goals) {
                    const [gRows] = await conn.execute('SELECT id FROM goals WHERE slug = ?', [gSlug]);
                    if (gRows.length) {
                        await conn.execute('INSERT INTO product_goals (product_id, goal_id) VALUES (?, ?) ON CONFLICT DO NOTHING', [productId, gRows[0].id]);
                    }
                }
            }

            // Benefits
            if (Array.isArray(benefits) && benefits.length) {
                for (const text of benefits) {
                    if (text && text.trim()) {
                        await conn.execute('INSERT INTO product_benefits (product_id, text) VALUES (?, ?)', [productId, text.trim()]);
                    }
                }
            }

            await conn.commit();

            const [created] = await query('SELECT * FROM products WHERE id = ?', [productId]);
            productStore.createProduct({ ...created, price: Number(created.price), goals, benefits });
            return res.status(201).json({ success: true, product: created });
        } catch (err) {
            if (conn) await conn.rollback();
            console.warn('DB error creating product, falling back to memory:', err.message);
        } finally {
            if (conn) conn.release();
        }
    }

    const newProduct = productStore.createProduct(req.body);
    return res.status(201).json({ success: true, product: newProduct });
}

// PUT /api/admin/products/:id
export async function updateProduct(req, res) {
    const { id } = req.params;
    const {
        name,
        subtitle,
        description,
        price,
        originalPrice,
        image,
        category,
        stock,
        isFeatured,
        goals,
        benefits,
    } = req.body;

    let conn = null;
    try {
        conn = await pool.getConnection();
    } catch {
        conn = null;
    }

    if (conn) {
        try {
            const numericId = Number(id);
            const [existing] = await conn.execute(
                'SELECT id, slug FROM products WHERE id = ? OR slug = ?',
                [!isNaN(numericId) ? numericId : 0, id]
            );
            if (existing.length) {
                const targetId = existing[0].id;
                const targetSlug = existing[0].slug;
                await conn.beginTransaction();

                const updateFields = [];
                const updateValues = [];
                if (name !== undefined) { updateFields.push('name = ?'); updateValues.push(name.trim()); }
                if (subtitle !== undefined) { updateFields.push('subtitle = ?'); updateValues.push(subtitle.trim()); }
                if (description !== undefined) { updateFields.push('description = ?'); updateValues.push(description.trim()); }
                if (price !== undefined) { updateFields.push('price = ?'); updateValues.push(price); }
                if (originalPrice !== undefined) { updateFields.push('original_price = ?'); updateValues.push(originalPrice); }
                if (image !== undefined) { updateFields.push('image = ?'); updateValues.push(image.trim()); }
                if (category !== undefined) { updateFields.push('category = ?'); updateValues.push(category); }
                if (stock !== undefined) { updateFields.push('stock = ?'); updateValues.push(stock); }
                if (isFeatured !== undefined) { updateFields.push('is_featured = ?'); updateValues.push(isFeatured ? 1 : 0); }

                if (updateFields.length) {
                    updateValues.push(targetId);
                    await conn.execute(`UPDATE products SET ${updateFields.join(', ')} WHERE id = ?`, updateValues);
                }

                if (Array.isArray(goals)) {
                    await conn.execute('DELETE FROM product_goals WHERE product_id = ?', [targetId]);
                    for (const gSlug of goals) {
                        const [gRows] = await conn.execute('SELECT id FROM goals WHERE slug = ?', [gSlug]);
                        if (gRows.length) {
                            await conn.execute('INSERT INTO product_goals (product_id, goal_id) VALUES (?, ?) ON CONFLICT DO NOTHING', [targetId, gRows[0].id]);
                        }
                    }
                }

                if (Array.isArray(benefits)) {
                    await conn.execute('DELETE FROM product_benefits WHERE product_id = ?', [targetId]);
                    for (const text of benefits) {
                        if (text && text.trim()) {
                            await conn.execute('INSERT INTO product_benefits (product_id, text) VALUES (?, ?)', [targetId, text.trim()]);
                        }
                    }
                }

                await conn.commit();
                const [updated] = await query('SELECT * FROM products WHERE id = ?', [targetId]);
                if (updated) {
                    productStore.updateProduct(targetId, { ...updated, price: Number(updated.price), goals, benefits });
                    productStore.updateProduct(targetSlug, { ...updated, price: Number(updated.price), goals, benefits });
                    return res.json({ success: true, product: updated });
                }
            }
        } catch (err) {
            if (conn) await conn.rollback();
            console.warn('DB error in updateProduct:', err.message);
        } finally {
            if (conn) conn.release();
        }
    }

    const updated = productStore.updateProduct(id, req.body);
    if (!updated) return res.status(404).json({ message: 'Product not found.' });
    return res.json({ success: true, product: updated });
}

// DELETE /api/admin/products/:id
export async function deleteProduct(req, res) {
    const { id } = req.params;
    const numericId = Number(id);
    try {
        const existing = await query(
            'SELECT id, slug FROM products WHERE id = ? OR slug = ?',
            [!isNaN(numericId) ? numericId : 0, id]
        );
        if (existing.length) {
            const targetId = existing[0].id;
            const targetSlug = existing[0].slug;
            await query('DELETE FROM products WHERE id = ?', [targetId]);
            productStore.deleteProduct(targetId);
            productStore.deleteProduct(targetSlug);
        } else {
            await query('DELETE FROM products WHERE id = ? OR slug = ?', [!isNaN(numericId) ? numericId : 0, id]);
            productStore.deleteProduct(id);
        }
    } catch (err) {
        console.warn('DB error in deleteProduct:', err.message);
        productStore.deleteProduct(id);
    }
    return res.json({ success: true, message: 'Product deleted successfully.' });
}

// PATCH /api/admin/products/:id/stock
export async function updateStock(req, res) {
    const { id } = req.params;
    const { delta, stock } = req.body;
    const numericId = Number(id);

    productStore.updateStock(id, { delta, stock });

    try {
        const existing = await query(
            'SELECT id, slug, stock FROM products WHERE id = ? OR slug = ?',
            [!isNaN(numericId) ? numericId : 0, id]
        );
        if (existing.length) {
            const targetId = existing[0].id;
            if (stock !== undefined) {
                await query('UPDATE products SET stock = ? WHERE id = ?', [stock, targetId]);
            } else if (delta !== undefined) {
                await query('UPDATE products SET stock = GREATEST(0, stock + ?) WHERE id = ?', [delta, targetId]);
            }
            const [updated] = await query('SELECT id, stock FROM products WHERE id = ?', [targetId]);
            if (updated) {
                productStore.updateStock(targetId, { stock: updated.stock });
                productStore.updateStock(existing[0].slug, { stock: updated.stock });
                return res.json({ success: true, stock: updated.stock });
            }
        }
    } catch (err) {
        console.warn('DB error in updateStock:', err.message);
    }

    const currentStock = productStore.updateStock(id, {});
    return res.json({ success: true, stock: currentStock });
}

export const updateProductStock = updateStock;

// GET /api/admin/orders
export async function getOrders(req, res) {
    const memoryOrders = orderStore.getAllOrders();
    try {
        const { status, search } = req.query;
        let sql = `
            SELECT 
                o.*,
                u.name as customer_name,
                u.email as customer_email,
                (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) as itemCount
            FROM orders o
            LEFT JOIN users u ON u.id = o.user_id
            WHERE 1=1
        `;
        const params = [];

        if (status && status !== 'all') {
            sql += ` AND o.status = ?`;
            params.push(status);
        }

        if (search) {
            sql += ` AND (o.order_number LIKE ? OR o.ship_name LIKE ? OR o.ship_email LIKE ? OR o.tracking_number LIKE ?)`;
            const term = `%${search.trim()}%`;
            params.push(term, term, term, term);
        }

        sql += ` ORDER BY o.created_at DESC`;

        const dbOrders = await query(sql, params);

        const map = new Map();
        dbOrders.forEach(o => {
            const key = o.order_number || o.id;
            if (key) {
                map.set(key, {
                    ...o,
                    id: o.order_number || o.id,
                    orderNumber: o.order_number || o.id,
                    subtotal: Number(o.subtotal),
                    shippingCost: Number(o.shipping_cost),
                    tax: Number(o.tax),
                    total: Number(o.total),
                });
            }
        });

        memoryOrders.forEach(o => {
            const key = o.orderNumber || o.id;
            if (key && !map.has(key)) {
                map.set(key, o);
            }
        });

        const merged = Array.from(map.values());
        return res.json({
            success: true,
            count: merged.length,
            orders: merged,
        });
    } catch (err) {
        console.warn('DB error in admin getOrders, returning memory orders:', err.message);
        return res.json({
            success: true,
            count: memoryOrders.length,
            orders: memoryOrders,
        });
    }
}

// GET /api/admin/orders/:id
export async function getOrderById(req, res) {
    const { id } = req.params;
    try {
        const [order] = await query(
            `SELECT o.*, u.name as user_name, u.email as user_email
             FROM orders o
             LEFT JOIN users u ON u.id = o.user_id
             WHERE o.id = ? OR o.order_number = ?`,
            [id, id]
        );

        if (order) {
            const items = await query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
            return res.json({
                success: true,
                order: {
                    ...order,
                    id: order.order_number || order.id,
                    orderNumber: order.order_number || order.id,
                    subtotal: Number(order.subtotal),
                    shippingCost: Number(order.shipping_cost),
                    tax: Number(order.tax),
                    total: Number(order.total),
                    items: items.map(it => ({
                        ...it,
                        price: Number(it.price),
                    })),
                },
            });
        }
    } catch (err) {
        console.warn('DB error in getOrderById:', err.message);
    }

    const memoryOrder = orderStore.getAllOrders().find(o => o.id === id || o.orderNumber === id);
    if (memoryOrder) {
        return res.json({ success: true, order: memoryOrder });
    }
    return res.status(404).json({ success: false, message: 'Order not found.' });
}

// PATCH /api/admin/orders/:id/status
export async function updateOrderStatus(req, res) {
    const { id } = req.params;
    const { status, trackingNumber, estimatedDelivery } = req.body;

    orderStore.updateOrderStatus(id, status, trackingNumber);

    try {
        const numericId = Number(id);
        const [order] = await query('SELECT * FROM orders WHERE id = ? OR order_number = ?', [!isNaN(numericId) ? numericId : 0, id]);
        if (order) {
            const fields = [];
            const values = [];

            if (status) {
                fields.push('status = ?');
                values.push(status);
            }
            if (trackingNumber !== undefined) {
                fields.push('tracking_number = ?');
                values.push(trackingNumber.trim() || null);
            }
            if (estimatedDelivery !== undefined) {
                fields.push('estimated_delivery = ?');
                values.push(estimatedDelivery || null);
            }

            if (fields.length) {
                values.push(order.id);
                await query(`UPDATE orders SET ${fields.join(', ')} WHERE id = ?`, values);
            }

            const [updated] = await query('SELECT * FROM orders WHERE id = ?', [order.id]);
            return res.json({ success: true, order: updated });
        }
    } catch (err) {
        console.warn('DB error in updateOrderStatus:', err.message);
    }

    const mem = orderStore.getAllOrders().find(o => o.id === id || o.orderNumber === id);
    if (mem) {
        if (status) mem.status = status;
        if (trackingNumber) mem.trackingNumber = trackingNumber;
        if (estimatedDelivery) mem.estimatedDelivery = estimatedDelivery;
        return res.json({ success: true, order: mem });
    }

    return res.json({ success: true, order: { id, status: status || 'Processing' } });
}

// GET /api/admin/users
export async function getUsers(req, res) {
    const { search, role } = req.query;

    try {
        let sql = `
            SELECT 
                u.id, u.name, u.email, u.role, u.created_at,
                COUNT(o.id) as orderCount,
                COALESCE(SUM(CASE WHEN o.status != 'Cancelled' THEN o.total ELSE 0 END), 0) as totalSpent
            FROM users u
            LEFT JOIN orders o ON o.user_id = u.id
            WHERE 1=1
        `;
        const params = [];

        if (role && role !== 'all') {
            sql += ` AND u.role = ?`;
            params.push(role);
        }

        if (search) {
            sql += ` AND (u.name LIKE ? OR u.email LIKE ?)`;
            const term = `%${search.trim()}%`;
            params.push(term, term);
        }

        sql += ` GROUP BY u.id ORDER BY u.created_at DESC`;

        const users = await query(sql, params);

        return res.json({
            success: true,
            users: users.map(u => ({
                ...u,
                orderCount: Number(u.orderCount ?? u.ordercount ?? 0),
                totalSpent: Number(u.totalSpent ?? u.totalspent ?? 0),
            })),
        });
    } catch (err) {
        console.warn('DB error in admin getUsers, using memory users:', err.message);

        const allMemUsers = [...defaultAdmins, ...Array.from(authMemoryUsers.values()).filter(u => !defaultAdmins.some(a => a.email === u.email))];
        let list = allMemUsers;
        if (role && role !== 'all') {
            list = list.filter(u => u.role === role);
        }
        if (search) {
            const q = search.toLowerCase().trim();
            list = list.filter(u => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q));
        }

        const allOrders = orderStore.getAllOrders();
        const formatted = list.map(u => {
            const userOrders = allOrders.filter(o => o.userId === u.id || (u.id === 2 && o.userId === 1));
            const totalSpent = userOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
            return {
                ...u,
                orderCount: userOrders.length,
                totalSpent: Math.round(totalSpent * 100) / 100,
            };
        });

        return res.json({ success: true, users: formatted });
    }
}

// PATCH /api/admin/users/:id/role
export async function updateUserRole(req, res) {
    const { id } = req.params;
    const { role } = req.body;

    if (!['customer', 'admin'].includes(role)) {
        return res.status(400).json({ message: "Role must be 'customer' or 'admin'" });
    }

    try {
        await query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
        const [user] = await query('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [id]);
        if (user) return res.json({ success: true, user });
    } catch (err) {
        console.warn('DB error in updateUserRole:', err.message);
    }

    const found = memoryUsers.find(u => u.id === Number(id));
    if (found) found.role = role;
    return res.json({ success: true, user: found || { id, role } });
}
