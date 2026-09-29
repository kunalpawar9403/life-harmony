// src/context/CartContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const { isAuthenticated } = useAuth();

    // 1. Initialize immediately from localStorage so count never jumps on refresh
    const [items, setItems] = useState(() => {
        try {
            const raw = localStorage.getItem('lh_local_cart');
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    });

    const [wishlistIds, setWishlistIds] = useState(() => {
        try {
            const raw = localStorage.getItem('lh_local_wishlist');
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    });

    const [drawerOpen, setDrawerOpen] = useState(false);

    // 2. Keep localStorage in sync whenever items or wishlist change
    useEffect(() => {
        try {
            localStorage.setItem('lh_local_cart', JSON.stringify(items));
        } catch {}
    }, [items]);

    useEffect(() => {
        try {
            localStorage.setItem('lh_local_wishlist', JSON.stringify(wishlistIds));
        } catch {}
    }, [wishlistIds]);

    // 3. Background server sync (non-destructive)
    const refreshCart = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            const { data } = await api.get('/cart');
            if (Array.isArray(data?.items) && data.items.length > 0) {
                setItems(data.items);
            }
        } catch {
            /* ignore background errors */
        }
    }, [isAuthenticated]);

    const refreshWishlist = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            const { data } = await api.get('/wishlist/ids');
            if (Array.isArray(data?.ids) && data.ids.length > 0) {
                setWishlistIds(data.ids);
            }
        } catch {
            /* ignore background errors */
        }
    }, [isAuthenticated]);

    useEffect(() => {
        if (isAuthenticated) {
            refreshCart();
            refreshWishlist();
        }
    }, [isAuthenticated, refreshCart, refreshWishlist]);

    // 4. Robust Add To Cart (supports both guests and authenticated members)
    const addToCart = useCallback(
        async (product, qty = 1) => {
            const productId = product.slug || product.id;
            const price = Number(product.price) || 0;

            // Immediately update local state so UI is instant and never flickers
            setItems((prev) => {
                const existing = prev.find((i) => (i.slug || i.id) === productId);
                let updated;
                if (existing) {
                    updated = prev.map((i) =>
                        (i.slug || i.id) === productId
                            ? { ...i, qty: i.qty + qty }
                            : i
                    );
                } else {
                    updated = [
                        ...prev,
                        {
                            id: productId,
                            slug: productId,
                            name: product.name,
                            subtitle: product.subtitle,
                            price,
                            image: product.image,
                            qty,
                        },
                    ];
                }
                return updated;
            });

            // Optional background server sync if logged in
            if (isAuthenticated) {
                try {
                    await api.post('/cart/items', {
                        productSlug: productId,
                        qty,
                    });
                } catch (err) {
                    console.warn('Background cart sync notice:', err.message);
                }
            }
        },
        [isAuthenticated]
    );

    const removeFromCart = useCallback(
        async (id) => {
            setItems((prev) => prev.filter((i) => (i.slug || i.id) !== id));
            if (isAuthenticated) {
                try {
                    await api.delete(`/cart/items/${id}`);
                } catch {}
            }
        },
        [isAuthenticated]
    );

    const updateQty = useCallback(
        async (id, qty) => {
            if (qty <= 0) {
                removeFromCart(id);
                return;
            }
            setItems((prev) =>
                prev.map((i) =>
                    (i.slug || i.id) === id ? { ...i, qty } : i
                )
            );
            if (isAuthenticated) {
                try {
                    await api.put(`/cart/items/${id}`, { qty });
                } catch {}
            }
        },
        [isAuthenticated, removeFromCart]
    );

    const clearCart = useCallback(async () => {
        setItems([]);
        try {
            localStorage.removeItem('lh_local_cart');
        } catch {}
        if (isAuthenticated) {
            try {
                await api.delete('/cart');
            } catch {}
        }
    }, [isAuthenticated]);

    // 5. Robust Wishlist Toggle (Supports guests and members)
    const toggleWishlist = useCallback(
        async (id) => {
            setWishlistIds((prev) => {
                const exists = prev.includes(id);
                return exists ? prev.filter((x) => x !== id) : [...prev, id];
            });

            if (isAuthenticated) {
                try {
                    await api.post(`/wishlist/toggle/${id}`);
                } catch {}
            }
        },
        [isAuthenticated]
    );

    const cartCount = items.reduce((s, i) => s + (Number(i.qty) || 0), 0);
    const subtotal = items.reduce((s, i) => s + (Number(i.qty) || 0) * (Number(i.price) || 0), 0);

    return (
        <CartContext.Provider
            value={{
                items,
                wishlist: wishlistIds,
                drawerOpen,
                setDrawerOpen,
                addToCart,
                removeFromCart,
                updateQty,
                clearCart,
                toggleWishlist,
                cartCount,
                subtotal,
                refreshCart,
                refreshWishlist,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used within CartProvider');
    return ctx;
};