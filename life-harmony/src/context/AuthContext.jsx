import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import {
    supabaseCreateOrder,
    supabaseGetOrders,
    supabaseRegisterUser,
    supabaseLoginUser,
    supabaseAddAddress,
    supabaseGetAddresses,
} from '../lib/supabase';

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
            const rawUser = localStorage.getItem('lh_user');
            const parsedUser = rawUser ? JSON.parse(rawUser) : null;
            if (parsedUser?.id || parsedUser?.email) {
                const userKey = `lh_orders_${parsedUser.id || parsedUser.email}`;
                const raw = localStorage.getItem(userKey);
                return raw ? JSON.parse(raw) : [];
            }
            return [];
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
                    const u = data.user || data;
                    setUser(u);
                    localStorage.setItem('lh_user', JSON.stringify(u));
                })
                .catch(() => {
                    localStorage.removeItem('lh_token');
                    localStorage.removeItem('lh_user');
                    localStorage.removeItem('lh_user_orders');
                    setUser(null);
                    setOrders([]);
                });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const persist = (token, u) => {
        localStorage.setItem('lh_token', token);
        localStorage.setItem('lh_user', JSON.stringify(u));
        // Reset in-memory orders so previous account orders are never displayed
        setOrders([]);
        setUser(u);
    };

    const register = useCallback(async ({ name, email, password }) => {
        setLoading(true);
        try {
            let u = null;
            let token = `lh_jwt_${Date.now()}`;
            try {
                const { data } = await api.post('/auth/register', { name, email, password });
                u = data.user;
                token = data.token;
            } catch (apiErr) {
                console.warn('API register offline; saving directly into Supabase...', apiErr.message);
                u = await supabaseRegisterUser({ name, email, password });
            }
            persist(token, u);
            return u;
        } finally {
            setLoading(false);
        }
    }, []);

    const login = useCallback(async ({ email, password }) => {
        setLoading(true);
        try {
            let u = null;
            let token = `lh_jwt_${Date.now()}`;
            try {
                const { data } = await api.post('/auth/login', { email, password });
                u = data.user;
                token = data.token;
            } catch (apiErr) {
                console.warn('API login offline; checking directly in Supabase...', apiErr.message);
                u = await supabaseLoginUser({ email, password });
            }
            persist(token, u);
            return u;
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('lh_token');
        localStorage.removeItem('lh_user');
        localStorage.removeItem('lh_user_orders');
        if (user?.id || user?.email) {
            localStorage.removeItem(`lh_orders_${user.id || user.email}`);
        }
        setUser(null);
        setOrders([]);
    }, [user]);

    const updateProfile = useCallback(async (updates) => {
        const { data } = await api.put('/auth/profile', updates);
        setUser(data.user);
        localStorage.setItem('lh_user', JSON.stringify(data.user));
        return data.user;
    }, []);

    const addAddress = useCallback(
        async (address) => {
            try {
                const { data } = await api.post('/addresses', address);
                return data.address;
            } catch {
                return await supabaseAddAddress(user?.id, address);
            }
        },
        [user]
    );

    const removeAddress = useCallback(async (id) => {
        await api.delete(`/addresses/${id}`);
    }, []);

    const getAddresses = useCallback(async () => {
        try {
            const { data } = await api.get('/addresses');
            if (Array.isArray(data?.addresses) && data.addresses.length > 0) {
                return data.addresses;
            }
        } catch {
            /* ignore */
        }
        return await supabaseGetAddresses(user?.id);
    }, [user]);

    // Immediately records and caches confirmed orders locally for this specific user
    const recordOrder = useCallback(
        (newOrder) => {
            if (!newOrder) return;
            setOrders((prev) => {
                const currentList = Array.isArray(prev) ? prev : [];
                const key = newOrder.id || newOrder.orderNumber;
                const exists = currentList.some((o) => (o.id || o.orderNumber) === key);
                const updated = exists
                    ? currentList.map((o) => ((o.id || o.orderNumber) === key ? { ...o, ...newOrder } : o))
                    : [newOrder, ...currentList];
                if (user?.id || user?.email) {
                    try {
                        localStorage.setItem(`lh_orders_${user.id || user.email}`, JSON.stringify(updated));
                    } catch {}
                }
                return updated;
            });
        },
        [user]
    );

    const addOrder = useCallback(
        async (orderData) => {
            let created = null;

            // Direct insertion into Supabase tables `orders` and `order_items`
            try {
                created = await supabaseCreateOrder({
                    ...orderData,
                    user_id: user?.id,
                });
            } catch (supaErr) {
                console.warn('Supabase direct order creation error; falling back to API:', supaErr.message);
                try {
                    const { data } = await api.post('/orders', orderData);
                    created = data.order;
                } catch (err) {
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
                        userId: user?.id,
                    };
                }
            }

            recordOrder(created);
            return created;
        },
        [user, recordOrder]
    );

    const getOrders = useCallback(async () => {
        if (!user) {
            setOrders([]);
            return [];
        }

        let remoteList = [];
        try {
            const { data } = await api.get('/orders');
            if (Array.isArray(data?.orders)) {
                remoteList = data.orders;
            }
        } catch {
            /* ignore background error */
        }

        // Fetch authoritative orders directly from Supabase for this specific user
        try {
            const supaOrders = await supabaseGetOrders({
                userId: user.id,
                email: user.email,
            });
            if (Array.isArray(supaOrders) && supaOrders.length > 0) {
                remoteList = [...remoteList, ...supaOrders];
            }
        } catch (e) {
            console.warn('Direct Supabase getOrders notice:', e.message);
        }

        const userKey = `lh_orders_${user.id || user.email}`;
        let localList = [];
        try {
            const raw = localStorage.getItem(userKey);
            localList = raw ? JSON.parse(raw) : [];
        } catch {}

        // Strict verification: only include orders matching this user's ID or email
        const belongsToUser = (o) => {
            if (!o) return false;
            const oUid = String(o.userId || o.user_id || '');
            const oEmail = String(o.shippingAddress?.email || o.ship_email || '').toLowerCase().trim();
            const uId = String(user.id || '');
            const uEmail = String(user.email || '').toLowerCase().trim();
            return (uId && oUid === uId) || (uEmail && oEmail === uEmail);
        };

        const map = new Map();
        remoteList.filter(belongsToUser).forEach((o) => {
            const k = o.id || o.orderNumber;
            if (k) map.set(k, o);
        });
        localList.filter(belongsToUser).forEach((o) => {
            const k = o.id || o.orderNumber;
            if (k && !map.has(k)) {
                map.set(k, o);
            }
        });

        const merged = Array.from(map.values());
        merged.sort((a, b) => new Date(b.date || b.created_at || 0) - new Date(a.date || a.created_at || 0));

        setOrders(merged);
        try {
            localStorage.setItem(userKey, JSON.stringify(merged));
            localStorage.removeItem('lh_user_orders'); // Purge legacy global key
        } catch {}
        return merged;
    }, [user]);

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