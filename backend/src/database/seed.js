import { pool, query } from '../config/database.js';
import { hashPassword } from '../utils/password.js';

// ---------- PRODUCT DATA ----------
const products = [
    // Vitamins
    {
        slug: 'vitamin-d3-k2', name: 'Vitamin D3+K2', subtitle: 'With Coconut MCT Oil', price: 1499.00, category: 'vitamins', image: 'https://images.unsplash.com/photo-1664786908163-85ca46f85138?crop=entropy&cs=srgb&fm=jpg&q=85', goals: ['immunity', 'heart'], benefits: ['Supports bone strength', 'Immune system booster', 'Heart health'], ingredients: [
            { name: 'Vitamin D3 (Cholecalciferol)', amount: '62.5 mcg (2500 IU)', dv: '313%' },
            { name: 'Vitamin K2 (as MK-7)', amount: '100 mcg', dv: '83%' },
            { name: 'Coconut MCT Oil', amount: '250 mg', dv: '†' },
        ]
    },
    {
        slug: 'vitamin-c-zinc', name: 'Vitamin C+Zinc', subtitle: 'Immune Booster', price: 899.00, category: 'vitamins', image: 'https://images.unsplash.com/photo-1633171029787-3a1022cfc922?crop=entropy&cs=srgb&fm=jpg&q=85', goals: ['immunity'], benefits: ['Antioxidant support', 'Cold & flu defense', 'Skin health'], ingredients: [
            { name: 'Vitamin C', amount: '500 mg', dv: '556%' },
            { name: 'Zinc', amount: '15 mg', dv: '136%' },
        ]
    },
    {
        slug: 'b-complex', name: 'B-Complex', subtitle: 'Energy Support', price: 999.00, category: 'vitamins', image: 'https://images.unsplash.com/photo-1664216294573-b28282de564b?crop=entropy&cs=srgb&fm=jpg&q=85', goals: ['energy'], benefits: ['Cellular energy', 'Mental focus', 'Reduces fatigue'], ingredients: [
            { name: 'Vitamin B12', amount: '500 mcg', dv: '20833%' },
            { name: 'Vitamin B6', amount: '10 mg', dv: '588%' },
        ]
    },
    {
        slug: 'multivitamin-plus', name: 'Multivitamin+', subtitle: 'Daily Essentials', price: 1299.00, category: 'vitamins', image: 'https://images.unsplash.com/photo-1544829894-eb023ba95a38?crop=entropy&cs=srgb&fm=jpg&q=85', goals: ['immunity', 'energy', 'heart'], benefits: ['Complete daily nutrition', 'Multiple system support'], ingredients: [
            { name: 'Multivitamin Blend', amount: '1000 mg', dv: '†' },
        ]
    },

    // Supplements
    {
        slug: 'omega-3-fish-oil', name: 'Omega-3 Fish oil', subtitle: 'Original flavour', price: 1199.00, category: 'supplements', image: 'https://images.unsplash.com/photo-1693996045899-7cf0ac0229c7?crop=entropy&cs=srgb&fm=jpg&q=85', goals: ['heart'], benefits: ['Cardiovascular support', 'Brain function', 'Anti-inflammatory'], ingredients: [
            { name: 'EPA', amount: '360 mg', dv: '†' },
            { name: 'DHA', amount: '240 mg', dv: '†' },
        ]
    },
    {
        slug: 'marine-collagen-peptides', name: 'Marine Collagen Peptides', subtitle: '34 Servings', price: 799.00, category: 'supplements', image: 'https://images.unsplash.com/photo-1693996046865-19217d179161?crop=entropy&cs=srgb&fm=jpg&q=85', goals: ['beauty'], benefits: ['Skin elasticity', 'Hair & nails', 'Joint support'], ingredients: [
            { name: 'Marine Collagen', amount: '10 g', dv: '†' },
        ]
    },
    { slug: 'dietary-supplement-set', name: 'A set of Dietary supplements', subtitle: 'D3+K2, Collagen Peptides', price: 1699.00, category: 'supplements', image: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?crop=entropy&cs=srgb&fm=jpg&q=85', goals: ['immunity', 'beauty'], benefits: ['Complete wellness set', 'Bone + skin support'], ingredients: [] },

    // Pick of month
    { slug: 'organic-collagen-peptides', name: 'Organic Collagen Peptides', subtitle: 'Chocolate flavour', price: 1899.00, category: 'pick_of_month', image: 'https://images.unsplash.com/photo-1693996045300-521e9d08cabc?crop=entropy&cs=srgb&fm=jpg&q=85', goals: ['beauty'], benefits: ['Youthful skin', 'Hair growth', 'Joint mobility'], ingredients: [] },
    { slug: 'hydrate-electrolytes', name: 'Hydrate Electrolytes', subtitle: 'Cherry Pomegranate', price: 1149.00, category: 'pick_of_month', image: 'https://images.unsplash.com/photo-1664216294580-079bc527ae49?crop=entropy&cs=srgb&fm=jpg&q=85', goals: ['energy'], benefits: ['Hydration', 'Muscle recovery', 'Endurance'], ingredients: [] },
    { slug: 'energy-immunity', name: 'Energy & Immunity', subtitle: 'Premium dietary supplement', price: 949.00, category: 'pick_of_month', image: 'https://images.unsplash.com/photo-1633171029787-3a1022cfc922?crop=entropy&cs=srgb&fm=jpg&q=85', goals: ['immunity', 'energy'], benefits: ['Daily immunity', 'Sustained energy'], ingredients: [] },
    { slug: 'omega-complex', name: 'Omega Complex', subtitle: 'Heart Support', price: 1099.00, category: 'pick_of_month', image: 'https://images.unsplash.com/photo-1693996045899-7cf0ac0229c7?crop=entropy&cs=srgb&fm=jpg&q=85', goals: ['heart'], benefits: ['Heart health', 'Brain support'], ingredients: [] },
    { slug: 'turmeric-curcumin', name: 'Turmeric Curcumin', subtitle: 'Anti-inflammatory', price: 849.00, category: 'pick_of_month', image: 'https://images.unsplash.com/photo-1544829894-eb023ba95a38?crop=entropy&cs=srgb&fm=jpg&q=85', goals: ['immunity', 'heart'], benefits: ['Anti-inflammatory', 'Joint health'], ingredients: [] },
    { slug: 'magnesium-glycinate', name: 'Magnesium Glycinate', subtitle: 'Sleep & Recovery', price: 799.00, category: 'pick_of_month', image: 'https://images.unsplash.com/photo-1664216294573-b28282de564b?crop=entropy&cs=srgb&fm=jpg&q=85', goals: ['sleep'], benefits: ['Better sleep', 'Muscle recovery', 'Calm mood'], ingredients: [] },

    // Offer set
    { slug: 'great-offer-set', name: 'A set of Dietary supplements', subtitle: 'Vitamin D3+K2 + Organic Collagen Peptides', price: 1999.00, original_price: 2499.00, category: 'offer_set', image: 'https://images.unsplash.com/photo-1664786908163-85ca46f85138?crop=entropy&cs=srgb&fm=jpg&q=85', goals: ['beauty', 'immunity'], benefits: ['Complete wellness set', 'Save ₹500'], ingredients: [] },
];

const goals = [
    { slug: 'immunity', label: 'Immunity' },
    { slug: 'energy', label: 'Energy' },
    { slug: 'sleep', label: 'Sleep' },
    { slug: 'beauty', label: 'Beauty' },
    { slug: 'heart', label: 'Heart' },
];

const blogPosts = [
    {
        slug: 'vitamin-d3-k2-guide', title: 'The Complete Guide to Vitamin D3 + K2', category: 'Supplements', excerpt: 'Why these two vitamins work better together, and how to choose the right dosage.', image: 'https://images.unsplash.com/photo-1707129785947-ddc627a8bab9?crop=entropy&cs=srgb&fm=jpg&q=85', read_time: '6 min read', is_featured: 1, published_at: '2025-06-18', content: [
            'Vitamin D3 and K2 are often paired together for a reason: they work synergistically to support bone health, immune function, and cardiovascular wellness.',
            'Vitamin D3 helps your body absorb calcium from the gut, while vitamin K2 directs that calcium into your bones and teeth — rather than letting it deposit in your arteries.',
            'Most adults benefit from 1000–4000 IU of D3 daily, paired with 100–200 mcg of MK-7 form K2.',
        ]
    },
    {
        slug: 'morning-habits-energy', title: '5 Morning Habits for All-Day Energy', category: 'Lifestyle', excerpt: 'Small, science-backed changes you can make before 9 a.m. to feel more focused.', image: 'https://images.unsplash.com/photo-1600791344609-2836239516c3?crop=entropy&cs=srgb&fm=jpg&q=85', read_time: '4 min read', published_at: '2025-06-10', content: [
            'How you spend the first hour of your day sets the tone for everything that follows.',
            '1. Get sunlight within 30 minutes of waking. 2. Drink water before coffee. 3. Move your body for 10 minutes.',
        ]
    },
    {
        slug: 'collagen-research', title: 'Collagen: What the Research Actually Says', category: 'Nutrition', excerpt: 'We break down the latest studies on marine collagen.', image: 'https://images.unsplash.com/photo-1624362772755-4d5843e67047?crop=entropy&cs=srgb&fm=jpg&q=85', read_time: '8 min read', published_at: '2025-06-02', content: [
            'Collagen supplements have exploded in popularity — but what does the evidence say?',
            'Multiple randomized controlled trials suggest that 2.5–10g of hydrolysed collagen peptides daily can improve skin elasticity.',
        ]
    },
];

async function seed() {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        console.log('🌱 Seeding database...');

        // Clear existing (respecting FKs)
        await conn.query('SET FOREIGN_KEY_CHECKS = 0');
        for (const t of ['order_items', 'orders', 'cart_items', 'carts', 'wishlists', 'addresses', 'product_reviews', 'product_benefits', 'product_ingredients', 'product_goals', 'products', 'goals', 'blog_posts']) {
            await conn.query(`TRUNCATE TABLE ${t}`);
        }
        await conn.query('SET FOREIGN_KEY_CHECKS = 1');

        // Insert goals
        const goalMap = {};
        for (const g of goals) {
            const [r] = await conn.execute('INSERT INTO goals (slug, label) VALUES (?, ?)', [g.slug, g.label]);
            goalMap[g.slug] = r.insertId;
        }
        console.log(`  ✓ ${goals.length} goals`);

        // Insert products
        for (const p of products) {
            const [r] = await conn.execute(
                `INSERT INTO products (slug, name, subtitle, price, original_price, image, category, is_featured)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [p.slug, p.name, p.subtitle, p.price, p.original_price || null, p.image, p.category, p.category === 'offer_set' ? 1 : 0]
            );
            const pid = r.insertId;

            for (const g of p.goals || []) {
                if (goalMap[g]) {
                    await conn.execute('INSERT IGNORE INTO product_goals (product_id, goal_id) VALUES (?, ?)', [pid, goalMap[g]]);
                }
            }
            for (const b of p.benefits || []) {
                await conn.execute('INSERT INTO product_benefits (product_id, text) VALUES (?, ?)', [pid, b]);
            }
            let order = 0;
            for (const ing of p.ingredients || []) {
                await conn.execute(
                    'INSERT INTO product_ingredients (product_id, name, amount, dv, sort_order) VALUES (?, ?, ?, ?, ?)',
                    [pid, ing.name, ing.amount, ing.dv, order++]
                );
            }
            // Seed a couple of generic reviews
            await conn.execute(
                `INSERT INTO product_reviews (product_id, name, rating, title, text) VALUES (?, ?, ?, ?, ?)`,
                [pid, 'Emma S.', 5, 'Feel amazing already!', 'Been using this for 3 weeks now. My energy is way up.']
            );
            await conn.execute(
                `INSERT INTO product_reviews (product_id, name, rating, title, text) VALUES (?, ?, ?, ?, ?)`,
                [pid, 'Michael T.', 4, 'Solid quality', 'Great product, easy to swallow capsules.']
            );
        }
        console.log(`  ✓ ${products.length} products + reviews`);

        // Insert blog posts
        for (const b of blogPosts) {
            await conn.execute(
                `INSERT INTO blog_posts (slug, title, category, excerpt, content, image, read_time, is_featured, published_at)
         VALUES (?, ?, ?, ?, CAST(? AS JSON), ?, ?, ?, ?)`,
                [b.slug, b.title, b.category, b.excerpt, JSON.stringify(b.content), b.image, b.read_time, b.is_featured || 0, b.published_at]
            );
        }
        console.log(`  ✓ ${blogPosts.length} blog posts`);

        // Seed demo account
        const demoHash = await hashPassword('password123');
        await conn.execute(
            'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)',
            ['Demo Member', 'demo@lifeharmony.com', demoHash]
        );
        console.log('  ✓ Demo user (demo@lifeharmony.com / password123)');

        await conn.commit();
        console.log('✅ Seed complete.');
    } catch (err) {
        await conn.rollback();
        console.error('❌ Seed failed:', err.message);
        throw err;
    } finally {
        conn.release();
        await pool.end();
    }
}

seed().catch(() => process.exit(1));