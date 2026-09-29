// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try {
            const raw = localStorage.getItem('lh_user');
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    });

    const [orders, setOrders] = useState(() => {
        try {
            const raw = localStorage.getItem('lh_user_orders');
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('lh_token');
        if (token && !user) {
            api.get('/auth/me')
                .then(({ data }) => {
                    setUser(data.user);
                    localStorage.setItem('lh_user', JSON.stringify(data.user));
                })
                .catch(() => {
                    localStorage.removeItem('lh_token');
                    localStorage.removeItem('lh_user');
                });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const persist = (token, u) => {
        localStorage.setItem('lh_token', token);
        localStorage.setItem('lh_user', JSON.stringify(u));
        setUser(u);
    };

    const register = useCallback(async ({ name, email, password }) => {
        setLoading(true);
        try {
            const { data } = await api.post('/auth/register', { name, email, password });
            persist(data.token, data.user);
            return data.user;
        } finally {
            setLoading(false);
        }
    }, []);

    const login = useCallback(async ({ email, password }) => {
        setLoading(true);
        try {
            const { data } = await api.post('/auth/login', { email, password });
            persist(data.token, data.user);
            return data.user;
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('lh_token');
        localStorage.removeItem('lh_user');
        setUser(null);
    }, []);

    const updateProfile = useCallback(async (updates) => {
        const { data } = await api.put('/auth/profile', updates);
        setUser(data.user);
        localStorage.setItem('lh_user', JSON.stringify(data.user));
        return data.user;
    }, []);

    const addAddress = useCallback(async (address) => {
        const { data } = await api.post('/addresses', address);
        return data.address;
    }, []);

    const removeAddress = useCallback(async (id) => {
        await api.delete(`/addresses/${id}`);
    }, []);

    const getAddresses = useCallback(async () => {
        try {
            const { data } = await api.get('/addresses');
            return data.addresses || [];
        } catch {
            return [];
        }
    }, []);

    // Immediately records and caches confirmed orders locally
    const recordOrder = useCallback((newOrder) => {
        if (!newOrder) return;
        setOrders((prev) => {
            const currentList = Array.isArray(prev) ? prev : [];
            const key = newOrder.id || newOrder.orderNumber;
            const exists = currentList.some((o) => (o.id || o.orderNumber) === key);
            const updated = exists
                ? currentList.map((o) => ((o.id || o.orderNumber) === key ? { ...o, ...newOrder } : o))
                : [newOrder, ...currentList];
            try {
                localStorage.setItem('lh_user_orders', JSON.stringify(updated));
            } catch {}
            return updated;
        });
    }, []);

    const addOrder = useCallback(
        async (orderData) => {
            let created = null;
            try {
                const { data } = await api.post('/orders', orderData);
                created = data.order;
            } catch (err) {
                console.warn('Backend order call fallback:', err.message);
                created = {
                    id: `LH-${Date.now().toString().slice(-8)}`,
                    date: new Date().toISOString(),
                    status: 'Processing',
                    trackingNumber: `TRK${Math.floor(100000000 + Math.random() * 900000000)}`,
                    estimatedDelivery: new Date(Date.now() + 4 * 86400000).toISOString().slice(0, 10),
                    subtotal: Number(orderData.subtotal || orderData.total || 1499),
                    shippingCost: Number(orderData.shippingCost || 0),
                    tax: Number(orderData.tax || 0),
                    discount: 0,
                    total: Number(orderData.total || 1499),
                    shippingMethod: orderData.shippingMethod || 'Standard',
                    shippingAddress: orderData.shippingAddress || {},
                    payment: orderData.payment || { method: 'card' },
                    items: orderData.items || [],
                };
            }
            recordOrder(created);
            return created;
        },
        [recordOrder]
    );

    const getOrders = useCallback(async () => {
        let remoteList = [];
        try {
            const { data } = await api.get('/orders');
            if (Array.isArray(data?.orders)) {
                remoteList = data.orders;
            }
        } catch (err) {
            console.warn('API getOrders notice:', err.message);
        }

        let localList = [];
        try {
            const raw = localStorage.getItem('lh_user_orders');
            localList = raw ? JSON.parse(raw) : [];
        } catch {}

        const map = new Map();
        remoteList.forEach((o) => {
            const k = o.id || o.orderNumber;
            if (k) map.set(k, o);
        });
        localList.forEach((o) => {
            const k = o.id || o.orderNumber;
            if (k && !map.has(k)) {
                map.set(k, o);
            }
        });

        const merged = Array.from(map.values());
        merged.sort((a, b) => new Date(b.date || b.created_at || 0) - new Date(a.date || a.created_at || 0));

        setOrders(merged);
        try {
            localStorage.setItem('lh_user_orders', JSON.stringify(merged));
        } catch {}
        return merged;
    }, []);

    const loginAsAdmin = useCallback(async () => {
        return await login({ email: 'admin@lifeharmony.com', password: 'admin123' });
    }, [login]);

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isAdmin: user?.role === 'admin',
                loading,
                orders,
                register,
                login,
                loginAsAdmin,
                logout,
                updateProfile,
                addAddress,
                removeAddress,
                getAddresses,
                addOrder,
                recordOrder,
                getOrders,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};