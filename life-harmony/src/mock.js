// src/mock.js
// Static UI assets + API helper functions with automatic graceful fallbacks.
// When the backend/database is live, data comes from the MySQL API.
// If the database is offline or not yet connected in the cloud, it seamlessly falls back to the embedded catalog.

import api from './lib/api';
import { supabase } from './lib/supabase';

// ---------------------------------------------------------------------------
// 1. Static images used in decorative sections.
// ---------------------------------------------------------------------------
export const blogImages = {
    citrus:
        'https://images.unsplash.com/photo-1707129785947-ddc627a8bab9?crop=entropy&cs=srgb&fm=jpg&q=85',
    woman:
        'https://images.unsplash.com/photo-1600791344609-2836239516c3?crop=entropy&cs=srgb&fm=jpg&q=85',
    pills:
        'https://images.unsplash.com/photo-1624362772755-4d5843e67047?crop=entropy&cs=srgb&fm=jpg&q=85',
};

// ---------------------------------------------------------------------------
// 2. Hero product display text.
// ---------------------------------------------------------------------------
export const heroProduct = {
    name: 'Vitamin D3+K2',
    subtitle: 'with Coconut MCT Oil',
    flavor: 'original flavour',
    details: '62.5 MCG (2500 IU) D3 | 100MCG K2 | 50 PLANTGEL CAPSULES',
    badge: 'PREMIUM INNOVATION',
    image:
        'https://images.unsplash.com/photo-1664786908163-85ca46f85138?crop=entropy&cs=srgb&fm=jpg&q=85',
};

// ---------------------------------------------------------------------------
// 3. Static fallback for the "Great Offer" section.
// ---------------------------------------------------------------------------
export const greatOfferFallback = {
    id: 'great-offer-set',
    slug: 'great-offer-set',
    name: 'A set of Dietary supplements',
    subtitle: 'Vitamin D3+K2 + Organic Collagen Peptides',
    originalPrice: 2499.00,
    price: 1999.00,
    image:
        'https://images.unsplash.com/photo-1664786908163-85ca46f85138?crop=entropy&cs=srgb&fm=jpg&q=85',
    image1:
        'https://images.unsplash.com/photo-1664786908163-85ca46f85138?crop=entropy&cs=srgb&fm=jpg&q=85',
    image2:
        'https://images.unsplash.com/photo-1693996045899-7cf0ac0229c7?crop=entropy&cs=srgb&fm=jpg&q=85',
    category: 'offer_set',
    goals: ['beauty', 'immunity'],
    stock: 20,
    rating: 5.0,
    benefits: ['Dual formula bundle', 'Immunity + skin glow synergy'],
    ingredients: [],
    reviews: [],
};

// ---------------------------------------------------------------------------
// 4. Complete Fallback Catalog (Ensures 100% display uptime)
// ---------------------------------------------------------------------------
export const fallbackProducts = [
    {
        id: 'vitamin-d3-k2',
        slug: 'vitamin-d3-k2',
        name: 'Vitamin D3+K2',
        subtitle: 'With Coconut MCT Oil',
        price: 1499.00,
        originalPrice: null,
        category: 'vitamins',
        image: 'https://images.unsplash.com/photo-1664786908163-85ca46f85138?crop=entropy&cs=srgb&fm=jpg&q=85',
        goals: ['immunity', 'heart'],
        stock: 50,
        rating: 4.9,
        benefits: ['Supports bone strength', 'Immune system booster', 'Heart health'],
        ingredients: [
            { name: 'Vitamin D3 (Cholecalciferol)', amount: '62.5 mcg (2500 IU)', dv: '313%' },
            { name: 'Vitamin K2 (as MK-7)', amount: '100 mcg', dv: '83%' },
            { name: 'Coconut MCT Oil', amount: '250 mg', dv: '†' },
        ],
        reviews: [
            { id: 1, name: 'Emma S.', rating: 5, title: 'Feel amazing already!', text: 'Been using this for 3 weeks now. My energy is way up.', date: '2025-06-15' }
        ]
    },
    {
        id: 'vitamin-c-zinc',
        slug: 'vitamin-c-zinc',
        name: 'Vitamin C+Zinc',
        subtitle: 'Immune Booster',
        price: 899.00,
        originalPrice: null,
        category: 'vitamins',
        image: 'https://images.unsplash.com/photo-1633171029787-3a1022cfc922?crop=entropy&cs=srgb&fm=jpg&q=85',
        goals: ['immunity'],
        stock: 45,
        rating: 4.8,
        benefits: ['Antioxidant support', 'Cold & flu defense', 'Skin health'],
        ingredients: [
            { name: 'Vitamin C', amount: '500 mg', dv: '556%' },
            { name: 'Zinc', amount: '15 mg', dv: '136%' },
        ],
        reviews: []
    },
    {
        id: 'b-complex',
        slug: 'b-complex',
        name: 'B-Complex',
        subtitle: 'Energy Support',
        price: 999.00,
        originalPrice: null,
        category: 'vitamins',
        image: 'https://images.unsplash.com/photo-1664216294573-b28282de564b?crop=entropy&cs=srgb&fm=jpg&q=85',
        goals: ['energy'],
        stock: 60,
        rating: 4.7,
        benefits: ['Cellular energy', 'Mental focus', 'Reduces fatigue'],
        ingredients: [
            { name: 'Vitamin B12', amount: '500 mcg', dv: '20833%' },
            { name: 'Vitamin B6', amount: '10 mg', dv: '588%' },
        ],
        reviews: []
    },
    {
        id: 'multivitamin-plus',
        slug: 'multivitamin-plus',
        name: 'Multivitamin+',
        subtitle: 'Daily Essentials',
        price: 1299.00,
        originalPrice: null,
        category: 'vitamins',
        image: 'https://images.unsplash.com/photo-1544829894-eb023ba95a38?crop=entropy&cs=srgb&fm=jpg&q=85',
        goals: ['immunity', 'energy', 'heart'],
        stock: 80,
        rating: 4.9,
        benefits: ['Complete daily nutrition', 'Multiple system support'],
        ingredients: [
            { name: 'Multivitamin Blend', amount: '1000 mg', dv: '†' },
        ],
        reviews: []
    },
    {
        id: 'omega-3-fish-oil',
        slug: 'omega-3-fish-oil',
        name: 'Omega-3 Fish oil',
        subtitle: 'Original flavour',
        price: 1199.00,
        originalPrice: null,
        category: 'supplements',
        image: 'https://images.unsplash.com/photo-1693996045899-7cf0ac0229c7?crop=entropy&cs=srgb&fm=jpg&q=85',
        goals: ['heart'],
        stock: 40,
        rating: 4.9,
        benefits: ['Cardiovascular support', 'Brain function', 'Anti-inflammatory'],
        ingredients: [
            { name: 'EPA', amount: '360 mg', dv: '†' },
            { name: 'DHA', amount: '240 mg', dv: '†' },
        ],
        reviews: []
    },
    {
        id: 'marine-collagen-peptides',
        slug: 'marine-collagen-peptides',
        name: 'Marine Collagen Peptides',
        subtitle: '34 Servings',
        price: 799.00,
        originalPrice: null,
        category: 'supplements',
        image: 'https://images.unsplash.com/photo-1693996046865-19217d179161?crop=entropy&cs=srgb&fm=jpg&q=85',
        goals: ['beauty'],
        stock: 35,
        rating: 4.8,
        benefits: ['Skin elasticity', 'Hair & nails', 'Joint support'],
        ingredients: [
            { name: 'Marine Collagen', amount: '10 g', dv: '†' },
        ],
        reviews: []
    },
    {
        id: 'dietary-supplement-set',
        slug: 'dietary-supplement-set',
        name: 'A set of Dietary supplements',
        subtitle: 'D3+K2, Collagen Peptides',
        price: 1699.00,
        originalPrice: null,
        category: 'supplements',
        image: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?crop=entropy&cs=srgb&fm=jpg&q=85',
        goals: ['immunity', 'beauty'],
        stock: 25,
        rating: 4.9,
        benefits: ['Complete wellness set', 'Bone + skin support'],
        ingredients: [],
        reviews: []
    },
    {
        id: 'organic-collagen-peptides',
        slug: 'organic-collagen-peptides',
        name: 'Organic Collagen Peptides',
        subtitle: 'Chocolate flavour',
        price: 1899.00,
        originalPrice: null,
        category: 'pick_of_month',
        image: 'https://images.unsplash.com/photo-1693996045300-521e9d08cabc?crop=entropy&cs=srgb&fm=jpg&q=85',
        goals: ['beauty'],
        stock: 30,
        rating: 4.9,
        benefits: ['Youthful skin', 'Hair growth', 'Joint mobility'],
        ingredients: [],
        reviews: []
    },
    {
        id: 'hydrate-electrolytes',
        slug: 'hydrate-electrolytes',
        name: 'Hydrate Electrolytes',
        subtitle: 'Cherry Pomegranate',
        price: 1149.00,
        originalPrice: null,
        category: 'pick_of_month',
        image: 'https://images.unsplash.com/photo-1664216294580-079bc527ae49?crop=entropy&cs=srgb&fm=jpg&q=85',
        goals: ['energy'],
        stock: 55,
        rating: 4.8,
        benefits: ['Hydration', 'Muscle recovery', 'Endurance'],
        ingredients: [],
        reviews: []
    },
    {
        id: 'energy-immunity',
        slug: 'energy-immunity',
        name: 'Energy & Immunity',
        subtitle: 'Premium dietary supplement',
        price: 949.00,
        originalPrice: null,
        category: 'pick_of_month',
        image: 'https://images.unsplash.com/photo-1633171029787-3a1022cfc922?crop=entropy&cs=srgb&fm=jpg&q=85',
        goals: ['immunity', 'energy'],
        stock: 65,
        rating: 4.8,
        benefits: ['Daily immunity', 'Sustained energy'],
        ingredients: [],
        reviews: []
    },
    {
        id: 'omega-complex',
        slug: 'omega-complex',
        name: 'Omega Complex',
        subtitle: 'Heart Support',
        price: 1099.00,
        originalPrice: null,
        category: 'pick_of_month',
        image: 'https://images.unsplash.com/photo-1693996045899-7cf0ac0229c7?crop=entropy&cs=srgb&fm=jpg&q=85',
        goals: ['heart'],
        stock: 45,
        rating: 4.7,
        benefits: ['Heart health', 'Brain support'],
        ingredients: [],
        reviews: []
    },
    {
        id: 'turmeric-curcumin',
        slug: 'turmeric-curcumin',
        name: 'Turmeric Curcumin',
        subtitle: 'Anti-inflammatory',
        price: 849.00,
        originalPrice: null,
        category: 'pick_of_month',
        image: 'https://images.unsplash.com/photo-1544829894-eb023ba95a38?crop=entropy&cs=srgb&fm=jpg&q=85',
        goals: ['immunity', 'heart'],
        stock: 70,
        rating: 4.9,
        benefits: ['Anti-inflammatory', 'Joint health'],
        ingredients: [],
        reviews: []
    },
    {
        id: 'magnesium-glycinate',
        slug: 'magnesium-glycinate',
        name: 'Magnesium Glycinate',
        subtitle: 'Sleep & Recovery',
        price: 799.00,
        originalPrice: null,
        category: 'pick_of_month',
        image: 'https://images.unsplash.com/photo-1664216294573-b28282de564b?crop=entropy&cs=srgb&fm=jpg&q=85',
        goals: ['sleep'],
        stock: 50,
        rating: 4.9,
        benefits: ['Better sleep', 'Muscle recovery', 'Calm mood'],
        ingredients: [],
        reviews: []
    },
    {
        id: 'great-offer-set',
        slug: 'great-offer-set',
        name: 'A set of Dietary supplements',
        subtitle: 'Vitamin D3+K2 + Organic Collagen Peptides',
        price: 1999.00,
        originalPrice: 2499.00,
        category: 'offer_set',
        image: 'https://images.unsplash.com/photo-1664786908163-85ca46f85138?crop=entropy&cs=srgb&fm=jpg&q=85',
        goals: ['beauty', 'immunity'],
        stock: 20,
        rating: 5.0,
        benefits: ['Complete wellness set', 'Save ₹500'],
        ingredients: [],
        reviews: []
    },
];

export const fallbackGoals = [
    { id: 'all', label: 'All' },
    { id: 'immunity', label: 'Immunity' },
    { id: 'energy', label: 'Energy' },
    { id: 'sleep', label: 'Sleep' },
    { id: 'beauty', label: 'Beauty' },
    { id: 'heart', label: 'Heart' },
];

export const fallbackBlogPosts = [
    {
        slug: 'vitamin-d3-k2-guide',
        title: 'The Complete Guide to Vitamin D3 + K2',
        category: 'Supplements',
        excerpt: 'Why these two vitamins work better together, and how to choose the right dosage.',
        image: 'https://images.unsplash.com/photo-1707129785947-ddc627a8bab9?crop=entropy&cs=srgb&fm=jpg&q=85',
        read_time: '6 min read',
        is_featured: 1,
        published_at: '2025-06-18',
        content: [
            'Vitamin D3 and K2 are often paired together for a reason: they work synergistically to support bone health, immune function, and cardiovascular wellness.',
            'Vitamin D3 helps your body absorb calcium from the gut, while vitamin K2 directs that calcium into your bones and teeth — rather than letting it deposit in your arteries.',
            'Most adults benefit from 1000–4000 IU of D3 daily, paired with 100–200 mcg of MK-7 form K2.',
        ]
    },
    {
        slug: 'morning-habits-energy',
        title: '5 Morning Habits for All-Day Energy',
        category: 'Lifestyle',
        excerpt: 'Small, science-backed changes you can make before 9 a.m. to feel more focused.',
        image: 'https://images.unsplash.com/photo-1600791344609-2836239516c3?crop=entropy&cs=srgb&fm=jpg&q=85',
        read_time: '4 min read',
        published_at: '2025-06-10',
        content: [
            'How you spend the first hour of your day sets the tone for everything that follows.',
            '1. Get sunlight within 30 minutes of waking. 2. Drink water before coffee. 3. Move your body for 10 minutes.',
        ]
    },
    {
        slug: 'collagen-research',
        title: 'Collagen: What the Research Actually Says',
        category: 'Nutrition',
        excerpt: 'We break down the latest studies on marine collagen.',
        image: 'https://images.unsplash.com/photo-1624362772755-4d5843e67047?crop=entropy&cs=srgb&fm=jpg&q=85',
        read_time: '8 min read',
        published_at: '2025-06-02',
        content: [
            'Collagen supplements have exploded in popularity — but what does the evidence say?',
            'Multiple randomized controlled trials suggest that 2.5–10g of hydrolysed collagen peptides daily can improve skin elasticity.',
        ]
    },
];

function filterFallback(params = {}) {
    let list = [...fallbackProducts];
    if (params.category && params.category !== 'all') {
        list = list.filter((p) => p.category === params.category);
    }
    if (params.goal && params.goal !== 'all') {
        list = list.filter((p) => p.goals && p.goals.includes(params.goal));
    }
    if (params.q) {
        const query = params.q.toLowerCase();
        list = list.filter(
            (p) =>
                p.name.toLowerCase().includes(query) ||
                (p.subtitle && p.subtitle.toLowerCase().includes(query))
        );
    }
    if (params.maxPrice) {
        list = list.filter((p) => p.price <= Number(params.maxPrice));
    }
    if (params.sort) {
        if (params.sort === 'price-asc') list.sort((a, b) => a.price - b.price);
        if (params.sort === 'price-desc') list.sort((a, b) => b.price - a.price);
        if (params.sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
    }
    return list;
}

// ---------------------------------------------------------------------------
// 5. Async API helpers with Supabase cloud connection & seamless fallback.
// ---------------------------------------------------------------------------
async function fetchProductsFromSupabase(params = {}) {
    try {
        let q = supabase.from('products').select('*');
        if (params.category && params.category !== 'all') {
            q = q.eq('category', params.category);
        }
        if (params.maxPrice) {
            q = q.lte('price', Number(params.maxPrice));
        }
        if (params.sort === 'price-asc') q = q.order('price', { ascending: true });
        else if (params.sort === 'price-desc') q = q.order('price', { ascending: false });
        else if (params.sort === 'name') q = q.order('name', { ascending: true });
        else q = q.order('id', { ascending: true });

        const { data, error } = await q;
        if (error || !data || data.length === 0) return null;

        const ids = data.map(p => p.id);
        const [gRes, iRes, bRes, allGoals] = await Promise.all([
            supabase.from('product_goals').select('product_id, goal_id'),
            supabase.from('product_ingredients').select('*').in('product_id', ids).order('sort_order', { ascending: true }),
            supabase.from('product_benefits').select('*').in('product_id', ids),
            supabase.from('goals').select('id, slug'),
        ]);

        const goalIdToSlug = {};
        allGoals.data?.forEach(g => { goalIdToSlug[g.id] = g.slug; });

        const goalsMap = {}, ingMap = {}, benMap = {};
        gRes.data?.forEach(g => {
            const slug = goalIdToSlug[g.goal_id];
            if (slug) (goalsMap[g.product_id] ||= []).push(slug);
        });
        iRes.data?.forEach(i => (ingMap[i.product_id] ||= []).push({ name: i.name, amount: i.amount, dv: i.dv }));
        bRes.data?.forEach(b => (benMap[b.product_id] ||= []).push(b.text));

        let results = data.map(p => ({
            id: p.slug,
            dbId: p.id,
            slug: p.slug,
            name: p.name,
            subtitle: p.subtitle,
            description: p.description,
            price: Number(p.price),
            originalPrice: p.original_price ? Number(p.original_price) : null,
            image: p.image,
            category: p.category,
            stock: p.stock,
            rating: Number(p.rating),
            goals: goalsMap[p.id] || [],
            ingredients: ingMap[p.id] || [],
            benefits: benMap[p.id] || [],
            reviews: [],
        }));

        if (params.goal && params.goal !== 'all') {
            results = results.filter(p => p.goals.includes(params.goal));
        }
        if (params.q) {
            const term = params.q.toLowerCase().trim();
            results = results.filter(p => p.name.toLowerCase().includes(term) || (p.subtitle && p.subtitle.toLowerCase().includes(term)));
        }

        return results;
    } catch (e) {
        console.warn('Direct Supabase products fetch warning:', e.message);
        return null;
    }
}

export async function getProducts(params = {}) {
    try {
        const search = new URLSearchParams();
        Object.entries(params).forEach(([k, v]) => {
            if (v !== undefined && v !== null && v !== '' && v !== 'all') {
                search.set(k, v);
            }
        });
        const qs = search.toString();
        const { data } = await api.get(`/products${qs ? `?${qs}` : ''}`);
        if (Array.isArray(data?.products) && data.products.length > 0) {
            return data.products;
        }
    } catch (err) {
        console.warn('API /products not reachable; fetching directly from Supabase...');
    }

    const supaProducts = await fetchProductsFromSupabase(params);
    if (supaProducts && supaProducts.length > 0) {
        return supaProducts;
    }

    return filterFallback(params);
}

export async function getProduct(slug) {
    try {
        const { data } = await api.get(`/products/${slug}`);
        if (data?.product) return data;
    } catch (err) {
        console.warn(`API /products/${slug} offline; checking Supabase...`);
    }

    try {
        const numericId = Number(slug);
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .or(`slug.eq.${slug}${!isNaN(numericId) && numericId > 0 ? `,id.eq.${numericId}` : ''}`)
            .limit(1);

        if (!error && data && data.length > 0) {
            const p = data[0];
            const [gRes, iRes, bRes, rRes, allGoals] = await Promise.all([
                supabase.from('product_goals').select('goal_id').eq('product_id', p.id),
                supabase.from('product_ingredients').select('*').eq('product_id', p.id).order('sort_order', { ascending: true }),
                supabase.from('product_benefits').select('*').eq('product_id', p.id),
                supabase.from('product_reviews').select('*').eq('product_id', p.id).order('created_at', { ascending: false }),
                supabase.from('goals').select('id, slug'),
            ]);

            const goalIdToSlug = {};
            allGoals.data?.forEach(g => { goalIdToSlug[g.id] = g.slug; });
            const productGoals = (gRes.data || []).map(g => goalIdToSlug[g.goal_id]).filter(Boolean);

            const product = {
                id: p.slug,
                dbId: p.id,
                slug: p.slug,
                name: p.name,
                subtitle: p.subtitle,
                description: p.description,
                price: Number(p.price),
                originalPrice: p.original_price ? Number(p.original_price) : null,
                image: p.image,
                category: p.category,
                stock: p.stock,
                rating: Number(p.rating),
                goals: productGoals,
                ingredients: (iRes.data || []).map(i => ({ name: i.name, amount: i.amount, dv: i.dv })),
                benefits: (bRes.data || []).map(b => b.text),
                reviews: (rRes.data || []).map(r => ({
                    id: r.id, name: r.name, rating: r.rating, title: r.title, text: r.text,
                    date: (r.created_at || '').slice(0, 10),
                })),
            };

            const { data: relData } = await supabase.from('products').select('*').eq('category', p.category).neq('id', p.id).limit(4);
            const related = (relData || []).map(r => ({
                id: r.slug,
                dbId: r.id,
                slug: r.slug,
                name: r.name,
                subtitle: r.subtitle,
                price: Number(r.price),
                image: r.image,
                category: r.category,
                rating: Number(r.rating),
            }));

            return { product, related };
        }
    } catch (e) {
        console.warn('Direct Supabase single product error:', e.message);
    }

    const product = fallbackProducts.find((p) => p.slug === slug || p.id === slug) || fallbackProducts[0];
    const related = fallbackProducts.filter((p) => p.slug !== product.slug && p.category === product.category).slice(0, 4);
    return { product, related };
}

export async function getGoals() {
    try {
        const { data } = await api.get('/products/goals');
        if (Array.isArray(data?.goals) && data.goals.length > 0) {
            return data.goals;
        }
    } catch (err) {}

    try {
        const { data } = await supabase.from('goals').select('slug, label').order('id', { ascending: true });
        if (data && data.length) {
            return [{ id: 'all', label: 'All' }, ...data.map(g => ({ id: g.slug, label: g.label }))];
        }
    } catch {}

    return fallbackGoals;
}

export async function getBlogPosts(params = {}) {
    try {
        const search = new URLSearchParams();
        Object.entries(params).forEach(([k, v]) => {
            if (v !== undefined && v !== null && v !== '' && v !== 'All') {
                search.set(k, v);
            }
        });
        const qs = search.toString();
        const { data } = await api.get(`/blog${qs ? `?${qs}` : ''}`);
        if (data?.posts && data.posts.length > 0) {
            return { featured: data.featured, posts: data.posts };
        }
    } catch (err) {}

    try {
        let q = supabase.from('blog_posts').select('*').order('published_at', { ascending: false });
        if (params.category && params.category !== 'All') {
            q = q.eq('category', params.category);
        }
        const { data } = await q;
        if (data && data.length > 0) {
            const posts = data.map(b => ({
                id: b.slug,
                slug: b.slug,
                title: b.title,
                category: b.category,
                excerpt: b.excerpt,
                image: b.image,
                readTime: b.read_time,
                date: b.published_at,
                featured: !!b.is_featured,
            }));
            const featured = posts.find(p => p.featured) || posts[0];
            return { featured, posts: posts.filter(p => !p.featured) };
        }
    } catch {}

    const featured = fallbackBlogPosts.find((b) => b.is_featured) || fallbackBlogPosts[0];
    return { featured, posts: fallbackBlogPosts };
}

export async function getBlogPost(slug) {
    try {
        const { data } = await api.get(`/blog/${slug}`);
        if (data?.post) return data.post;
    } catch (err) {}

    try {
        const { data, error } = await supabase.from('blog_posts').select('*').eq('slug', slug).limit(1);
        if (!error && data && data.length > 0) {
            const b = data[0];
            let content = b.content;
            if (typeof content === 'string') {
                try { content = JSON.parse(content); } catch {}
            }
            return {
                id: b.slug,
                title: b.title,
                category: b.category,
                excerpt: b.excerpt,
                image: b.image,
                readTime: b.read_time,
                date: b.published_at,
                content,
            };
        }
    } catch {}

    return fallbackBlogPosts.find((b) => b.slug === slug) || fallbackBlogPosts[0];
}