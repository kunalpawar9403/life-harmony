import { query } from '../config/database.js';

export async function getWishlist(req, res, next) {
    try {
        const rows = await query(
            `SELECT p.slug, p.name, p.subtitle, p.price, p.image
       FROM wishlists w JOIN products p ON p.id = w.product_id
       WHERE w.user_id = ? ORDER BY w.added_at DESC`,
            [req.user.id]
        );
        res.json({
            wishlist: rows.map(r => ({
                id: r.slug, name: r.name, subtitle: r.subtitle, price: Number(r.price), image: r.image,
            }))
        });
    } catch (err) { next(err); }
}

export async function toggleWishlist(req, res, next) {
    try {
        const { productSlug } = req.params;
        const [product] = await query('SELECT id FROM products WHERE slug = ?', [productSlug]);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        const existing = await query('SELECT id FROM wishlists WHERE user_id = ? AND product_id = ?', [req.user.id, product.id]);
        if (existing.length) {
            await query('DELETE FROM wishlists WHERE id = ?', [existing[0].id]);
            return res.json({ inWishlist: false });
        }
        await query('INSERT INTO wishlists (user_id, product_id) VALUES (?, ?)', [req.user.id, product.id]);
        res.json({ inWishlist: true });
    } catch (err) { next(err); }
}

export async function getWishlistIds(req, res, next) {
    try {
        const rows = await query(
            `SELECT p.slug FROM wishlists w JOIN products p ON p.id = w.product_id WHERE w.user_id = ?`,
            [req.user.id]
        );
        res.json({ ids: rows.map(r => r.slug) });
    } catch (err) { next(err); }
}