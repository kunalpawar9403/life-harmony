import { query } from '../config/database.js';
import { fallbackProducts } from '../data/fallbackData.js';

const memoryCarts = new Map();

function getMemoryCart(userId) {
    if (!memoryCarts.has(userId)) memoryCarts.set(userId, []);
    const items = memoryCarts.get(userId);
    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    const count = items.reduce((s, i) => s + i.qty, 0);
    return { items, subtotal, count };
}

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

export async function getCart(req, res) {
    try {
        const cart = await cartWithItems(req.user.id);
        res.json(cart);
    } catch (err) {
        console.warn('DB error in getCart, using memory cart:', err.message);
        res.json(getMemoryCart(req.user.id));
    }
}

export async function addItem(req, res) {
    const { productSlug, qty = 1 } = req.body;
    try {
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
    } catch (err) {
        console.warn('DB error in addItem, using memory cart:', err.message);
        const fb = fallbackProducts.find(p => p.slug === productSlug) || {
            slug: productSlug,
            name: productSlug,
            subtitle: 'Supplements',
            price: 999,
            image: ''
        };
        const items = memoryCarts.get(req.user.id) || [];
        const existingIndex = items.findIndex(i => i.id === productSlug);
        if (existingIndex >= 0) {
            items[existingIndex].qty += qty;
        } else {
            items.push({
                id: fb.slug,
                productId: fb.id || 1,
                name: fb.name,
                subtitle: fb.subtitle,
                price: Number(fb.price),
                image: fb.image,
                qty
            });
        }
        memoryCarts.set(req.user.id, items);
        res.json(getMemoryCart(req.user.id));
    }
}

export async function updateItem(req, res) {
    const { productSlug } = req.params;
    const { qty } = req.body;
    try {
        const [product] = await query('SELECT id FROM products WHERE slug = ?', [productSlug]);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        const cartId = await getOrCreateCart(req.user.id);

        if (qty <= 0) {
            await query('DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?', [cartId, product.id]);
        } else {
            await query('UPDATE cart_items SET qty = ? WHERE cart_id = ? AND product_id = ?', [qty, cartId, product.id]);
        }
        res.json(await cartWithItems(req.user.id));
    } catch (err) {
        console.warn('DB error in updateItem, using memory cart:', err.message);
        let items = memoryCarts.get(req.user.id) || [];
        if (qty <= 0) {
            items = items.filter(i => i.id !== productSlug);
        } else {
            const item = items.find(i => i.id === productSlug);
            if (item) item.qty = qty;
        }
        memoryCarts.set(req.user.id, items);
        res.json(getMemoryCart(req.user.id));
    }
}

export async function removeItem(req, res) {
    const { productSlug } = req.params;
    try {
        const [product] = await query('SELECT id FROM products WHERE slug = ?', [productSlug]);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        const cartId = await getOrCreateCart(req.user.id);
        await query('DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?', [cartId, product.id]);
        res.json(await cartWithItems(req.user.id));
    } catch (err) {
        console.warn('DB error in removeItem, using memory cart:', err.message);
        let items = memoryCarts.get(req.user.id) || [];
        items = items.filter(i => i.id !== productSlug);
        memoryCarts.set(req.user.id, items);
        res.json(getMemoryCart(req.user.id));
    }
}

export async function clearCart(req, res) {
    try {
        const cartId = await getOrCreateCart(req.user.id);
        await query('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);
        res.json({ items: [], subtotal: 0, count: 0 });
    } catch (err) {
        console.warn('DB error in clearCart, using memory cart:', err.message);
        memoryCarts.set(req.user.id, []);
        res.json({ items: [], subtotal: 0, count: 0 });
    }
}