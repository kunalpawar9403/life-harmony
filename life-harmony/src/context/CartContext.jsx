// src/context/CartContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const { isAuthenticated } = useAuth();
    const [items, setItems] = useState([]);
    const [wishlistIds, setWishlistIds] = useState([]);
    const [drawerOpen, setDrawerOpen] = useState(false);

    const refreshCart = useCallback(async () => {
        if (!isAuthenticated) {
            setItems([]);
            return;
        }
        try {
            const { data } = await api.get('/cart');
            if (Array.isArray(data?.items)) setItems(data.items);
        } catch {
            const saved = localStorage.getItem('lh_local_cart');
            if (saved) {
                try { setItems(JSON.parse(saved)); } catch {}
            }
        }
    }, [isAuthenticated]);

    const refreshWishlist = useCallback(async () => {
        if (!isAuthenticated) {
            setWishlistIds([]);
            return;
        }
        try {
            const { data } = await api.get('/wishlist/ids');
            if (Array.isArray(data?.ids)) setWishlistIds(data.ids);
        } catch {
            const saved = localStorage.getItem('lh_local_wishlist');
            if (saved) {
                try { setWishlistIds(JSON.parse(saved)); } catch {}
            }
        }
    }, [isAuthenticated]);

    useEffect(() => {
        refreshCart();
        refreshWishlist();
    }, [refreshCart, refreshWishlist]);

    const addToCart = useCallback(
        async (product, qty = 1) => {
            if (!isAuthenticated) {
                throw new Error('Please sign in to add items to your cart.');
            }
            try {
                const { data } = await api.post('/cart/items', {
                    productSlug: product.id,
                    qty,
                });
                if (Array.isArray(data?.items)) {
                    setItems(data.items);
                    localStorage.setItem('lh_local_cart', JSON.stringify(data.items));
                    return;
                }
            } catch (err) {
                console.warn('Cart API error, persisting locally:', err.message);
            }

            // Fallback to local cart state
            setItems((prev) => {
                const existing = prev.find((i) => i.id === product.id);
                let updated;
                if (existing) {
                    updated = prev.map((i) =>
                        i.id === product.id ? { ...i, qty: i.qty + qty } : i
                    );
                } else {
                    updated = [
                        ...prev,
                        {
                            id: product.id,
                            name: product.name,
                            subtitle: product.subtitle,
                            price: Number(product.price),
                            image: product.image,
                            qty,
                        },
                    ];
                }
                localStorage.setItem('lh_local_cart', JSON.stringify(updated));
                return updated;
            });
        },
        [isAuthenticated]
    );

    const removeFromCart = useCallback(async (id) => {
        try {
            const { data } = await api.delete(`/cart/items/${id}`);
            if (Array.isArray(data?.items)) {
                setItems(data.items);
                localStorage.setItem('lh_local_cart', JSON.stringify(data.items));
                return;
            }
        } catch (err) {
            console.warn('Cart API error, removing locally:', err.message);
        }
        setItems((prev) => {
            const updated = prev.filter((i) => i.id !== id);
            localStorage.setItem('lh_local_cart', JSON.stringify(updated));
            return updated;
        });
    }, []);

    const updateQty = useCallback(async (id, qty) => {
        try {
            const { data } = await api.put(`/cart/items/${id}`, { qty });
            if (Array.isArray(data?.items)) {
                setItems(data.items);
                localStorage.setItem('lh_local_cart', JSON.stringify(data.items));
                return;
            }
        } catch (err) {
            console.warn('Cart API error, updating qty locally:', err.message);
        }
        setItems((prev) => {
            const updated = prev
                .map((i) => (i.id === id ? { ...i, qty } : i))
                .filter((i) => i.qty > 0);
            localStorage.setItem('lh_local_cart', JSON.stringify(updated));
            return updated;
        });
    }, []);

    const clearCart = useCallback(async () => {
        try {
            await api.delete('/cart');
        } catch (err) {
            console.warn('Cart API error on clear:', err.message);
        }
        localStorage.removeItem('lh_local_cart');
        setItems([]);
    }, []);

    const toggleWishlist = useCallback(
        async (id) => {
            if (!isAuthenticated) {
                throw new Error('Please sign in to save items.');
            }
            try {
                const { data } = await api.post(`/wishlist/toggle/${id}`);
                if (data && typeof data.inWishlist === 'boolean') {
                    setWishlistIds((prev) => {
                        const updated = data.inWishlist
                            ? [...prev, id]
                            : prev.filter((x) => x !== id);
                        localStorage.setItem('lh_local_wishlist', JSON.stringify(updated));
                        return updated;
                    });
                    return;
                }
            } catch (err) {
                console.warn('Wishlist API error, toggling locally:', err.message);
            }
            setWishlistIds((prev) => {
                const exists = prev.includes(id);
                const updated = exists ? prev.filter((x) => x !== id) : [...prev, id];
                localStorage.setItem('lh_local_wishlist', JSON.stringify(updated));
                return updated;
            });
        },
        [isAuthenticated]
    );

    const cartCount = items.reduce((s, i) => s + i.qty, 0);
    const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0);

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