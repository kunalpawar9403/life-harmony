// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const raw = localStorage.getItem('lh_user');
        return raw ? JSON.parse(raw) : null;
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
        const { data } = await api.get('/addresses');
        return data.addresses;
    }, []);

    const addOrder = useCallback(async (order) => {
        const { data } = await api.post('/orders', order);
        return data.order;
    }, []);

    const getOrders = useCallback(async () => {
        const { data } = await api.get('/orders');
        return data.orders;
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
                register,
                login,
                loginAsAdmin,
                logout,
                updateProfile,
                addAddress,
                removeAddress,
                getAddresses,
                addOrder,
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