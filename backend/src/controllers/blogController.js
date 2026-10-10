import { query } from '../config/database.js';
import { fallbackBlogPosts } from '../data/fallbackData.js';

export async function listPosts(req, res, next) {
    try {
        const { category, q } = req.query;
        const where = [];
        const params = [];
        if (category && category !== 'All') { where.push('category = ?'); params.push(category); }
        if (q) { where.push('(title LIKE ? OR excerpt LIKE ?)'); params.push(`%${q}%`, `%${q}%`); }

        const sql = `SELECT id, slug, title, category, excerpt, image, read_time, is_featured, published_at
                 FROM blog_posts ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
                 ORDER BY published_at DESC`;
        const rows = await query(sql, params);

        const posts = rows.map(r => ({
            id: r.slug,
            slug: r.slug,
            title: r.title,
            category: r.category,
            excerpt: r.excerpt,
            image: r.image,
            readTime: r.read_time,
            date: r.published_at,
            featured: !!r.is_featured,
        }));

        res.json({
            featured: posts.find(p => p.featured) || null,
            posts: posts.filter(p => !p.featured),
        });
    } catch (err) {
        console.warn('Database query failed in listPosts, returning fallback blog posts:', err.message);
        res.json({
            featured: fallbackBlogPosts.find(p => p.featured) || fallbackBlogPosts[0],
            posts: fallbackBlogPosts.filter(p => !p.featured),
        });
    }
}

export async function getPost(req, res, next) {
    try {
        const [row] = await query('SELECT * FROM blog_posts WHERE slug = ?', [req.params.slug]);
        if (!row) {
            const fallback = fallbackBlogPosts.find(p => p.slug === req.params.slug);
            if (fallback) return res.json({ post: fallback });
            return res.status(404).json({ message: 'Post not found' });
        }

        let content = row.content;
        if (typeof content === 'string') content = JSON.parse(content);

        res.json({
            post: {
                id: row.slug,
                title: row.title,
                category: row.category,
                excerpt: row.excerpt,
                image: row.image,
                readTime: row.read_time,
                date: row.published_at,
                content,
            },
        });
    } catch (err) {
        console.warn('Database query failed in getPost, returning fallback:', err.message);
        const fallback = fallbackBlogPosts.find(p => p.slug === req.params.slug) || fallbackBlogPosts[0];
        res.json({ post: fallback });
    }
}