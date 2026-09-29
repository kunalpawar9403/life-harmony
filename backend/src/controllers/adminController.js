import { pool, query } from '../config/database.js';

// GET /api/admin/stats
export async function getStats(_req, res, next) {
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
             WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 14 DAY)
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

        res.json({
            success: true,
            totalRevenue: Number(stats.totalRevenue) || 0,
            totalOrders: Number(stats.totalOrders) || 0,
            processingOrders: Number(stats.processingOrders) || 0,
            shippedOrders: Number(stats.shippedOrders) || 0,
            deliveredOrders: Number(stats.deliveredOrders) || 0,
            cancelledOrders: Number(stats.cancelledOrders) || 0,
            totalCustomers: Number(usersCount?.count) || 0,
            totalUsers: Number(totalUsersCount?.count) || 0,
            totalProducts: Number(productsCount?.count) || 0,
            lowStockProducts: Number(lowStockCount?.count) || 0,
            dailyTrends: dailyTrends.map(d => ({
                date: d.date instanceof Date ? d.date.toISOString().slice(0, 10) : String(d.date),
                orders: Number(d.orderCount),
                revenue: Number(d.dailyRevenue),
            })),
            recentOrders,
            categoryCounts,
        });
    } catch (err) {
        next(err);
    }
}

// GET /api/admin/products
export async function getProducts(req, res, next) {
    try {
        const { search, category, sort } = req.query;
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

        res.json({ success: true, count: formatted.length, products: formatted });
    } catch (err) {
        next(err);
    }
}

// POST /api/admin/products
export async function createProduct(req, res, next) {
    const conn = await pool.getConnection();
    try {
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
                    await conn.execute('INSERT IGNORE INTO product_goals (product_id, goal_id) VALUES (?, ?)', [productId, gRows[0].id]);
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
        res.status(201).json({ success: true, product: created });
    } catch (err) {
        await conn.rollback();
        next(err);
    } finally {
        conn.release();
    }
}

// PUT /api/admin/products/:id
export async function updateProduct(req, res, next) {
    const conn = await pool.getConnection();
    try {
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

        const [existing] = await conn.execute('SELECT id FROM products WHERE id = ?', [id]);
        if (!existing.length) return res.status(404).json({ message: 'Product not found.' });

        await conn.beginTransaction();

        await conn.execute(
            `UPDATE products SET
                name = COALESCE(?, name),
                subtitle = COALESCE(?, subtitle),
                description = COALESCE(?, description),
                price = COALESCE(?, price),
                original_price = ?,
                image = COALESCE(?, image),
                category = COALESCE(?, category),
                stock = COALESCE(?, stock),
                is_featured = COALESCE(?, is_featured)
             WHERE id = ?`,
            [
                name !== undefined ? name.trim() : null,
                subtitle !== undefined ? subtitle.trim() : null,
                description !== undefined ? description.trim() : null,
                price !== undefined ? price : null,
                originalPrice !== undefined ? (originalPrice || null) : null,
                image !== undefined ? image.trim() : null,
                category || null,
                stock !== undefined ? stock : null,
                isFeatured !== undefined ? (isFeatured ? 1 : 0) : null,
                id,
            ]
        );

        if (Array.isArray(goals)) {
            await conn.execute('DELETE FROM product_goals WHERE product_id = ?', [id]);
            for (const gSlug of goals) {
                const [gRows] = await conn.execute('SELECT id FROM goals WHERE slug = ?', [gSlug]);
                if (gRows.length) {
                    await conn.execute('INSERT INTO product_goals (product_id, goal_id) VALUES (?, ?)', [id, gRows[0].id]);
                }
            }
        }

        if (Array.isArray(benefits)) {
            await conn.execute('DELETE FROM product_benefits WHERE product_id = ?', [id]);
            for (const text of benefits) {
                if (text && text.trim()) {
                    await conn.execute('INSERT INTO product_benefits (product_id, text) VALUES (?, ?)', [id, text.trim()]);
                }
            }
        }

        await conn.commit();

        const [updated] = await query('SELECT * FROM products WHERE id = ?', [id]);
        res.json({ success: true, product: updated });
    } catch (err) {
        await conn.rollback();
        next(err);
    } finally {
        conn.release();
    }
}

// PATCH /api/admin/products/:id/stock
export async function updateProductStock(req, res, next) {
    try {
        const { id } = req.params;
        const { stock, delta } = req.body;

        if (stock !== undefined) {
            await query('UPDATE products SET stock = ? WHERE id = ?', [Math.max(0, Number(stock)), id]);
        } else if (delta !== undefined) {
            await query('UPDATE products SET stock = GREATEST(0, stock + ?) WHERE id = ?', [Number(delta), id]);
        } else {
            return res.status(400).json({ message: 'Must provide stock or delta.' });
        }

        const [product] = await query('SELECT id, name, stock FROM products WHERE id = ?', [id]);
        res.json({ success: true, product });
    } catch (err) {
        next(err);
    }
}

// DELETE /api/admin/products/:id
export async function deleteProduct(req, res, next) {
    try {
        const { id } = req.params;
        const [existing] = await query('SELECT id, name FROM products WHERE id = ?', [id]);
        if (!existing) return res.status(404).json({ message: 'Product not found.' });

        await query('DELETE FROM products WHERE id = ?', [id]);
        res.json({ success: true, message: `Product '${existing.name}' deleted successfully.` });
    } catch (err) {
        next(err);
    }
}

// GET /api/admin/orders
export async function getOrders(req, res, next) {
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

        const orders = await query(sql, params);

        res.json({
            success: true,
            count: orders.length,
            orders: orders.map(o => ({
                ...o,
                subtotal: Number(o.subtotal),
                shippingCost: Number(o.shipping_cost),
                tax: Number(o.tax),
                total: Number(o.total),
            })),
        });
    } catch (err) {
        next(err);
    }
}

// GET /api/admin/orders/:id
export async function getOrderById(req, res, next) {
    try {
        const { id } = req.params;
        const [order] = await query(
            `SELECT o.*, u.name as user_name, u.email as user_email
             FROM orders o
             LEFT JOIN users u ON u.id = o.user_id
             WHERE o.id = ? OR o.order_number = ?`,
            [id, id]
        );

        if (!order) return res.status(404).json({ message: 'Order not found.' });

        const items = await query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);

        res.json({
            success: true,
            order: {
                ...order,
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
    } catch (err) {
        next(err);
    }
}

// PATCH /api/admin/orders/:id/status
export async function updateOrderStatus(req, res, next) {
    try {
        const { id } = req.params;
        const { status, trackingNumber, estimatedDelivery } = req.body;

        const [order] = await query('SELECT * FROM orders WHERE id = ?', [id]);
        if (!order) return res.status(404).json({ message: 'Order not found.' });

        const fields = [];
        const values = [];

        if (status) {
            const allowed = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];
            if (!allowed.includes(status)) {
                return res.status(400).json({ message: `Status must be one of: ${allowed.join(', ')}` });
            }
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

        if (!fields.length) {
            return res.json({ success: true, order });
        }

        values.push(id);
        await query(`UPDATE orders SET ${fields.join(', ')} WHERE id = ?`, values);

        const [updated] = await query('SELECT * FROM orders WHERE id = ?', [id]);
        res.json({ success: true, order: updated });
    } catch (err) {
        next(err);
    }
}

// GET /api/admin/users
export async function getUsers(req, res, next) {
    try {
        const { search, role } = req.query;
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

        res.json({
            success: true,
            users: users.map(u => ({
                ...u,
                orderCount: Number(u.orderCount),
                totalSpent: Number(u.totalSpent),
            })),
        });
    } catch (err) {
        next(err);
    }
}

// PATCH /api/admin/users/:id/role
export async function updateUserRole(req, res, next) {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!['customer', 'admin'].includes(role)) {
            return res.status(400).json({ message: "Role must be 'customer' or 'admin'" });
        }

        // Prevent self-demotion if requested user is demoting themselves
        if (req.user.id === Number(id) && role !== 'admin') {
            return res.status(400).json({ message: 'You cannot demote yourself from admin.' });
        }

        await query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
        const [user] = await query('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [id]);

        res.json({ success: true, user });
    } catch (err) {
        next(err);
    }
}
