// src/pages/Profile.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    User,
    Package,
    MapPin,
    Settings,
    LogOut,
    Plus,
    Trash2,
    Save,
    ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../hooks/use-toast';

const tabs = [
    { id: 'orders', label: 'Orders', icon: Package },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Profile() {
    const {
        user,
        logout,
        updateProfile,
        addAddress,
        removeAddress,
        getAddresses,
        getOrders,
        orders: contextOrders,
    } = useAuth();
    const { wishlist } = useCart();
    const { toast } = useToast();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('orders');
    const [orders, setOrders] = useState(() => contextOrders || []);
    const [addresses, setAddresses] = useState([]);
    const [profileForm, setProfileForm] = useState({ name: '', email: '' });
    const [newAddress, setNewAddress] = useState({
        label: 'Home',
        line1: '',
        city: '',
        zip: '',
        country: 'India',
    });
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [loadingData, setLoadingData] = useState(() => !contextOrders?.length);

    useEffect(() => {
        if (!user) return;
        setProfileForm({ name: user.name, email: user.email });
        let cancelled = false;

        if (Array.isArray(contextOrders) && contextOrders.length > 0) {
            setOrders(contextOrders);
            setLoadingData(false);
        }

        Promise.all([getOrders(), getAddresses()])
            .then(([o, a]) => {
                if (cancelled) return;
                if (Array.isArray(o) && o.length > 0) {
                    setOrders(o);
                } else if (Array.isArray(contextOrders) && contextOrders.length > 0) {
                    setOrders(contextOrders);
                }
                if (Array.isArray(a)) setAddresses(a);
            })
            .catch(() => {
                if (Array.isArray(contextOrders) && contextOrders.length > 0) {
                    setOrders(contextOrders);
                }
            })
            .finally(() => {
                if (!cancelled) setLoadingData(false);
            });
        return () => {
            cancelled = true;
        };
    }, [user, getOrders, getAddresses, contextOrders]);

    if (!user) {
        return null;
    }

    const handleLogout = () => {
        logout();
        toast({ title: 'Signed out', description: 'See you soon!' });
        navigate('/');
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        try {
            await updateProfile({
                name: profileForm.name,
                email: profileForm.email.toLowerCase(),
            });
            toast({
                title: 'Profile updated',
                description: 'Your changes have been saved.',
            });
        } catch (err) {
            toast({
                title: 'Update failed',
                description: err.response?.data?.message || err.message,
            });
        }
    };

    const handleAddAddress = async (e) => {
        e.preventDefault();
        if (!newAddress.line1 || !newAddress.city || !newAddress.zip) {
            toast({
                title: 'Missing fields',
                description: 'Fill in street, city, and ZIP.',
            });
            return;
        }
        try {
            await addAddress(newAddress);
            const fresh = await getAddresses();
            setAddresses(fresh);
            setNewAddress({
                label: 'Home',
                line1: '',
                city: '',
                zip: '',
                country: 'United States',
            });
            setShowAddressForm(false);
            toast({ title: 'Address added' });
        } catch (err) {
            toast({
                title: 'Failed',
                description: err.response?.data?.message || err.message,
            });
        }
    };

    const handleRemoveAddress = async (id) => {
        try {
            await removeAddress(id);
            const fresh = await getAddresses();
            setAddresses(fresh);
            toast({ title: 'Address removed' });
        } catch (err) {
            toast({
                title: 'Failed',
                description: err.response?.data?.message || err.message,
            });
        }
    };

    const initials = user.name
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    return (
        <div className="mt-2">
            <section className="section-bg rounded-[32px] px-6 md:px-14 py-10 md:py-14">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6 justify-between">
                    <div className="flex items-center gap-5">
                        <div className="w-20 h-20 rounded-full bg-[#363636] text-white flex items-center justify-center font-display text-[28px]">
                            {initials || <User className="w-8 h-8" />}
                        </div>
                        <div>
                            <h1 className="font-display text-[28px] md:text-[40px] leading-[1] tracking-tight">
                                {user.name}
                            </h1>
                            <p className="text-[13px] text-[#7a7a7a] mt-1">
                                {user.email}
                            </p>
                            <p className="text-[11px] text-[#a0a0a0] mt-1">
                                Member since{' '}
                                {new Date(user.createdAt).toLocaleDateString(
                                    'en-US',
                                    { month: 'long', year: 'numeric' }
                                )}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="inline-flex items-center gap-2 px-5 h-11 rounded-full text-[13px] font-medium bg-white hover:bg-[#363636] hover:text-white transition-colors"
                    >
                        <LogOut className="w-4 h-4" /> Sign out
                    </button>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-8">
                    <div className="bg-white rounded-2xl p-4">
                        <div className="text-[11px] uppercase tracking-widest text-[#7a7a7a]">
                            Orders
                        </div>
                        <div className="font-display text-[28px] mt-1">
                            {orders.length}
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-4">
                        <div className="text-[11px] uppercase tracking-widest text-[#7a7a7a]">
                            Wishlist
                        </div>
                        <div className="font-display text-[28px] mt-1">
                            {wishlist.length}
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-4">
                        <div className="text-[11px] uppercase tracking-widest text-[#7a7a7a]">
                            Addresses
                        </div>
                        <div className="font-display text-[28px] mt-1">
                            {addresses.length}
                        </div>
                    </div>
                </div>
            </section>

            <section className="mt-8 grid grid-cols-12 gap-6">
                <aside className="col-span-12 md:col-span-3">
                    <div className="section-bg rounded-[24px] p-3 sticky top-4">
                        {tabs.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setActiveTab(t.id)}
                                className={`w-full flex items-center gap-3 px-4 h-12 rounded-xl text-[13px] font-medium transition-colors ${activeTab === t.id
                                        ? 'bg-[#363636] text-white'
                                        : 'text-[#363636] hover:bg-white'
                                    }`}
                            >
                                <t.icon className="w-4 h-4" />
                                {t.label}
                                <ChevronRight className="w-4 h-4 ml-auto opacity-60" />
                            </button>
                        ))}
                    </div>
                </aside>

                <div className="col-span-12 md:col-span-9">
                    {activeTab === 'orders' && (
                        <div className="section-bg rounded-[32px] p-6 md:p-10">
                            <h2 className="font-display text-[28px] tracking-tight mb-6">
                                Order history
                            </h2>
                            {loadingData ? (
                                <div className="bg-white rounded-2xl p-10 text-center">
                                    <p className="text-sm text-[#7a7a7a]">
                                        Loading orders…
                                    </p>
                                </div>
                            ) : orders.length === 0 ? (
                                <div className="bg-white rounded-2xl p-10 text-center">
                                    <Package className="w-8 h-8 mx-auto text-[#a0a0a0]" />
                                    <p className="text-sm text-[#7a7a7a] mt-3">
                                        No orders yet.
                                    </p>
                                    <Link
                                        to="/shop"
                                        className="btn-dark inline-flex mt-4 px-6 h-11 rounded-full text-sm font-medium items-center"
                                    >
                                        Start shopping
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {orders.map((o) => (
                                        <OrderCard key={o.id} order={o} />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'addresses' && (
                        <div className="section-bg rounded-[32px] p-6 md:p-10">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="font-display text-[28px] tracking-tight">
                                    Saved addresses
                                </h2>
                                <button
                                    onClick={() =>
                                        setShowAddressForm((v) => !v)
                                    }
                                    className="btn-dark inline-flex items-center gap-2 px-5 h-10 rounded-full text-[13px] font-medium"
                                >
                                    <Plus className="w-4 h-4" /> Add address
                                </button>
                            </div>

                            {showAddressForm && (
                                <form
                                    onSubmit={handleAddAddress}
                                    className="bg-white rounded-2xl p-5 mb-4 space-y-3"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <input
                                            value={newAddress.label}
                                            onChange={(e) =>
                                                setNewAddress((a) => ({
                                                    ...a,
                                                    label: e.target.value,
                                                }))
                                            }
                                            placeholder="Label (Home, Work...)"
                                            className="h-11 rounded-xl bg-[#f9f4f7] px-4 text-sm outline-none focus:ring-2 focus:ring-[#bbcffb]"
                                        />
                                        <input
                                            value={newAddress.country}
                                            onChange={(e) =>
                                                setNewAddress((a) => ({
                                                    ...a,
                                                    country: e.target.value,
                                                }))
                                            }
                                            placeholder="Country"
                                            className="h-11 rounded-xl bg-[#f9f4f7] px-4 text-sm outline-none focus:ring-2 focus:ring-[#bbcffb]"
                                        />
                                    </div>
                                    <input
                                        value={newAddress.line1}
                                        onChange={(e) =>
                                            setNewAddress((a) => ({
                                                ...a,
                                                line1: e.target.value,
                                            }))
                                        }
                                        placeholder="Street address"
                                        className="w-full h-11 rounded-xl bg-[#f9f4f7] px-4 text-sm outline-none focus:ring-2 focus:ring-[#bbcffb]"
                                    />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <input
                                            value={newAddress.city}
                                            onChange={(e) =>
                                                setNewAddress((a) => ({
                                                    ...a,
                                                    city: e.target.value,
                                                }))
                                            }
                                            placeholder="City"
                                            className="h-11 rounded-xl bg-[#f9f4f7] px-4 text-sm outline-none focus:ring-2 focus:ring-[#bbcffb]"
                                        />
                                        <input
                                            value={newAddress.zip}
                                            onChange={(e) =>
                                                setNewAddress((a) => ({
                                                    ...a,
                                                    zip: e.target.value,
                                                }))
                                            }
                                            placeholder="ZIP / Postal code"
                                            className="h-11 rounded-xl bg-[#f9f4f7] px-4 text-sm outline-none focus:ring-2 focus:ring-[#bbcffb]"
                                        />
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <button
                                            type="submit"
                                            className="btn-dark px-6 h-10 rounded-full text-[13px] font-medium"
                                        >
                                            Save address
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowAddressForm(false)
                                            }
                                            className="px-6 h-10 rounded-full text-[13px] font-medium border border-[#363636]/20"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            )}

                            {addresses.length === 0 ? (
                                <div className="bg-white rounded-2xl p-10 text-center">
                                    <MapPin className="w-8 h-8 mx-auto text-[#a0a0a0]" />
                                    <p className="text-sm text-[#7a7a7a] mt-3">
                                        No saved addresses yet.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {addresses.map((a) => (
                                        <div
                                            key={a.id}
                                            className="bg-white rounded-2xl p-5"
                                        >
                                            <div className="flex justify-between items-start">
                                                <span className="text-[11px] uppercase tracking-widest text-[#7a7a7a]">
                                                    {a.label}
                                                </span>
                                                <button
                                                    onClick={() =>
                                                        handleRemoveAddress(
                                                            a.id
                                                        )
                                                    }
                                                    className="text-[#7a7a7a] hover:text-red-600"
                                                    aria-label="Remove"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <p className="text-[14px] font-medium mt-2">
                                                {a.line1}
                                            </p>
                                            <p className="text-[13px] text-[#7a7a7a] mt-0.5">
                                                {a.city}, {a.zip}
                                            </p>
                                            <p className="text-[13px] text-[#7a7a7a]">
                                                {a.country}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="section-bg rounded-[32px] p-6 md:p-10">
                            <h2 className="font-display text-[28px] tracking-tight mb-6">
                                Account settings
                            </h2>
                            <form
                                onSubmit={handleSaveProfile}
                                className="bg-white rounded-2xl p-6 space-y-4 max-w-[520px]"
                            >
                                <div>
                                    <label className="text-[12px] uppercase tracking-widest text-[#7a7a7a]">
                                        Name
                                    </label>
                                    <input
                                        value={profileForm.name}
                                        onChange={(e) =>
                                            setProfileForm((f) => ({
                                                ...f,
                                                name: e.target.value,
                                            }))
                                        }
                                        className="mt-2 w-full h-12 rounded-2xl bg-[#f9f4f7] px-4 text-sm outline-none focus:ring-2 focus:ring-[#bbcffb]"
                                    />
                                </div>
                                <div>
                                    <label className="text-[12px] uppercase tracking-widest text-[#7a7a7a]">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={profileForm.email}
                                        onChange={(e) =>
                                            setProfileForm((f) => ({
                                                ...f,
                                                email: e.target.value,
                                            }))
                                        }
                                        className="mt-2 w-full h-12 rounded-2xl bg-[#f9f4f7] px-4 text-sm outline-none focus:ring-2 focus:ring-[#bbcffb]"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="btn-dark inline-flex items-center gap-2 px-6 h-11 rounded-full text-[13px] font-medium"
                                >
                                    <Save className="w-4 h-4" /> Save changes
                                </button>
                            </form>

                            <div className="mt-6 bg-white rounded-2xl p-6 max-w-[520px]">
                                <h3 className="font-semibold text-[15px] text-red-600">
                                    Danger zone
                                </h3>
                                <p className="text-[13px] text-[#7a7a7a] mt-1">
                                    Signing out will end your current session.
                                </p>
                                <button
                                    onClick={handleLogout}
                                    className="mt-4 inline-flex items-center gap-2 px-5 h-10 rounded-full text-[13px] font-medium border border-red-300 text-red-600 hover:bg-red-50"
                                >
                                    <LogOut className="w-4 h-4" /> Sign out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

function OrderCard({ order }) {
    const [expanded, setExpanded] = useState(false);

    const statusColor =
        {
            Processing: 'bg-[#bbcffb]/60 text-[#363636]',
            Shipped: 'bg-yellow-100 text-yellow-800',
            Delivered: 'bg-green-100 text-green-800',
            Cancelled: 'bg-red-100 text-red-700',
        }[order.status] || 'bg-[#bbcffb]/60 text-[#363636]';

    return (
        <div className="bg-white rounded-2xl overflow-hidden">
            <button
                onClick={() => setExpanded((v) => !v)}
                className="w-full p-5 flex flex-wrap items-center gap-4 text-left hover:bg-[#faf7fa] transition-colors"
            >
                <div className="flex-1 min-w-[160px]">
                    <div className="text-[11px] uppercase tracking-widest text-[#7a7a7a]">
                        Order
                    </div>
                    <div className="font-display text-[18px] mt-0.5">
                        #{order.id}
                    </div>
                </div>
                <div className="flex-1 min-w-[140px]">
                    <div className="text-[11px] uppercase tracking-widest text-[#7a7a7a]">
                        Date
                    </div>
                    <div className="text-[13px] mt-0.5">
                        {new Date(order.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                        })}
                    </div>
                </div>
                <div className="flex-1 min-w-[100px]">
                    <div className="text-[11px] uppercase tracking-widest text-[#7a7a7a]">
                        Items
                    </div>
                    <div className="text-[13px] mt-0.5">
                        {order.items?.length || 0} item
                        {(order.items?.length || 0) !== 1 ? 's' : ''}
                    </div>
                </div>
                <div className="flex-1 min-w-[100px]">
                    <div className="text-[11px] uppercase tracking-widest text-[#7a7a7a]">
                        Total
                    </div>
                    <div className="font-display text-[18px] mt-0.5">
                        ₹{order.total.toFixed(2)}
                    </div>
                </div>
                <span
                    className={`text-[11px] px-3 py-1 rounded-full font-medium ${statusColor}`}
                >
                    {order.status}
                </span>
                <ChevronRight
                    className={`w-4 h-4 text-[#7a7a7a] transition-transform ${expanded ? 'rotate-90' : ''
                        }`}
                />
            </button>

            {expanded && (
                <div className="px-5 pb-5 border-t border-[#363636]/10 pt-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <div className="text-[11px] uppercase tracking-widest text-[#7a7a7a] mb-3">
                            Items ordered
                        </div>
                        <div className="space-y-3">
                            {order.items?.map((it) => (
                                <div key={it.id} className="flex gap-3">
                                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#faf7fa] shrink-0">
                                        {it.image && (
                                            <img
                                                src={it.image}
                                                alt={it.name}
                                                className="w-full h-full object-cover"
                                            />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[13px] font-medium truncate">
                                            {it.name}
                                        </div>
                                        {it.subtitle && (
                                            <div className="text-[11px] text-[#7a7a7a] truncate">
                                                {it.subtitle}
                                            </div>
                                        )}
                                        <div className="text-[11px] text-[#7a7a7a] mt-0.5">
                                            Qty {it.qty} × ₹
                                            {it.price.toFixed(2)}
                                        </div>
                                    </div>
                                    <div className="text-[13px] font-semibold self-center">
                                        ₹{(it.price * it.qty).toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-5">
                        {order.shippingAddress && (
                            <div>
                                <div className="text-[11px] uppercase tracking-widest text-[#7a7a7a] mb-2">
                                    Shipping address
                                </div>
                                <div className="text-[13px] font-medium">
                                    {order.shippingAddress.name}
                                </div>
                                <div className="text-[12px] text-[#7a7a7a]">
                                    {order.shippingAddress.line1}
                                    {order.shippingAddress.line2 &&
                                        `, ${order.shippingAddress.line2}`}
                                </div>
                                <div className="text-[12px] text-[#7a7a7a]">
                                    {order.shippingAddress.city}
                                    {order.shippingAddress.state &&
                                        `, ${order.shippingAddress.state}`}{' '}
                                    {order.shippingAddress.zip}
                                </div>
                                <div className="text-[12px] text-[#7a7a7a]">
                                    {order.shippingAddress.country}
                                </div>
                            </div>
                        )}

                        {order.payment && (
                            <div>
                                <div className="text-[11px] uppercase tracking-widest text-[#7a7a7a] mb-2">
                                    Payment
                                </div>
                                <div className="text-[13px]">
                                    {order.payment.method === 'razorpay' ? (
                                        <span className="inline-flex items-center gap-1.5 text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 text-[12px] font-medium">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                            Razorpay Test Mode
                                            {order.payment.razorpayPaymentId && (
                                                <span className="font-mono text-[11px] text-emerald-700">
                                                    • {order.payment.razorpayPaymentId}
                                                </span>
                                            )}
                                        </span>
                                    ) : order.payment.method === 'cod' ? (
                                        'Cash on delivery'
                                    ) : (
                                        <>
                                            {order.payment.brand} ending in{' '}
                                            <span className="font-medium">
                                                {order.payment.last4}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        <div>
                            <div className="text-[11px] uppercase tracking-widest text-[#7a7a7a] mb-2">
                                Tracking
                            </div>
                            <div className="text-[13px] font-mono">
                                {order.trackingNumber}
                            </div>
                            {order.estimatedDelivery && (
                                <div className="text-[12px] text-[#7a7a7a] mt-1">
                                    Est. delivery{' '}
                                    {new Date(
                                        order.estimatedDelivery
                                    ).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="border-t border-[#363636]/10 pt-4 space-y-1 text-[13px]">
                            <div className="flex justify-between text-[#7a7a7a]">
                                <span>Subtotal</span>
                                <span>₹{order.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-[#7a7a7a]">
                                <span>Shipping</span>
                                <span>
                                    {order.shippingCost === 0
                                        ? 'Free'
                                        : `₹${order.shippingCost.toFixed(2)}`}
                                </span>
                            </div>
                            <div className="flex justify-between text-[#7a7a7a]">
                                <span>Tax</span>
                                <span>₹{order.tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-semibold text-[15px] pt-2 border-t border-[#363636]/10 mt-2">
                                <span>Total</span>
                                <span>₹{order.total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}