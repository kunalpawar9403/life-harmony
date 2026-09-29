// backend/src/services/productStore.js
// Centralized product store ensuring all Admin changes immediately sync with the consumer storefront

import { fallbackProducts, fallbackGoals } from '../data/fallbackData.js';

const productsMap = new Map();

// Initialize with catalog
fallbackProducts.forEach((p, idx) => {
    const id = p.id || (idx + 1);
    productsMap.set(id, {
        id,
        dbId: id,
        slug: p.slug,
        name: p.name,
        subtitle: p.subtitle || '',
        description: p.description || '',
        price: Number(p.price),
        original_price: p.original_price ? Number(p.original_price) : null,
        originalPrice: p.originalPrice ? Number(p.originalPrice) : (p.original_price ? Number(p.original_price) : null),
        image: p.image,
        category: p.category || 'vitamins',
        stock: p.stock !== undefined ? Number(p.stock) : 50,
        rating: Number(p.rating) || 4.9,
        is_featured: p.is_featured || 0,
        goals: p.goals || [],
        ingredients: p.ingredients || [],
        benefits: p.benefits || [],
        reviews: p.reviews || [],
        salesCount: 10 + (idx % 8),
    });
});

export function getAllProducts(filters = {}) {
    let list = Array.from(productsMap.values());
    const { category, goal, q, maxPrice, sort } = filters;

    if (category && category !== 'all') {
        if (category === 'pick_of_month') {
            list = list.filter(p => p.slug === 'vitamin-d3-k2' || p.category === 'vitamins');
        } else if (category === 'offer_set') {
            list = list.filter(p => p.slug === 'great-offer-set' || p.category === 'supplements');
        } else {
            list = list.filter(p => p.category?.toLowerCase() === category.toLowerCase());
        }
    }

    if (goal && goal !== 'all') {
        list = list.filter(p => Array.isArray(p.goals) && p.goals.includes(goal));
    }

    if (maxPrice) {
        list = list.filter(p => p.price <= Number(maxPrice));
    }

    if (q) {
        const query = q.toLowerCase().trim();
        list = list.filter(p =>
            p.name?.toLowerCase().includes(query) ||
            p.subtitle?.toLowerCase().includes(query) ||
            p.slug?.toLowerCase().includes(query)
        );
    }

    switch (sort) {
        case 'price_asc':
        case 'price-asc':
            list.sort((a, b) => a.price - b.price);
            break;
        case 'price_desc':
        case 'price-desc':
            list.sort((a, b) => b.price - a.price);
            break;
        case 'stock_asc':
            list.sort((a, b) => a.stock - b.stock);
            break;
        case 'sales_desc':
            list.sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0));
            break;
        case 'name':
            list.sort((a, b) => a.name.localeCompare(b.name));
            break;
        default:
            list.sort((a, b) => a.id - b.id);
    }

    return list;
}

export function getProductBySlug(slug) {
    if (!slug) return null;
    for (const p of productsMap.values()) {
        if (p.slug === slug || String(p.id) === String(slug) || String(p.dbId) === String(slug)) {
            return p;
        }
    }
    return null;
}

export function createProduct(productData) {
    const id = Date.now();
    const slug = productData.slug
        ? productData.slug.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')
        : productData.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-') + '-' + String(id).slice(-4);

    const product = {
        id,
        dbId: id,
        slug,
        name: productData.name.trim(),
        subtitle: productData.subtitle ? productData.subtitle.trim() : '',
        description: productData.description ? productData.description.trim() : '',
        price: Number(productData.price),
        original_price: productData.originalPrice ? Number(productData.originalPrice) : null,
        originalPrice: productData.originalPrice ? Number(productData.originalPrice) : null,
        image: productData.image?.trim() || 'https://images.unsplash.com/photo-1664786908163-85ca46f85138?crop=entropy&cs=srgb&fm=jpg&q=85',
        category: productData.category || 'vitamins',
        stock: productData.stock !== undefined ? Number(productData.stock) : 100,
        rating: 5.0,
        is_featured: productData.isFeatured ? 1 : 0,
        goals: Array.isArray(productData.goals) ? productData.goals : [],
        benefits: Array.isArray(productData.benefits) ? productData.benefits : [],
        ingredients: Array.isArray(productData.ingredients) ? productData.ingredients : [],
        reviews: [],
        salesCount: 0,
    };

    productsMap.set(id, product);
    return product;
}

export function updateProduct(id, updates) {
    const numericId = Number(id);
    let existing = productsMap.get(numericId);
    if (!existing) {
        existing = getProductBySlug(id);
    }
    if (!existing) return null;

    const updated = {
        ...existing,
        name: updates.name !== undefined ? updates.name.trim() : existing.name,
        subtitle: updates.subtitle !== undefined ? updates.subtitle.trim() : existing.subtitle,
        description: updates.description !== undefined ? updates.description.trim() : existing.description,
        price: updates.price !== undefined ? Number(updates.price) : existing.price,
        originalPrice: updates.originalPrice !== undefined ? Number(updates.originalPrice) : existing.originalPrice,
        original_price: updates.originalPrice !== undefined ? Number(updates.originalPrice) : existing.original_price,
        image: updates.image !== undefined ? updates.image.trim() : existing.image,
        category: updates.category !== undefined ? updates.category : existing.category,
        stock: updates.stock !== undefined ? Number(updates.stock) : existing.stock,
        goals: updates.goals !== undefined ? updates.goals : existing.goals,
        benefits: updates.benefits !== undefined ? updates.benefits : existing.benefits,
        is_featured: updates.isFeatured !== undefined ? (updates.isFeatured ? 1 : 0) : existing.is_featured,
    };

    productsMap.set(existing.id, updated);
    return updated;
}

export function deleteProduct(id) {
    const numericId = Number(id);
    const existing = productsMap.get(numericId) || getProductBySlug(id);
    if (existing) {
        productsMap.delete(existing.id);
        return true;
    }
    return false;
}

export function updateStock(id, deltaOrStock) {
    const numericId = Number(id);
    const existing = productsMap.get(numericId) || getProductBySlug(id);
    if (!existing) return 50;

    if (deltaOrStock.stock !== undefined) {
        existing.stock = Math.max(0, Number(deltaOrStock.stock));
    } else if (deltaOrStock.delta !== undefined) {
        existing.stock = Math.max(0, existing.stock + Number(deltaOrStock.delta));
    }
    return existing.stock;
}
