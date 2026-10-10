import { query } from '../config/database.js';
import { fallbackProducts } from '../data/fallbackData.js';

const memoryWishlists = new Map();

export async function getWishlist(req, res) {
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
    } catch (err) {
        console.warn('DB error in getWishlist, using memory:', err.message);
        const slugs = memoryWishlists.get(req.user.id) || [];
        const wishlist = fallbackProducts.filter(p => slugs.includes(p.slug)).map(p => ({
            id: p.slug, name: p.name, subtitle: p.subtitle, price: Number(p.price), image: p.image
        }));
        res.json({ wishlist });
    }
}

export async function toggleWishlist(req, res) {
    const { productSlug } = req.params;
    try {
        const [product] = await query('SELECT id FROM products WHERE slug = ?', [productSlug]);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        const existing = await query('SELECT id FROM wishlists WHERE user_id = ? AND product_id = ?', [req.user.id, product.id]);
        if (existing.length) {
            await query('DELETE FROM wishlists WHERE id = ?', [existing[0].id]);
            return res.json({ inWishlist: false });
        }
        await query('INSERT INTO wishlists (user_id, product_id) VALUES (?, ?)', [req.user.id, product.id]);
        res.json({ inWishlist: true });
    } catch (err) {
        console.warn('DB error in toggleWishlist, using memory:', err.message);
        let slugs = memoryWishlists.get(req.user.id) || [];
        let inWishlist = false;
        if (slugs.includes(productSlug)) {
            slugs = slugs.filter(s => s !== productSlug);
        } else {
            slugs.push(productSlug);
            inWishlist = true;
        }
        memoryWishlists.set(req.user.id, slugs);
        res.json({ inWishlist });
    }
}

export async function getWishlistIds(req, res) {
    try {
        const rows = await query(
            `SELECT p.slug FROM wishlists w JOIN products p ON p.id = w.product_id WHERE w.user_id = ?`,
            [req.user.id]
        );
        res.json({ ids: rows.map(r => r.slug) });
    } catch (err) {
        console.warn('DB error in getWishlistIds, using memory:', err.message);
        res.json({ ids: memoryWishlists.get(req.user.id) || [] });
    }
}