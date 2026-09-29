// src/pages/Admin.jsx
import { useState, useEffect, useCallback } from 'react';
import {
    ShieldCheck,
    TrendingUp,
    Package,
    ShoppingCart,
    Users,
    Settings,
    Plus,
    Search,
    ArrowUpRight,
    CheckCircle2,
    Clock,
    Trash2,
    Eye,
    RefreshCw,
    AlertTriangle,
    IndianRupee,
    ChevronRight,
    Sparkles,
    Lock,
    LogOut,
    ExternalLink,
    X,
    Edit3
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/use-toast';
import api from '../lib/api';

const CATEGORIES = [
    { id: 'all', label: 'All Categories' },
    { id: 'vitamins', label: 'Vitamins' },
    { id: 'supplements', label: 'Supplements' },
    { id: 'pick_of_month', label: 'Pick of the Month' },
    { id: 'offer_set', label: 'Offer Sets' },
];

const AVAILABLE_GOALS = [
    { slug: 'immunity', label: 'Immunity' },
    { slug: 'energy', label: 'Energy' },
    { slug: 'sleep', label: 'Sleep' },
    { slug: 'beauty', label: 'Beauty' },
    { slug: 'heart', label: 'Heart' },
    { slug: 'brain', label: 'Brain' },
    { slug: 'digestion', label: 'Digestion' },
];

export default function Admin() {
    const { user, isAuthenticated, isAdmin, login, logout } = useAuth();
    const { toast } = useToast();

    const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'products' | 'orders' | 'users' | 'settings'
    const [loading, setLoading] = useState(false);

    // Dashboard stats
    const [stats, setStats] = useState(null);

    // Products
    const [products, setProducts] = useState([]);
    const [productSearch, setProductSearch] = useState('');
    const [productCategory, setProductCategory] = useState('all');
    const [productModalOpen, setProductModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [productFormData, setProductFormData] = useState({
        name: '',
        subtitle: '',
        description: '',
        price: '',
        originalPrice: '',
        category: 'supplements',
        stock: '100',
        image: '',
        goals: [],
        benefits: '',
    });

    // Orders
    const [orders, setOrders] = useState([]);
    const [orderSearch, setOrderSearch] = useState('');
    const [orderStatusFilter, setOrderStatusFilter] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [updatingOrderId, setUpdatingOrderId] = useState(null);
    const [trackingInput, setTrackingInput] = useState('');

    // Users
    const [usersList, setUsersList] = useState([]);
    const [userSearch, setUserSearch] = useState('');

    // Admin Auth State for Gate (starts empty by default)
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [authError, setAuthError] = useState('');
    const [authLoading, setAuthLoading] = useState(false);

    // Fetch stats
    const fetchStats = useCallback(async () => {
        try {
            const { data } = await api.get('/admin/stats');
            setStats(data);
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        }
    }, []);

    // Fetch products
    const fetchProducts = useCallback(async () => {
        try {
            const { data } = await api.get('/admin/products', {
                params: {
                    category: productCategory !== 'all' ? productCategory : undefined,
                    search: productSearch || undefined,
                },
            });
            setProducts(data.products || []);
        } catch (err) {
            console.error('Failed to fetch products:', err);
        }
    }, [productCategory, productSearch]);

    // Fetch orders
    const fetchOrders = useCallback(async () => {
        try {
            const { data } = await api.get('/admin/orders', {
                params: {
                    status: orderStatusFilter !== 'all' ? orderStatusFilter : undefined,
                    search: orderSearch || undefined,
                },
            });
            setOrders(data.orders || []);
        } catch (err) {
            console.error('Failed to fetch orders:', err);
        }
    }, [orderStatusFilter, orderSearch]);

    // Fetch users
    const fetchUsers = useCallback(async () => {
        try {
            const { data } = await api.get('/admin/users', {
                params: { search: userSearch || undefined },
            });
            setUsersList(data.users || []);
        } catch (err) {
            console.error('Failed to fetch users:', err);
        }
    }, [userSearch]);

    // Initial load when admin is authenticated
    useEffect(() => {
        if (isAuthenticated && isAdmin) {
            setLoading(true);
            Promise.all([fetchStats(), fetchProducts(), fetchOrders(), fetchUsers()])
                .finally(() => setLoading(false));
        }
    }, [isAuthenticated, isAdmin, fetchStats, fetchProducts, fetchOrders, fetchUsers]);

    // Reload tab data when tab changes
    useEffect(() => {
        if (!isAuthenticated || !isAdmin) return;
        if (activeTab === 'overview') fetchStats();
        if (activeTab === 'products') fetchProducts();
        if (activeTab === 'orders') fetchOrders();
        if (activeTab === 'users') fetchUsers();
    }, [activeTab, isAuthenticated, isAdmin, fetchStats, fetchProducts, fetchOrders, fetchUsers]);

    // Handle Admin Login with strict validation
    const handleAdminLogin = async (e) => {
        if (e) e.preventDefault();
        if (!loginEmail.trim() || !loginPassword) {
            setAuthError('Please enter both your admin email and password.');
            return;
        }

        setAuthLoading(true);
        setAuthError('');
        try {
            const u = await login({ email: loginEmail.trim().toLowerCase(), password: loginPassword });
            if (u.role !== 'admin') {
                logout(); // Immediately purge non-admin session
                setAuthError(`Access Denied: Account "${u.email}" is a customer account and does not have administrator privileges.`);
            } else {
                toast({ title: 'Admin Authenticated', description: `Welcome back, ${u.name}!` });
            }
        } catch (err) {
            setAuthError(err.response?.data?.message || 'Invalid administrator credentials. Please check and try again.');
        } finally {
            setAuthLoading(false);
        }
    };

    // Quick Autofill Helper for Testing
    const handleAutofillDemo = () => {
        setLoginEmail('admin@lifeharmony.com');
        setLoginPassword('admin123');
        setAuthError('');
    };

    // Universal Admin Sign Out
    const handleSignOut = () => {
        logout();
        setStats(null);
        setProducts([]);
        setOrders([]);
        setUsersList([]);
        setLoginEmail('');
        setLoginPassword('');
        setAuthError('');
        toast({ title: 'Signed Out', description: 'Admin session terminated securely.' });
    };

    // ==========================================
    // PRODUCT ACTIONS
    // ==========================================
    const openAddProductModal = () => {
        setEditingProduct(null);
        setProductFormData({
            name: '',
            subtitle: '',
            description: '',
            price: '',
            originalPrice: '',
            category: 'supplements',
            stock: '100',
            image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?crop=entropy&cs=srgb&fm=jpg&q=85',
            goals: ['energy', 'immunity'],
            benefits: 'High potency formulation\nDaily cellular vitality\n100% vegan capsules',
        });
        setProductModalOpen(true);
    };

    const openEditProductModal = (product) => {
        setEditingProduct(product);
        setProductFormData({
            name: product.name || '',
            subtitle: product.subtitle || '',
            description: product.description || '',
            price: String(product.price || ''),
            originalPrice: product.originalPrice ? String(product.originalPrice) : '',
            category: product.category || 'supplements',
            stock: String(product.stock ?? 100),
            image: product.image || '',
            goals: Array.isArray(product.goals) ? product.goals : [],
            benefits: Array.isArray(product.benefits) ? product.benefits.join('\n') : '',
        });
        setProductModalOpen(true);
    };

    const handleSaveProduct = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                name: productFormData.name,
                subtitle: productFormData.subtitle,
                description: productFormData.description,
                price: parseFloat(productFormData.price),
                originalPrice: productFormData.originalPrice ? parseFloat(productFormData.originalPrice) : null,
                category: productFormData.category,
                stock: parseInt(productFormData.stock, 10) || 0,
                image: productFormData.image,
                goals: productFormData.goals,
                benefits: productFormData.benefits.split('\n').map(s => s.trim()).filter(Boolean),
            };

            if (editingProduct) {
                await api.put(`/admin/products/${editingProduct.id}`, payload);
                toast({ title: 'Product Updated', description: `${payload.name} updated successfully.` });
            } else {
                await api.post('/admin/products', payload);
                toast({ title: 'Product Created', description: `${payload.name} added to catalog.` });
            }

            setProductModalOpen(false);
            fetchProducts();
            fetchStats();
        } catch (err) {
            toast({
                title: 'Error saving product',
                description: err.response?.data?.message || err.message,
                variant: 'destructive',
            });
        }
    };

    const handleDeleteProduct = async (id, name) => {
        if (!window.confirm(`Are you sure you want to permanently delete '${name}'?`)) return;
        try {
            await api.delete(`/admin/products/${id}`);
            toast({ title: 'Product Deleted', description: `${name} has been removed.` });
            fetchProducts();
            fetchStats();
        } catch (err) {
            toast({ title: 'Error deleting product', description: err.response?.data?.message || err.message, variant: 'destructive' });
        }
    };

    const handleQuickStockUpdate = async (id, delta) => {
        try {
            const { data } = await api.patch(`/admin/products/${id}/stock`, { delta });
            setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: data.product.stock } : p));
            toast({ title: 'Stock Updated', description: `Inventory set to ${data.product.stock}` });
        } catch (err) {
            toast({ title: 'Failed to update stock', description: err.message, variant: 'destructive' });
        }
    };

    // ==========================================
    // ORDER ACTIONS
    // ==========================================
    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        setUpdatingOrderId(orderId);
        try {
            const { data } = await api.patch(`/admin/orders/${orderId}/status`, { status: newStatus });
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: data.order.status } : o));
            if (selectedOrder && selectedOrder.id === orderId) {
                setSelectedOrder(prev => ({ ...prev, status: data.order.status }));
            }
            toast({ title: 'Order Status Changed', description: `Order #${data.order.order_number} marked as ${newStatus}` });
            fetchStats();
        } catch (err) {
            toast({ title: 'Failed to update status', description: err.message, variant: 'destructive' });
        } finally {
            setUpdatingOrderId(null);
        }
    };

    const handleSaveTrackingNumber = async () => {
        if (!selectedOrder) return;
        try {
            const { data } = await api.patch(`/admin/orders/${selectedOrder.id}/status`, {
                trackingNumber: trackingInput,
            });
            setSelectedOrder(prev => ({ ...prev, tracking_number: data.order.tracking_number }));
            setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, tracking_number: data.order.tracking_number } : o));
            toast({ title: 'Tracking Updated', description: `Tracking #${data.order.tracking_number} saved.` });
        } catch (err) {
            toast({ title: 'Failed to save tracking', description: err.message, variant: 'destructive' });
        }
    };

    const viewOrderDetails = async (orderId) => {
        try {
            const { data } = await api.get(`/admin/orders/${orderId}`);
            setSelectedOrder(data.order);
            setTrackingInput(data.order.tracking_number || '');
        } catch (err) {
            toast({ title: 'Error loading order details', description: err.message, variant: 'destructive' });
        }
    };

    // ==========================================
    // USER ACTIONS
    // ==========================================
    const handleToggleUserRole = async (userId, currentRole) => {
        const nextRole = currentRole === 'admin' ? 'customer' : 'admin';
        if (!window.confirm(`Change this user's role to '${nextRole}'?`)) return;
        try {
            const { data } = await api.patch(`/admin/users/${userId}/role`, { role: nextRole });
            setUsersList(prev => prev.map(u => u.id === userId ? { ...u, role: data.user.role } : u));
            toast({ title: 'Role Updated', description: `${data.user.name} role changed to ${data.user.role}.` });
        } catch (err) {
            toast({ title: 'Failed to change role', description: err.response?.data?.message || err.message, variant: 'destructive' });
        }
    };

    // ==========================================
    // AUTH GATE RENDER (WHEN NOT LOGGED IN AS ADMIN)
    // ==========================================
    if (!isAuthenticated || !isAdmin) {
        return (
            <div className="min-h-[85vh] flex items-center justify-center py-12 px-4">
                <div className="section-bg rounded-[36px] p-8 sm:p-12 max-w-md w-full border border-white/80 shadow-2xl relative overflow-hidden">
                    {/* Brand header */}
                    <div className="flex flex-col items-center text-center mb-8">
                        <div className="w-14 h-14 rounded-2xl bg-[#1c1c21] text-white flex items-center justify-center shadow-lg mb-4">
                            <ShieldCheck className="w-7 h-7 text-[#adc8f8]" />
                        </div>
                        <span className="text-[11px] font-bold uppercase tracking-widest text-[#2563eb] bg-[#eff6ff] px-3 py-1 rounded-full border border-[#bfdbfe] mb-2">
                            Restricted Console
                        </span>
                        <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#1c1c21]">
                            Life Harmony Admin
                        </h2>
                        <p className="text-xs text-[#65656d] mt-2 leading-relaxed">
                            Please sign in with your administrator account to access the store operations dashboard.
                        </p>
                    </div>

                    {/* Customer Account Alert (if logged in as non-admin) */}
                    {isAuthenticated && !isAdmin && (
                        <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs space-y-2">
                            <div className="flex items-center gap-2 font-semibold">
                                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                                <span>Customer Account Detected</span>
                            </div>
                            <p className="text-[11px] leading-relaxed">
                                You are signed in as <strong>{user.email}</strong>, which does not have administrator privileges.
                            </p>
                            <button
                                onClick={handleSignOut}
                                className="w-full h-9 rounded-xl bg-amber-200/80 hover:bg-amber-300/80 text-amber-900 font-semibold text-[11px] transition-colors"
                            >
                                Sign Out of Customer Account
                            </button>
                        </div>
                    )}

                    {/* Error Notice */}
                    {authError && (
                        <div className="mb-6 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5">
                            <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
                            <span className="leading-snug">{authError}</span>
                        </div>
                    )}

                    {/* Sign-in Form */}
                    <form onSubmit={handleAdminLogin} className="space-y-4">
                        <div>
                            <label className="text-xs font-semibold text-[#1c1c21] block mb-1.5">
                                Admin Email
                            </label>
                            <input
                                type="email"
                                value={loginEmail}
                                onChange={(e) => setLoginEmail(e.target.value)}
                                className="w-full h-12 px-4 rounded-2xl bg-white/80 border border-[#363636]/15 text-sm focus:outline-hidden focus:border-[#1c1c21] transition-all shadow-xs"
                                placeholder="name@lifeharmony.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-[#1c1c21] block mb-1.5">
                                Password
                            </label>
                            <input
                                type="password"
                                value={loginPassword}
                                onChange={(e) => setLoginPassword(e.target.value)}
                                className="w-full h-12 px-4 rounded-2xl bg-white/80 border border-[#363636]/15 text-sm focus:outline-hidden focus:border-[#1c1c21] transition-all shadow-xs"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={authLoading}
                            className="btn-dark w-full h-12 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 shadow-md disabled:opacity-60 transition-all mt-2"
                        >
                            {authLoading ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    <Lock className="w-4 h-4 text-[#adc8f8]" />
                                    <span>Sign In to Dashboard</span>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Autofill Demo Helper */}
                    <div className="mt-6 pt-5 border-t border-[#363636]/10 text-center space-y-3">
                        <button
                            type="button"
                            onClick={handleAutofillDemo}
                            className="text-xs font-semibold text-[#2563eb] hover:underline inline-flex items-center gap-1.5"
                        >
                            <Sparkles className="w-3.5 h-3.5 text-[#3b82f6]" />
                            <span>Autofill Demo Admin Credentials</span>
                        </button>
                        <div>
                            <Link
                                to="/"
                                className="text-xs text-[#70707a] hover:text-[#1c1c21] font-medium transition-colors"
                            >
                                &larr; Return to Storefront
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ==========================================
    // MAIN ADMIN DASHBOARD RENDER
    // ==========================================
    return (
        <div className="space-y-6 animate-in fade-in duration-200">
            {/* Top Navigation & Brand Header */}
            <header className="section-bg rounded-[32px] p-5 md:p-6 border border-white/90 shadow-glass-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Brand & Title */}
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#1c1c21] text-white flex items-center justify-center shadow-sm shrink-0">
                        <ShieldCheck className="w-6 h-6 text-[#adc8f8]" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="font-display text-xl font-bold tracking-tight text-[#1c1c21]">
                                Life Harmony
                            </h1>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe]">
                                Admin Console
                            </span>
                        </div>
                        <p className="text-xs text-[#7a7a7a]">
                            Store Operations & Catalog Management • Native Currency: <span className="font-bold text-[#1c1c21]">₹ (INR)</span>
                        </p>
                    </div>
                </div>

                {/* Operator Chip & Action Controls */}
                <div className="flex flex-wrap items-center gap-2.5">
                    {/* Active Operator Chip */}
                    <div className="flex items-center gap-2 h-10 pl-2 pr-3.5 rounded-full glass-pill border border-white/90 shadow-xs">
                        <span className="w-7 h-7 rounded-full bg-[#1c1c21] text-white flex items-center justify-center font-bold text-xs">
                            {user?.name?.charAt(0).toUpperCase() || 'A'}
                        </span>
                        <div className="text-left">
                            <span className="font-semibold text-xs text-[#1c1c21] block leading-none truncate max-w-[120px]">
                                {user?.name}
                            </span>
                            <span className="text-[10px] text-[#7a7a7a] font-medium leading-none">
                                Administrator
                            </span>
                        </div>
                    </div>

                    {/* Visit Store */}
                    <Link
                        to="/"
                        target="_blank"
                        className="h-10 px-4 rounded-full glass-pill hover:bg-white text-xs font-semibold flex items-center gap-1.5 transition-all text-[#1c1c21] shadow-xs"
                        title="Open Consumer Store in New Tab"
                    >
                        <span>Store</span>
                        <ExternalLink className="w-3.5 h-3.5 text-[#7a7a7a]" />
                    </Link>

                    {/* Prominent Sign Out Button */}
                    <button
                        onClick={handleSignOut}
                        className="h-10 px-4 rounded-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200/80 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
                        title="Sign Out of Administrator Session"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </header>

            {/* Sub-Header Navigation Tabs & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Navigation Pills */}
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {[
                        { id: 'overview', label: 'Overview', icon: TrendingUp },
                        { id: 'products', label: `Products (${products.length || stats?.totalProducts || 0})`, icon: Package },
                        { id: 'orders', label: `Orders (${orders.length || stats?.totalOrders || 0})`, icon: ShoppingCart },
                        { id: 'users', label: `Customers (${usersList.length || stats?.totalUsers || 0})`, icon: Users },
                        { id: 'settings', label: 'System Health', icon: Settings },
                    ].map((tab) => {
                        const Icon = tab.icon;
                        const active = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                                    active
                                        ? 'bg-[#1c1c21] text-white shadow-md'
                                        : 'glass-pill text-[#65656d] hover:bg-white hover:text-[#1c1c21]'
                                }`}
                            >
                                <Icon className={`w-3.5 h-3.5 ${active ? 'text-[#adc8f8]' : 'text-[#7a7a7a]'}`} />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Quick Add Product & Refresh */}
                <div className="flex items-center gap-2 shrink-0">
                    <button
                        onClick={() => {
                            fetchStats();
                            fetchProducts();
                            fetchOrders();
                            toast({ title: 'Refreshed', description: 'Dashboard updated with latest data.' });
                        }}
                        className="w-10 h-10 rounded-full glass-pill hover:bg-white flex items-center justify-center text-[#1c1c21] transition-all shadow-xs"
                        title="Refresh data"
                    >
                        <RefreshCw className="w-4 h-4 text-[#7a7a7a]" />
                    </button>
                    <button
                        onClick={openAddProductModal}
                        className="btn-dark h-10 px-5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                    >
                        <Plus className="w-4 h-4 text-[#adc8f8]" />
                        <span>Add Product</span>
                    </button>
                </div>
            </div>

            {/* ================================================= */}
            {/* TAB: DASHBOARD OVERVIEW */}
            {/* ================================================= */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    {/* Metrics Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Total Revenue */}
                        <div className="section-bg rounded-[28px] p-6 border border-white/90 shadow-glass-sm card-shadow-hover relative overflow-hidden">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] uppercase font-bold tracking-wider text-[#7a7a7a]">
                                    Total Revenue
                                </span>
                                <div className="w-10 h-10 rounded-2xl bg-[#eff6ff] text-[#2563eb] flex items-center justify-center">
                                    <IndianRupee className="w-5 h-5 font-bold" />
                                </div>
                            </div>
                            <div className="mt-4 font-display text-3xl font-bold text-[#1c1c21]">
                                ₹{stats ? Number(stats.totalRevenue).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
                            </div>
                            <div className="mt-2 text-xs text-[#10b981] flex items-center gap-1 font-medium">
                                <ArrowUpRight className="w-3.5 h-3.5" />
                                <span>{stats?.totalOrders || 0} non-cancelled orders</span>
                            </div>
                        </div>

                        {/* Orders Breakdown */}
                        <div className="section-bg rounded-[28px] p-6 border border-white/90 shadow-glass-sm card-shadow-hover">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] uppercase font-bold tracking-wider text-[#7a7a7a]">
                                    Orders Breakdown
                                </span>
                                <div className="w-10 h-10 rounded-2xl bg-[#f0fdf4] text-[#16a34a] flex items-center justify-center">
                                    <ShoppingCart className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="mt-4 font-display text-3xl font-bold text-[#1c1c21]">
                                {stats?.totalOrders || 0}
                            </div>
                            <div className="mt-2 flex items-center gap-2 text-[11px] text-[#7a7a7a] font-medium">
                                <span className="text-[#3b82f6] font-semibold">{stats?.processingOrders || 0} proc.</span>
                                <span>•</span>
                                <span className="text-[#8b5cf6] font-semibold">{stats?.shippedOrders || 0} ship.</span>
                                <span>•</span>
                                <span className="text-[#10b981] font-semibold">{stats?.deliveredOrders || 0} deliv.</span>
                            </div>
                        </div>

                        {/* Products in Store */}
                        <div className="section-bg rounded-[28px] p-6 border border-white/90 shadow-glass-sm card-shadow-hover">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] uppercase font-bold tracking-wider text-[#7a7a7a]">
                                    Products Catalog
                                </span>
                                <div className="w-10 h-10 rounded-2xl bg-[#fdf4ff] text-[#a855f7] flex items-center justify-center">
                                    <Package className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="mt-4 font-display text-3xl font-bold text-[#1c1c21]">
                                {stats?.totalProducts || products.length || 0}
                            </div>
                            <div className="mt-2 text-xs flex items-center gap-1.5 font-medium">
                                {stats?.lowStockProducts > 0 ? (
                                    <span className="text-amber-600 flex items-center gap-1">
                                        <AlertTriangle className="w-3.5 h-3.5" />
                                        {stats.lowStockProducts} Low Stock items
                                    </span>
                                ) : (
                                    <span className="text-[#10b981] flex items-center gap-1">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        All catalog stock healthy
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Registered Users */}
                        <div className="section-bg rounded-[28px] p-6 border border-white/90 shadow-glass-sm card-shadow-hover">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] uppercase font-bold tracking-wider text-[#7a7a7a]">
                                    Registered Users
                                </span>
                                <div className="w-10 h-10 rounded-2xl bg-[#fff7ed] text-[#ea580c] flex items-center justify-center">
                                    <Users className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="mt-4 font-display text-3xl font-bold text-[#1c1c21]">
                                {stats?.totalUsers || usersList.length || 0}
                            </div>
                            <div className="mt-2 text-xs text-[#7a7a7a] font-medium">
                                <span>{stats?.totalCustomers || 0} active customer accounts</span>
                            </div>
                        </div>
                    </div>

                    {/* Sales Velocity & Recent Orders */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Daily Sales Trend */}
                        <div className="lg:col-span-7 section-bg rounded-[32px] p-6 md:p-8 border border-white/90 shadow-glass-sm flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="font-display text-lg font-bold text-[#1c1c21]">
                                            Sales & Settlement Velocity
                                        </h3>
                                        <p className="text-xs text-[#7a7a7a]">
                                            Revenue generated per settlement day
                                        </p>
                                    </div>
                                    <span className="text-[11px] font-bold bg-[#eff6ff] text-[#2563eb] px-3 py-1 rounded-full border border-[#bfdbfe]">
                                        INR Settlement
                                    </span>
                                </div>

                                <div className="mt-6 space-y-3">
                                    {stats?.dailyTrends && stats.dailyTrends.length > 0 ? (
                                        stats.dailyTrends.map((t) => {
                                            const maxRevenue = Math.max(...stats.dailyTrends.map(x => x.revenue), 1000);
                                            const pct = Math.max(12, Math.round((t.revenue / maxRevenue) * 100));
                                            return (
                                                <div key={t.date} className="space-y-1">
                                                    <div className="flex justify-between text-xs font-medium">
                                                        <span className="text-[#363636] font-mono">{t.date}</span>
                                                        <span className="text-[#1c1c21] font-bold">
                                                            ₹{t.revenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })} ({t.orders} {t.orders === 1 ? 'order' : 'orders'})
                                                        </span>
                                                    </div>
                                                    <div className="w-full h-3 rounded-full bg-black/5 overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full bg-gradient-to-r from-[#adc8f8] to-[#2563eb] transition-all duration-500"
                                                            style={{ width: `${pct}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="py-8 text-center text-xs text-[#7a7a7a]">
                                            No recent orders to compute trend chart.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Category Distribution */}
                            <div className="mt-8 pt-6 border-t border-[#363636]/10">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-[#7a7a7a] mb-3">
                                    Catalog Distribution by Category
                                </h4>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {stats?.categoryCounts?.map((c) => (
                                        <div key={c.category} className="p-3 bg-white/70 rounded-2xl border border-white/90 shadow-xs">
                                            <span className="text-[11px] font-semibold text-[#7a7a7a] capitalize block truncate">
                                                {c.category.replace(/_/g, ' ')}
                                            </span>
                                            <span className="font-display text-lg font-bold text-[#1c1c21]">
                                                {c.count} items
                                            </span>
                                            <span className="text-[10px] text-[#2563eb] block mt-0.5">
                                                Avg ₹{Math.round(Number(c.avgPrice))}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Recent Orders Feed */}
                        <div className="lg:col-span-5 section-bg rounded-[32px] p-6 md:p-8 border border-white/90 shadow-glass-sm flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="font-display text-lg font-bold text-[#1c1c21]">
                                            Recent Orders
                                        </h3>
                                        <p className="text-xs text-[#7a7a7a]">
                                            Latest checkout activity
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setActiveTab('orders')}
                                        className="text-xs text-[#2563eb] font-semibold hover:underline flex items-center gap-1"
                                    >
                                        View all ({orders.length})
                                        <ChevronRight className="w-3.5 h-3.5" />
                                    </button>
                                </div>

                                <div className="space-y-3 mt-4">
                                    {stats?.recentOrders?.length > 0 ? (
                                        stats.recentOrders.map((o) => (
                                            <div
                                                key={o.id}
                                                className="p-3.5 rounded-2xl bg-white/70 hover:bg-white transition-all border border-white/90 shadow-xs flex items-center justify-between"
                                            >
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-mono font-bold text-[#1c1c21]">
                                                            {o.order_number}
                                                        </span>
                                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                                            o.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                                            o.status === 'Shipped' ? 'bg-purple-100 text-purple-700' :
                                                            o.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                                            'bg-blue-100 text-blue-700'
                                                        }`}>
                                                            {o.status}
                                                        </span>
                                                    </div>
                                                    <div className="text-[11px] text-[#7a7a7a] truncate mt-0.5">
                                                        {o.ship_name || o.ship_email || 'Customer'} • {o.itemCount} items
                                                    </div>
                                                </div>
                                                <div className="text-right pl-3 shrink-0">
                                                    <div className="font-display text-sm font-bold text-[#1c1c21]">
                                                        ₹{Number(o.total).toFixed(2)}
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            setActiveTab('orders');
                                                            viewOrderDetails(o.id);
                                                        }}
                                                        className="text-[11px] text-[#2563eb] font-medium hover:underline mt-0.5"
                                                    >
                                                        Details
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-8 text-center text-xs text-[#7a7a7a]">
                                            No orders placed yet.
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-[#363636]/10 flex gap-2">
                                <button
                                    onClick={openAddProductModal}
                                    className="btn-dark flex-1 h-11 rounded-2xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm"
                                >
                                    <Plus className="w-4 h-4 text-[#adc8f8]" /> Add Product
                                </button>
                                <button
                                    onClick={() => {
                                        setOrderStatusFilter('Processing');
                                        setActiveTab('orders');
                                    }}
                                    className="flex-1 h-11 rounded-2xl glass-pill hover:bg-white text-[#1c1c21] text-xs font-semibold flex items-center justify-center gap-1.5 border border-white/90 shadow-xs"
                                >
                                    <Clock className="w-4 h-4 text-[#2563eb]" /> Pending Orders
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ================================================= */}
            {/* TAB: PRODUCTS CATALOG */}
            {/* ================================================= */}
            {activeTab === 'products' && (
                <div className="space-y-6">
                    {/* Controls Bar */}
                    <div className="section-bg rounded-[32px] p-5 border border-white/90 shadow-glass-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-3 flex-1">
                            <div className="relative min-w-[220px] flex-1 max-w-sm">
                                <Search className="w-4 h-4 text-[#7a7a7a] absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    value={productSearch}
                                    onChange={(e) => setProductSearch(e.target.value)}
                                    placeholder="Search by title, formulation..."
                                    className="w-full h-10 pl-10 pr-4 rounded-full bg-white/80 border border-[#363636]/15 text-xs focus:outline-hidden focus:border-[#1c1c21] shadow-xs"
                                />
                            </div>

                            <div className="flex flex-wrap gap-1.5">
                                {CATEGORIES.map((c) => (
                                    <button
                                        key={c.id}
                                        onClick={() => setProductCategory(c.id)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                                            productCategory === c.id
                                                ? 'bg-[#1c1c21] text-white shadow-xs'
                                                : 'glass-pill text-[#65656d] hover:bg-white'
                                        }`}
                                    >
                                        {c.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={openAddProductModal}
                            className="btn-dark px-5 h-10 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm shrink-0"
                        >
                            <Plus className="w-4 h-4 text-[#adc8f8]" /> Add Product
                        </button>
                    </div>

                    {/* Products Table */}
                    <div className="section-bg rounded-[32px] border border-white/90 shadow-glass-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="bg-white/60 text-[#7a7a7a] uppercase font-bold tracking-wider border-b border-[#363636]/10">
                                        <th className="py-4 px-6">Product</th>
                                        <th className="py-4 px-4">Category</th>
                                        <th className="py-4 px-4">Price (INR)</th>
                                        <th className="py-4 px-4">Stock Level</th>
                                        <th className="py-4 px-4 text-center">Adjust Stock</th>
                                        <th className="py-4 px-6 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-black/5">
                                    {products.map((p) => {
                                        const isLow = p.stock < 15;
                                        const isOut = p.stock <= 0;
                                        return (
                                            <tr key={p.id} className="hover:bg-white/60 transition-colors">
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-12 rounded-xl bg-white overflow-hidden border border-black/5 shadow-xs shrink-0">
                                                            {p.image ? (
                                                                <img
                                                                    src={p.image}
                                                                    alt={p.name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <Package className="w-6 h-6 m-auto text-gray-300" />
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="font-semibold text-sm text-[#1c1c21] truncate max-w-[240px]">
                                                                {p.name}
                                                            </div>
                                                            <div className="text-[11px] text-[#7a7a7a] truncate max-w-[240px]">
                                                                {p.subtitle || p.slug}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="py-4 px-4">
                                                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#eff6ff] text-[#1e40af] border border-[#bfdbfe] capitalize">
                                                        {p.category.replace(/_/g, ' ')}
                                                    </span>
                                                </td>

                                                <td className="py-4 px-4">
                                                    <div className="font-display text-sm font-bold text-[#1c1c21]">
                                                        ₹{Number(p.price).toFixed(2)}
                                                    </div>
                                                    {p.originalPrice && (
                                                        <div className="text-[10px] text-[#7a7a7a] line-through">
                                                            ₹{Number(p.originalPrice).toFixed(2)}
                                                        </div>
                                                    )}
                                                </td>

                                                <td className="py-4 px-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                                        isOut ? 'bg-red-100 text-red-700' :
                                                        isLow ? 'bg-amber-100 text-amber-700' :
                                                        'bg-green-100 text-green-700'
                                                    }`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${
                                                            isOut ? 'bg-red-500' : isLow ? 'bg-amber-500' : 'bg-green-500'
                                                        }`} />
                                                        {p.stock} units
                                                    </span>
                                                </td>

                                                <td className="py-4 px-4 text-center">
                                                    <div className="inline-flex items-center gap-1 bg-white/80 border border-[#363636]/15 rounded-full p-0.5 shadow-xs">
                                                        <button
                                                            onClick={() => handleQuickStockUpdate(p.id, -5)}
                                                            className="w-6 h-6 rounded-full hover:bg-black/5 flex items-center justify-center text-xs font-bold text-[#363636] transition-colors"
                                                            title="Subtract 5"
                                                        >
                                                            -5
                                                        </button>
                                                        <button
                                                            onClick={() => handleQuickStockUpdate(p.id, -1)}
                                                            className="w-6 h-6 rounded-full hover:bg-black/5 flex items-center justify-center text-xs font-bold text-[#363636] transition-colors"
                                                            title="Subtract 1"
                                                        >
                                                            -1
                                                        </button>
                                                        <button
                                                            onClick={() => handleQuickStockUpdate(p.id, 1)}
                                                            className="w-6 h-6 rounded-full hover:bg-black/5 flex items-center justify-center text-xs font-bold text-[#363636] transition-colors"
                                                            title="Add 1"
                                                        >
                                                            +1
                                                        </button>
                                                        <button
                                                            onClick={() => handleQuickStockUpdate(p.id, 10)}
                                                            className="w-6 h-6 rounded-full hover:bg-black/5 flex items-center justify-center text-xs font-bold text-[#363636] transition-colors"
                                                            title="Add 10"
                                                        >
                                                            +10
                                                        </button>
                                                    </div>
                                                </td>

                                                <td className="py-4 px-6 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => openEditProductModal(p)}
                                                            className="p-2 rounded-xl bg-white/80 hover:bg-[#eff6ff] hover:text-[#2563eb] text-[#363636] transition-colors shadow-xs"
                                                            title="Edit Product"
                                                        >
                                                            <Edit3 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteProduct(p.id, p.name)}
                                                            className="p-2 rounded-xl bg-white/80 hover:bg-red-50 hover:text-red-600 text-[#363636] transition-colors shadow-xs"
                                                            title="Delete Product"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ================================================= */}
            {/* TAB: ORDERS MANAGEMENT */}
            {/* ================================================= */}
            {activeTab === 'orders' && (
                <div className="space-y-6">
                    <div className="section-bg rounded-[32px] p-5 border border-white/90 shadow-glass-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-3 flex-1">
                            <div className="relative min-w-[240px] flex-1 max-w-sm">
                                <Search className="w-4 h-4 text-[#7a7a7a] absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    value={orderSearch}
                                    onChange={(e) => setOrderSearch(e.target.value)}
                                    placeholder="Search by Order #, customer..."
                                    className="w-full h-10 pl-10 pr-4 rounded-full bg-white/80 border border-[#363636]/15 text-xs focus:outline-hidden focus:border-[#1c1c21] shadow-xs"
                                />
                            </div>

                            <div className="flex flex-wrap gap-1.5">
                                {['all', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((st) => (
                                    <button
                                        key={st}
                                        onClick={() => setOrderStatusFilter(st)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                                            orderStatusFilter === st
                                                ? 'bg-[#1c1c21] text-white shadow-xs'
                                                : 'glass-pill text-[#65656d] hover:bg-white'
                                        }`}
                                    >
                                        {st === 'all' ? 'All Orders' : st}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <span className="text-xs text-[#7a7a7a] font-medium shrink-0">
                            Showing {orders.length} orders
                        </span>
                    </div>

                    <div className="section-bg rounded-[32px] border border-white/90 shadow-glass-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="bg-white/60 text-[#7a7a7a] uppercase font-bold tracking-wider border-b border-[#363636]/10">
                                        <th className="py-4 px-6">Order #</th>
                                        <th className="py-4 px-4">Customer</th>
                                        <th className="py-4 px-4">Date</th>
                                        <th className="py-4 px-4">Payment</th>
                                        <th className="py-4 px-4">Status & Change</th>
                                        <th className="py-4 px-4">Total (INR)</th>
                                        <th className="py-4 px-6 text-right">Details</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-black/5">
                                    {orders.map((o) => (
                                        <tr key={o.id} className="hover:bg-white/60 transition-colors">
                                            <td className="py-4 px-6">
                                                <span className="font-mono font-bold text-sm text-[#1c1c21] block">
                                                    {o.order_number}
                                                </span>
                                                <span className="text-[10px] text-[#7a7a7a] font-mono">
                                                    {o.tracking_number ? `Track: ${o.tracking_number}` : 'No tracking'}
                                                </span>
                                            </td>

                                            <td className="py-4 px-4">
                                                <div className="font-semibold text-[#1c1c21]">
                                                    {o.ship_name || o.customer_name || 'Customer'}
                                                </div>
                                                <div className="text-[11px] text-[#7a7a7a] truncate max-w-[160px]">
                                                    {o.ship_email || o.customer_email}
                                                </div>
                                            </td>

                                            <td className="py-4 px-4 text-[#7a7a7a] whitespace-nowrap">
                                                {new Date(o.created_at).toLocaleDateString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </td>

                                            <td className="py-4 px-4">
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-white/80 text-gray-800 capitalize border border-black/5">
                                                    {o.payment_method === 'razorpay' ? 'Razorpay (Paid)' : o.payment_method}
                                                </span>
                                            </td>

                                            <td className="py-4 px-4">
                                                <select
                                                    value={o.status}
                                                    onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                                                    disabled={updatingOrderId === o.id}
                                                    className={`text-xs font-bold rounded-xl px-2.5 py-1.5 border border-[#363636]/15 focus:outline-hidden cursor-pointer shadow-xs ${
                                                        o.status === 'Delivered' ? 'bg-green-50 text-green-700 border-green-200' :
                                                        o.status === 'Shipped' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                                        o.status === 'Cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                                                        'bg-blue-50 text-blue-700 border-blue-200'
                                                    }`}
                                                >
                                                    <option value="Processing">Processing</option>
                                                    <option value="Shipped">Shipped</option>
                                                    <option value="Delivered">Delivered</option>
                                                    <option value="Cancelled">Cancelled</option>
                                                </select>
                                            </td>

                                            <td className="py-4 px-4">
                                                <span className="font-display text-sm font-bold text-[#1c1c21]">
                                                    ₹{Number(o.total).toFixed(2)}
                                                </span>
                                            </td>

                                            <td className="py-4 px-6 text-right">
                                                <button
                                                    onClick={() => viewOrderDetails(o.id)}
                                                    className="btn-dark px-3.5 py-1.5 rounded-full text-xs font-medium inline-flex items-center gap-1 shadow-xs"
                                                >
                                                    <Eye className="w-3.5 h-3.5 text-[#adc8f8]" />
                                                    <span>View</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ================================================= */}
            {/* TAB: CUSTOMERS & USERS */}
            {/* ================================================= */}
            {activeTab === 'users' && (
                <div className="space-y-6">
                    <div className="section-bg rounded-[32px] p-5 border border-white/90 shadow-glass-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="relative min-w-[240px] flex-1 max-w-sm">
                            <Search className="w-4 h-4 text-[#7a7a7a] absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={userSearch}
                                onChange={(e) => setUserSearch(e.target.value)}
                                placeholder="Search customers by name, email..."
                                className="w-full h-10 pl-10 pr-4 rounded-full bg-white/80 border border-[#363636]/15 text-xs focus:outline-hidden focus:border-[#1c1c21] shadow-xs"
                            />
                        </div>
                        <span className="text-xs text-[#7a7a7a] font-medium">
                            {usersList.length} Registered Accounts
                        </span>
                    </div>

                    <div className="section-bg rounded-[32px] border border-white/90 shadow-glass-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="bg-white/60 text-[#7a7a7a] uppercase font-bold tracking-wider border-b border-[#363636]/10">
                                        <th className="py-4 px-6">User</th>
                                        <th className="py-4 px-4">Role</th>
                                        <th className="py-4 px-4">Total Orders</th>
                                        <th className="py-4 px-4">Lifetime Spend</th>
                                        <th className="py-4 px-4">Joined Date</th>
                                        <th className="py-4 px-6 text-right">Role Management</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-black/5">
                                    {usersList.map((u) => (
                                        <tr key={u.id} className="hover:bg-white/60 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="font-semibold text-sm text-[#1c1c21]">
                                                    {u.name}
                                                </div>
                                                <div className="text-[11px] text-[#7a7a7a]">
                                                    {u.email}
                                                </div>
                                            </td>

                                            <td className="py-4 px-4">
                                                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                                                    u.role === 'admin'
                                                        ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                                        : 'bg-white/80 text-gray-700 border border-black/5'
                                                }`}>
                                                    {u.role}
                                                </span>
                                            </td>

                                            <td className="py-4 px-4 font-semibold text-[#1c1c21]">
                                                {u.orderCount} orders
                                            </td>

                                            <td className="py-4 px-4 font-display text-sm font-bold text-[#1c1c21]">
                                                ₹{Number(u.totalSpent).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </td>

                                            <td className="py-4 px-4 text-[#7a7a7a]">
                                                {new Date(u.created_at).toLocaleDateString('en-IN')}
                                            </td>

                                            <td className="py-4 px-6 text-right">
                                                <button
                                                    onClick={() => handleToggleUserRole(u.id, u.role)}
                                                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors shadow-xs ${
                                                        u.role === 'admin'
                                                            ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                                                            : 'bg-[#eff6ff] text-[#2563eb] hover:bg-[#dbeafe] border border-[#bfdbfe]'
                                                    }`}
                                                >
                                                    {u.role === 'admin' ? 'Revoke Admin' : 'Promote to Admin'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ================================================= */}
            {/* TAB: SYSTEM & SETTINGS */}
            {/* ================================================= */}
            {activeTab === 'settings' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="section-bg rounded-[32px] p-6 md:p-8 border border-white/90 shadow-glass-sm space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-[#eff6ff] text-[#2563eb] flex items-center justify-center">
                                <Settings className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-display text-lg font-bold text-[#1c1c21]">
                                    Platform Environment
                                </h3>
                                <p className="text-xs text-[#7a7a7a]">
                                    Active services and connection health
                                </p>
                            </div>
                        </div>

                        <div className="divide-y divide-black/5 text-xs">
                            <div className="py-3 flex justify-between items-center">
                                <span className="text-[#7a7a7a]">Backend API Server</span>
                                <span className="font-mono text-[#10b981] font-semibold flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                                    Online (Port 5001)
                                </span>
                            </div>
                            <div className="py-3 flex justify-between items-center">
                                <span className="text-[#7a7a7a]">Database Engine</span>
                                <span className="font-mono text-[#10b981] font-semibold flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                                    MySQL 8.0 (life_harmony)
                                </span>
                            </div>
                            <div className="py-3 flex justify-between items-center">
                                <span className="text-[#7a7a7a]">Store Currency</span>
                                <span className="font-bold text-[#1c1c21] flex items-center gap-1">
                                    <IndianRupee className="w-3.5 h-3.5 text-[#2563eb]" />
                                    INR (₹ - Indian Rupee)
                                </span>
                            </div>
                            <div className="py-3 flex justify-between items-center">
                                <span className="text-[#7a7a7a]">Payment Gateway</span>
                                <span className="font-semibold text-[#2563eb] bg-[#eff6ff] px-2.5 py-0.5 rounded-full border border-[#bfdbfe]">
                                    Razorpay Test Sandbox / Live Mode
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="section-bg rounded-[32px] p-6 md:p-8 border border-white/90 shadow-glass-sm space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-[#fdf4ff] text-[#a855f7] flex items-center justify-center">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-display text-lg font-bold text-[#1c1c21]">
                                    Admin Session
                                </h3>
                                <p className="text-xs text-[#7a7a7a]">
                                    Active authentication session
                                </p>
                            </div>
                        </div>

                        <div className="bg-white/80 p-4 rounded-2xl border border-white/90 shadow-xs text-xs space-y-2">
                            <div className="flex justify-between">
                                <span className="text-[#7a7a7a]">Active Operator:</span>
                                <span className="font-semibold text-[#1c1c21]">{user?.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[#7a7a7a]">Email:</span>
                                <span className="font-mono text-[#1c1c21]">{user?.email}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[#7a7a7a]">Privilege Level:</span>
                                <span className="font-bold text-purple-700 uppercase">System Administrator</span>
                            </div>
                        </div>

                        <button
                            onClick={handleSignOut}
                            className="w-full h-11 rounded-2xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold flex items-center justify-center gap-2 transition-colors mt-4 shadow-xs"
                        >
                            <LogOut className="w-4 h-4" /> End Administrator Session
                        </button>
                    </div>
                </div>
            )}

            {/* ================================================= */}
            {/* ADD / EDIT PRODUCT MODAL */}
            {/* ================================================= */}
            {productModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="section-bg rounded-[32px] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/90 p-6 md:p-8">
                        <div className="flex items-center justify-between border-b border-[#363636]/10 pb-4 mb-6">
                            <div>
                                <h3 className="font-display text-xl font-bold text-[#1c1c21]">
                                    {editingProduct ? 'Edit Formulation' : 'Add New Formulation'}
                                </h3>
                                <p className="text-xs text-[#7a7a7a]">
                                    {editingProduct ? `Modify details for ${editingProduct.name}` : 'Create a new catalog item'}
                                </p>
                            </div>
                            <button
                                onClick={() => setProductModalOpen(false)}
                                className="w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-gray-500 transition-colors shadow-xs"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="font-semibold text-gray-800 block mb-1">Product Name *</label>
                                    <input
                                        type="text"
                                        value={productFormData.name}
                                        onChange={(e) => setProductFormData({ ...productFormData, name: e.target.value })}
                                        placeholder="e.g. Zinc Glycinate Complex"
                                        className="w-full h-10 px-3 rounded-xl bg-white/90 border border-[#363636]/15 focus:outline-hidden focus:border-[#1c1c21]"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="font-semibold text-gray-800 block mb-1">Subtitle / Flavour</label>
                                    <input
                                        type="text"
                                        value={productFormData.subtitle}
                                        onChange={(e) => setProductFormData({ ...productFormData, subtitle: e.target.value })}
                                        placeholder="e.g. 60 Vegan Capsules"
                                        className="w-full h-10 px-3 rounded-xl bg-white/90 border border-[#363636]/15 focus:outline-hidden focus:border-[#1c1c21]"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="font-semibold text-gray-800 block mb-1">Price in INR (₹) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={productFormData.price}
                                        onChange={(e) => setProductFormData({ ...productFormData, price: e.target.value })}
                                        placeholder="999.00"
                                        className="w-full h-10 px-3 rounded-xl bg-white/90 border border-[#363636]/15 focus:outline-hidden focus:border-[#1c1c21]"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="font-semibold text-gray-800 block mb-1">Original Price (₹)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={productFormData.originalPrice}
                                        onChange={(e) => setProductFormData({ ...productFormData, originalPrice: e.target.value })}
                                        placeholder="1299.00 (optional)"
                                        className="w-full h-10 px-3 rounded-xl bg-white/90 border border-[#363636]/15 focus:outline-hidden focus:border-[#1c1c21]"
                                    />
                                </div>
                                <div>
                                    <label className="font-semibold text-gray-800 block mb-1">Stock Quantity *</label>
                                    <input
                                        type="number"
                                        value={productFormData.stock}
                                        onChange={(e) => setProductFormData({ ...productFormData, stock: e.target.value })}
                                        placeholder="100"
                                        className="w-full h-10 px-3 rounded-xl bg-white/90 border border-[#363636]/15 focus:outline-hidden focus:border-[#1c1c21]"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="font-semibold text-gray-800 block mb-1">Category *</label>
                                    <select
                                        value={productFormData.category}
                                        onChange={(e) => setProductFormData({ ...productFormData, category: e.target.value })}
                                        className="w-full h-10 px-3 rounded-xl bg-white/90 border border-[#363636]/15 focus:outline-hidden focus:border-[#1c1c21]"
                                    >
                                        <option value="vitamins">Vitamins</option>
                                        <option value="supplements">Supplements</option>
                                        <option value="pick_of_month">Pick of the Month</option>
                                        <option value="offer_set">Offer Set</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="font-semibold text-gray-800 block mb-1">Image URL</label>
                                    <input
                                        type="text"
                                        value={productFormData.image}
                                        onChange={(e) => setProductFormData({ ...productFormData, image: e.target.value })}
                                        placeholder="https://images.unsplash.com/..."
                                        className="w-full h-10 px-3 rounded-xl bg-white/90 border border-[#363636]/15 focus:outline-hidden focus:border-[#1c1c21]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="font-semibold text-gray-800 block mb-1">Description</label>
                                <textarea
                                    value={productFormData.description}
                                    onChange={(e) => setProductFormData({ ...productFormData, description: e.target.value })}
                                    rows={2}
                                    placeholder="Comprehensive cellular vitality and wellness formulation..."
                                    className="w-full p-3 rounded-xl bg-white/90 border border-[#363636]/15 focus:outline-hidden focus:border-[#1c1c21]"
                                />
                            </div>

                            {/* Health Goals Multi-select */}
                            <div>
                                <label className="font-semibold text-gray-800 block mb-2">Target Wellness Goals</label>
                                <div className="flex flex-wrap gap-2">
                                    {AVAILABLE_GOALS.map((g) => {
                                        const checked = productFormData.goals.includes(g.slug);
                                        return (
                                            <button
                                                type="button"
                                                key={g.slug}
                                                onClick={() => {
                                                    const current = productFormData.goals;
                                                    const next = checked
                                                        ? current.filter(x => x !== g.slug)
                                                        : [...current, g.slug];
                                                    setProductFormData({ ...productFormData, goals: next });
                                                }}
                                                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                                                    checked
                                                        ? 'bg-[#eff6ff] text-[#2563eb] border-[#bfdbfe]'
                                                        : 'bg-white/80 text-gray-600 border-gray-200 hover:bg-white'
                                                }`}
                                            >
                                                {checked && '✓ '}
                                                {g.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div>
                                <label className="font-semibold text-gray-800 block mb-1">Key Benefits (One per line)</label>
                                <textarea
                                    value={productFormData.benefits}
                                    onChange={(e) => setProductFormData({ ...productFormData, benefits: e.target.value })}
                                    rows={3}
                                    placeholder="Complete cardiovascular support&#10;Natural antioxidant properties"
                                    className="w-full p-3 rounded-xl bg-white/90 border border-[#363636]/15 focus:outline-hidden focus:border-[#1c1c21]"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-[#363636]/10">
                                <button
                                    type="button"
                                    onClick={() => setProductModalOpen(false)}
                                    className="px-5 h-11 rounded-full glass-pill text-gray-700 font-medium hover:bg-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-dark px-6 h-11 rounded-full text-white font-medium shadow-md"
                                >
                                    {editingProduct ? 'Save Changes' : 'Create Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ================================================= */}
            {/* ORDER DETAIL INSPECTOR MODAL */}
            {/* ================================================= */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="section-bg rounded-[32px] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/90 p-6 md:p-8">
                        <div className="flex items-center justify-between border-b border-[#363636]/10 pb-4 mb-6">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-xl font-bold text-[#1c1c21]">
                                        {selectedOrder.order_number}
                                    </span>
                                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                                        selectedOrder.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                        selectedOrder.status === 'Shipped' ? 'bg-purple-100 text-purple-700' :
                                        selectedOrder.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                        'bg-blue-100 text-blue-700'
                                    }`}>
                                        {selectedOrder.status}
                                    </span>
                                </div>
                                <p className="text-xs text-[#7a7a7a] mt-0.5">
                                    Placed on {new Date(selectedOrder.created_at).toLocaleString('en-IN')}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-gray-500 transition-colors shadow-xs"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Order Details Body */}
                        <div className="space-y-6 text-xs">
                            {/* Items list */}
                            <div>
                                <h4 className="font-semibold text-gray-900 uppercase tracking-wider text-[11px] mb-3">
                                    Ordered Items ({selectedOrder.items?.length || 0})
                                </h4>
                                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                                    {selectedOrder.items?.map((it) => (
                                        <div key={it.id} className="p-3 bg-white/80 rounded-2xl flex items-center gap-3 border border-white/90 shadow-xs">
                                            <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                                                {it.image && (
                                                    <img src={it.image} alt={it.name} className="w-full h-full object-cover" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-gray-900 truncate">{it.name}</div>
                                                <div className="text-[11px] text-[#7a7a7a]">Qty: {it.qty} × ₹{it.price.toFixed(2)}</div>
                                            </div>
                                            <div className="font-bold text-gray-900">
                                                ₹{(it.price * it.qty).toFixed(2)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Customer & Shipping Address */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white/80 rounded-2xl border border-white/90 shadow-xs">
                                <div>
                                    <span className="font-bold uppercase tracking-wider text-[10px] text-[#7a7a7a] block mb-1">
                                        Customer Contact
                                    </span>
                                    <div className="font-semibold text-gray-900">{selectedOrder.ship_name || selectedOrder.user_name}</div>
                                    <div className="text-gray-600">{selectedOrder.ship_email || selectedOrder.user_email}</div>
                                    {selectedOrder.ship_phone && <div className="text-gray-600">{selectedOrder.ship_phone}</div>}
                                </div>
                                <div>
                                    <span className="font-bold uppercase tracking-wider text-[10px] text-[#7a7a7a] block mb-1">
                                        Delivery Address
                                    </span>
                                    <div className="text-gray-800">
                                        {selectedOrder.ship_line1} {selectedOrder.ship_line2}
                                    </div>
                                    <div className="text-gray-600">
                                        {selectedOrder.ship_city}, {selectedOrder.ship_state} {selectedOrder.ship_zip}
                                    </div>
                                    <div className="text-gray-600">{selectedOrder.ship_country}</div>
                                </div>
                            </div>

                            {/* Financial Summary */}
                            <div className="border-t border-[#363636]/10 pt-3 space-y-1.5">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>₹{selectedOrder.subtotal?.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping ({selectedOrder.shipping_method})</span>
                                    <span>{selectedOrder.shippingCost === 0 ? 'Free' : `₹${selectedOrder.shippingCost?.toFixed(2)}`}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Tax (8%)</span>
                                    <span>₹{selectedOrder.tax?.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-bold text-sm text-gray-900 pt-2 border-t border-[#363636]/10">
                                    <span>Grand Total</span>
                                    <span className="font-display text-base">₹{selectedOrder.total?.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Tracking Number Editor */}
                            <div className="p-4 bg-white/80 rounded-2xl border border-white/90 shadow-xs space-y-2">
                                <label className="font-bold text-[#1e40af] text-[11px] block">
                                    Carrier Tracking Number
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={trackingInput}
                                        onChange={(e) => setTrackingInput(e.target.value)}
                                        placeholder="e.g. TRK489201948 or Bluedart ID"
                                        className="flex-1 h-9 px-3 rounded-xl bg-white border border-[#363636]/15 text-xs focus:outline-hidden font-mono"
                                    />
                                    <button
                                        onClick={handleSaveTrackingNumber}
                                        className="btn-dark px-4 h-9 rounded-xl text-white font-medium text-xs shadow-xs"
                                    >
                                        Save Tracking
                                    </button>
                                </div>
                            </div>

                            {/* Quick Status Updater */}
                            <div className="flex items-center justify-between pt-2">
                                <span className="font-medium text-gray-700">Change Status:</span>
                                <div className="flex gap-2">
                                    {['Processing', 'Shipped', 'Delivered', 'Cancelled'].map((st) => (
                                        <button
                                            key={st}
                                            onClick={() => handleUpdateOrderStatus(selectedOrder.id, st)}
                                            className={`px-3 py-1.5 rounded-full font-semibold text-xs transition-colors shadow-xs ${
                                                selectedOrder.status === st
                                                    ? 'bg-[#1c1c21] text-white shadow-xs'
                                                    : 'glass-pill hover:bg-white text-gray-700'
                                            }`}
                                        >
                                            {st}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
