import { query } from '../config/database.js';
import { getFallbackProducts, fallbackProducts, fallbackGoals } from '../data/fallbackData.js';

function mapProduct(row, { goals = [], ingredients = [], benefits = [], reviews = [] } = {}) {
    return {
        id: row.slug,          // frontend uses slug as id
        dbId: row.id,
        slug: row.slug,
        name: row.name,
        subtitle: row.subtitle,
        description: row.description,
        price: Number(row.price),
        originalPrice: row.original_price ? Number(row.original_price) : null,
        image: row.image,
        category: row.category,
        stock: row.stock,
        rating: Number(row.rating),
        goals,
        ingredients,
        benefits,
        reviews,
    };
}

async function hydrate(rows) {
    if (!rows.length) return [];
    const ids = rows.map(r => r.id);

    const [goalRows, ingRows, benRows, revRows] = await Promise.all([
        query(`SELECT pg.product_id, g.slug FROM product_goals pg JOIN goals g ON g.id = pg.goal_id WHERE pg.product_id IN (${ids.map(() => '?').join(',')})`, ids),
        query(`SELECT * FROM product_ingredients WHERE product_id IN (${ids.map(() => '?').join(',')}) ORDER BY sort_order`, ids),
        query(`SELECT * FROM product_benefits WHERE product_id IN (${ids.map(() => '?').join(',')})`, ids),
        query(`SELECT id, product_id, name, rating, title, text, created_at FROM product_reviews WHERE product_id IN (${ids.map(() => '?').join(',')}) ORDER BY created_at DESC`, ids),
    ]);

    const goalsMap = {}, ingMap = {}, benMap = {}, revMap = {};
    goalRows.forEach(g => (goalsMap[g.product_id] ||= []).push(g.slug));
    ingRows.forEach(i => (ingMap[i.product_id] ||= []).push({ name: i.name, amount: i.amount, dv: i.dv }));
    benRows.forEach(b => (benMap[b.product_id] ||= []).push(b.text));
    revRows.forEach(r => (revMap[r.product_id] ||= []).push({
        id: r.id, name: r.name, rating: r.rating, title: r.title, text: r.text,
        date: r.created_at.toISOString().slice(0, 10),
    }));

    return rows.map(r => mapProduct(r, {
        goals: goalsMap[r.id] || [],
        ingredients: ingMap[r.id] || [],
        benefits: benMap[r.id] || [],
        reviews: revMap[r.id] || [],
    }));
}

export async function listProducts(req, res, next) {
    try {
        const { category, goal, q, maxPrice, sort } = req.query;
        const where = [];
        const params = [];

        if (category) { where.push('p.category = ?'); params.push(category); }
        if (maxPrice) { where.push('p.price <= ?'); params.push(Number(maxPrice)); }
        if (q) {
            where.push('(p.name LIKE ? OR p.subtitle LIKE ?)');
            params.push(`%${q}%`, `%${q}%`);
        }

        let sql = 'SELECT p.* FROM products p';
        if (goal) {
            sql += ' JOIN product_goals pg ON pg.product_id = p.id JOIN goals g ON g.id = pg.goal_id';
            where.push('g.slug = ?'); params.push(goal);
        }
        if (where.length) sql += ' WHERE ' + where.join(' AND ');

        switch (sort) {
            case 'price-asc': sql += ' ORDER BY p.price ASC'; break;
            case 'price-desc': sql += ' ORDER BY p.price DESC'; break;
            case 'name': sql += ' ORDER BY p.name ASC'; break;
            default: sql += ' ORDER BY p.id ASC';
        }

        const rows = await query(sql, params);
        const items = await hydrate(rows);
        res.json({ products: items });
    } catch (err) {
        console.warn('Database query failed in listProducts; returning fallback catalog:', err.message);
        res.json({ products: getFallbackProducts(req.query) });
    }
}

export async function getProduct(req, res, next) {
    try {
        const { id } = req.params; // slug
        const rows = await query('SELECT * FROM products WHERE slug = ?', [id]);
        if (!rows.length) {
            const fallback = fallbackProducts.find(p => p.slug === id);
            if (fallback) {
                return res.json({ product: fallback, related: [] });
            }
            return res.status(404).json({ message: 'Product not found' });
        }
        const [product] = await hydrate(rows);

        // related: same goal, different product
        let related = [];
        if (product.goals.length) {
            const placeholders = product.goals.map(() => '?').join(',');
            const relRows = await query(
                `SELECT DISTINCT p.* FROM products p
         JOIN product_goals pg ON pg.product_id = p.id
         JOIN goals g ON g.id = pg.goal_id
         WHERE g.slug IN (${placeholders}) AND p.id != ?
         LIMIT 4`,
                [...product.goals, rows[0].id]
            );
            related = await hydrate(relRows);
        }

        res.json({ product, related });
    } catch (err) {
        console.warn('Database query failed in getProduct; returning fallback:', err.message);
        const fallback = fallbackProducts.find(p => p.slug === req.params.id) || fallbackProducts[0];
        res.json({ product: fallback, related: [] });
    }
}

export async function listGoals(_req, res, next) {
    try {
        const rows = await query('SELECT slug AS id, label FROM goals ORDER BY id');
        res.json({ goals: [{ id: 'all', label: 'All' }, ...rows] });
    } catch (err) {
        console.warn('Database query failed in listGoals; returning fallback goals:', err.message);
        res.json({ goals: fallbackGoals });
    }
}