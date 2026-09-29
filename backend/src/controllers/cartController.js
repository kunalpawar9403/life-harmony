import { query } from '../config/database.js';

async function getOrCreateCart(userId) {
    const existing = await query('SELECT id FROM carts WHERE user_id = ?', [userId]);
    if (existing.length) return existing[0].id;
    const r = await query('INSERT INTO carts (user_id) VALUES (?)', [userId]);
    return r.insertId;
}

async function cartWithItems(userId) {
    const cartId = await getOrCreateCart(userId);
    const rows = await query(
        `SELECT ci.product_id, ci.qty, p.slug, p.name, p.subtitle, p.price, p.image
     FROM cart_items ci JOIN products p ON p.id = ci.product_id
     WHERE ci.cart_id = ?`,
        [cartId]
    );
    const items = rows.map(r => ({
        id: r.slug,
        productId: r.product_id,
        name: r.name,
        subtitle: r.subtitle,
        price: Number(r.price),
        image: r.image,
        qty: r.qty,
    }));
    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    const count = items.reduce((s, i) => s + i.qty, 0);
    return { items, subtotal, count };
}

export async function getCart(req, res, next) {
    try {
        res.json(await cartWithItems(req.user.id));
    } catch (err) { next(err); }
}

export async function addItem(req, res, next) {
    try {
        const { productSlug, qty = 1 } = req.body;
        const [product] = await query('SELECT id FROM products WHERE slug = ?', [productSlug]);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        const cartId = await getOrCreateCart(req.user.id);
        const existing = await query('SELECT id, qty FROM cart_items WHERE cart_id = ? AND product_id = ?', [cartId, product.id]);

        if (existing.length) {
            await query('UPDATE cart_items SET qty = qty + ? WHERE id = ?', [qty, existing[0].id]);
        } else {
            await query('INSERT INTO cart_items (cart_id, product_id, qty) VALUES (?, ?, ?)', [cartId, product.id, qty]);
        }
        res.json(await cartWithItems(req.user.id));
    } catch (err) { next(err); }
}

export async function updateItem(req, res, next) {
    try {
        const { productSlug } = req.params;
        const { qty } = req.body;
        const [product] = await query('SELECT id FROM products WHERE slug = ?', [productSlug]);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        const cartId = await getOrCreateCart(req.user.id);

        if (qty <= 0) {
            await query('DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?', [cartId, product.id]);
        } else {
            await query('UPDATE cart_items SET qty = ? WHERE cart_id = ? AND product_id = ?', [qty, cartId, product.id]);
        }
        res.json(await cartWithItems(req.user.id));
    } catch (err) { next(err); }
}

export async function removeItem(req, res, next) {
    try {
        const { productSlug } = req.params;
        const [product] = await query('SELECT id FROM products WHERE slug = ?', [productSlug]);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        const cartId = await getOrCreateCart(req.user.id);
        await query('DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?', [cartId, product.id]);
        res.json(await cartWithItems(req.user.id));
    } catch (err) { next(err); }
}

export async function clearCart(req, res, next) {
    try {
        const cartId = await getOrCreateCart(req.user.id);
        await query('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);
        res.json({ items: [], subtotal: 0, count: 0 });
    } catch (err) { next(err); }
}