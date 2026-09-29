// src/mock.js
// Static UI assets + API helper functions.
// Product / goal / blog / review data now comes from the backend.

import api from './lib/api';

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
// 2. Hero product display text (purely visual for the SVG bottle mock).
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
    name: 'A set of Dietary supplements',
    subtitle: 'Vitamin D3+K2 + Organic Collagen Peptides',
    originalPrice: 2499.00,
    price: 1999.00,
    image1:
        'https://images.unsplash.com/photo-1664786908163-85ca46f85138?crop=entropy&cs=srgb&fm=jpg&q=85',
    image2:
        'https://images.unsplash.com/photo-1693996045899-7cf0ac0229c7?crop=entropy&cs=srgb&fm=jpg&q=85',
};

// ---------------------------------------------------------------------------
// 4. Async API helpers.
// ---------------------------------------------------------------------------
export async function getProducts(params = {}) {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '' && v !== 'all') {
            search.set(k, v);
        }
    });
    const qs = search.toString();
    const { data } = await api.get(`/products${qs ? `?${qs}` : ''}`);
    return data.products || [];
}

export async function getProduct(slug) {
    const { data } = await api.get(`/products/${slug}`);
    return data;
}

export async function getGoals() {
    const { data } = await api.get('/products/goals');
    return data.goals || [{ id: 'all', label: 'All' }];
}

export async function getBlogPosts(params = {}) {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '' && v !== 'All') {
            search.set(k, v);
        }
    });
    const qs = search.toString();
    const { data } = await api.get(`/blog${qs ? `?${qs}` : ''}`);
    return { featured: data.featured, posts: data.posts || [] };
}

export async function getBlogPost(slug) {
    const { data } = await api.get(`/blog/${slug}`);
    return data.post;
}