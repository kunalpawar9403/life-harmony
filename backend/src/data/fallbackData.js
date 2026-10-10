// backend/src/data/fallbackData.js
// Embedded data fallback for when MySQL is offline or initializing in the cloud.

export const fallbackProducts = [
    {
        id: 1,
        slug: 'vitamin-d3-k2',
        name: 'Vitamin D3+K2',
        subtitle: 'With Coconut MCT Oil',
        price: 1499.00,
        original_price: null,
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
        id: 2,
        slug: 'vitamin-c-zinc',
        name: 'Vitamin C+Zinc',
        subtitle: 'Immune Booster',
        price: 899.00,
        original_price: null,
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
        id: 3,
        slug: 'b-complex',
        name: 'B-Complex',
        subtitle: 'Energy Support',
        price: 999.00,
        original_price: null,
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
        id: 4,
        slug: 'multivitamin-plus',
        name: 'Multivitamin+',
        subtitle: 'Daily Essentials',
        price: 1299.00,
        original_price: null,
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
        id: 5,
        slug: 'omega-3-fish-oil',
        name: 'Omega-3 Fish oil',
        subtitle: 'Original flavour',
        price: 1199.00,
        original_price: null,
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
        id: 6,
        slug: 'marine-collagen-peptides',
        name: 'Marine Collagen Peptides',
        subtitle: '34 Servings',
        price: 799.00,
        original_price: null,
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
        id: 7,
        slug: 'dietary-supplement-set',
        name: 'A set of Dietary supplements',
        subtitle: 'D3+K2, Collagen Peptides',
        price: 1699.00,
        original_price: null,
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
        id: 8,
        slug: 'organic-collagen-peptides',
        name: 'Organic Collagen Peptides',
        subtitle: 'Chocolate flavour',
        price: 1899.00,
        original_price: null,
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
        id: 9,
        slug: 'hydrate-electrolytes',
        name: 'Hydrate Electrolytes',
        subtitle: 'Cherry Pomegranate',
        price: 1149.00,
        original_price: null,
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
        id: 10,
        slug: 'energy-immunity',
        name: 'Energy & Immunity',
        subtitle: 'Premium dietary supplement',
        price: 949.00,
        original_price: null,
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
        id: 11,
        slug: 'omega-complex',
        name: 'Omega Complex',
        subtitle: 'Heart Support',
        price: 1099.00,
        original_price: null,
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
        id: 12,
        slug: 'turmeric-curcumin',
        name: 'Turmeric Curcumin',
        subtitle: 'Anti-inflammatory',
        price: 849.00,
        original_price: null,
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
        id: 13,
        slug: 'magnesium-glycinate',
        name: 'Magnesium Glycinate',
        subtitle: 'Sleep & Recovery',
        price: 799.00,
        original_price: null,
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
        id: 14,
        slug: 'great-offer-set',
        name: 'A set of Dietary supplements',
        subtitle: 'Vitamin D3+K2 + Organic Collagen Peptides',
        price: 1999.00,
        original_price: 2499.00,
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
        id: 'vitamin-d3-k2-guide',
        slug: 'vitamin-d3-k2-guide',
        title: 'The Complete Guide to Vitamin D3 + K2',
        category: 'Supplements',
        excerpt: 'Why these two vitamins work better together, and how to choose the right dosage.',
        image: 'https://images.unsplash.com/photo-1707129785947-ddc627a8bab9?crop=entropy&cs=srgb&fm=jpg&q=85',
        readTime: '6 min read',
        featured: true,
        date: '2025-06-18',
        content: [
            'Vitamin D3 and K2 are often paired together for a reason: they work synergistically to support bone health, immune function, and cardiovascular wellness.',
            'Vitamin D3 helps your body absorb calcium from the gut, while vitamin K2 directs that calcium into your bones and teeth — rather than letting it deposit in your arteries.',
            'Most adults benefit from 1000–4000 IU of D3 daily, paired with 100–200 mcg of MK-7 form K2.',
        ]
    },
    {
        id: 'morning-habits-energy',
        slug: 'morning-habits-energy',
        title: '5 Morning Habits for All-Day Energy',
        category: 'Lifestyle',
        excerpt: 'Small, science-backed changes you can make before 9 a.m. to feel more focused.',
        image: 'https://images.unsplash.com/photo-1600791344609-2836239516c3?crop=entropy&cs=srgb&fm=jpg&q=85',
        readTime: '4 min read',
        featured: false,
        date: '2025-06-10',
        content: [
            'How you spend the first hour of your day sets the tone for everything that follows.',
            '1. Get sunlight within 30 minutes of waking. 2. Drink water before coffee. 3. Move your body for 10 minutes.',
        ]
    },
    {
        id: 'collagen-research',
        slug: 'collagen-research',
        title: 'Collagen: What the Research Actually Says',
        category: 'Nutrition',
        excerpt: 'We break down the latest studies on marine collagen.',
        image: 'https://images.unsplash.com/photo-1624362772755-4d5843e67047?crop=entropy&cs=srgb&fm=jpg&q=85',
        readTime: '8 min read',
        featured: false,
        date: '2025-06-02',
        content: [
            'Collagen supplements have exploded in popularity — but what does the evidence say?',
            'Multiple randomized controlled trials suggest that 2.5–10g of hydrolysed collagen peptides daily can improve skin elasticity.',
        ]
    },
];

export function getFallbackProducts(params = {}) {
    let list = fallbackProducts.map(p => ({
        id: p.slug,
        dbId: p.id,
        slug: p.slug,
        name: p.name,
        subtitle: p.subtitle,
        price: p.price,
        originalPrice: p.original_price,
        image: p.image,
        category: p.category,
        stock: p.stock,
        rating: p.rating,
        goals: p.goals || [],
        ingredients: p.ingredients || [],
        benefits: p.benefits || [],
        reviews: p.reviews || [],
    }));

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
