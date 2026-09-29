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
            setItems(data.items);
        } catch {
            /* ignore */
        }
    }, [isAuthenticated]);

    const refreshWishlist = useCallback(async () => {
        if (!isAuthenticated) {
            setWishlistIds([]);
            return;
        }
        try {
            const { data } = await api.get('/wishlist/ids');
            setWishlistIds(data.ids);
        } catch {
            /* ignore */
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
            const { data } = await api.post('/cart/items', {
                productSlug: product.id,
                qty,
            });
            setItems(data.items);
        },
        [isAuthenticated]
    );

    const removeFromCart = useCallback(async (id) => {
        const { data } = await api.delete(`/cart/items/${id}`);
        setItems(data.items);
    }, []);

    const updateQty = useCallback(async (id, qty) => {
        const { data } = await api.put(`/cart/items/${id}`, { qty });
        setItems(data.items);
    }, []);

    const clearCart = useCallback(async () => {
        await api.delete('/cart');
        setItems([]);
    }, []);

    const toggleWishlist = useCallback(
        async (id) => {
            if (!isAuthenticated) {
                throw new Error('Please sign in to save items.');
            }
            const { data } = await api.post(`/wishlist/toggle/${id}`);
            setWishlistIds((prev) =>
                data.inWishlist ? [...prev, id] : prev.filter((x) => x !== id)
            );
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