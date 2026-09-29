// src/components/Navbar.jsx
import { useState, useRef, useEffect } from 'react';
import {
    Heart,
    ShoppingCart,
    Menu,
    X,
    User,
    Package,
    MapPin,
    LogOut,
    ChevronDown,
    Search,
    Sparkles,
    Check,
    Copy,
    ArrowRight,
    ShieldCheck,
} from 'lucide-react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/use-toast';
import { getProducts } from '../mock';

const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/shop', label: 'Shop' },
    { to: '/blog', label: 'Blog' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
    const { cartCount, wishlist, setDrawerOpen } = useCart();
    const { user, isAuthenticated, logout } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    const wishlistCount = wishlist.length;

    const [mobileOpen, setMobileOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [copiedCode, setCopiedCode] = useState(false);

    const menuRef = useRef(null);
    const searchInputRef = useRef(null);

    // Close user menu on outside click
    useEffect(() => {
        function handleClick(e) {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setUserMenuOpen(false);
            }
        }
        if (userMenuOpen) {
            document.addEventListener('mousedown', handleClick);
            return () => document.removeEventListener('mousedown', handleClick);
        }
    }, [userMenuOpen]);

    // Handle search query with debounce
    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }
        const timer = setTimeout(async () => {
            setSearchLoading(true);
            try {
                const list = await getProducts({ q: searchQuery.trim() });
                setSearchResults(list.slice(0, 5));
            } catch {
                setSearchResults([]);
            } finally {
                setSearchLoading(false);
            }
        }, 250);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Focus search input when modal opens
    useEffect(() => {
        if (searchOpen) {
            setTimeout(() => searchInputRef.current?.focus(), 100);
        } else {
            setSearchQuery('');
            setSearchResults([]);
        }
    }, [searchOpen]);

    const handleCopyCode = () => {
        navigator.clipboard.writeText('HARMONY10');
        setCopiedCode(true);
        toast({
            title: 'Code Copied!',
            description: 'Use HARMONY10 at checkout for 10% off your order.',
        });
        setTimeout(() => setCopiedCode(false), 2500);
    };

    const handleLogout = () => {
        logout();
        setUserMenuOpen(false);
        toast({ title: 'Signed out', description: 'Come back soon!' });
        navigate('/');
    };

    const initials = user?.name
        ? user.name
            .split(' ')
            .map((p) => p[0])
            .slice(0, 2)
            .join('')
            .toUpperCase()
        : '';

    return (
        <header className="mb-3 sm:mb-5">
            {/* Main Navbar */}
            <nav className="flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-3 group focus:outline-none">
                    <div className="w-11 h-11 rounded-full bg-[#1c1c21] flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:shadow-md">
                        <svg
                            viewBox="0 0 24 24"
                            className="w-5 h-5 text-white transition-transform group-hover:rotate-45 duration-500"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                        >
                            <circle cx="12" cy="12" r="3" />
                            <line x1="12" y1="3" x2="12" y2="6" />
                            <line x1="12" y1="18" x2="12" y2="21" />
                            <line x1="3" y1="12" x2="6" y2="12" />
                            <line x1="18" y1="12" x2="21" y2="12" />
                            <line x1="5.6" y1="5.6" x2="7.7" y2="7.7" />
                            <line x1="16.3" y1="16.3" x2="18.4" y2="18.4" />
                            <line x1="5.6" y1="18.4" x2="7.7" y2="16.3" />
                            <line x1="16.3" y1="7.7" x2="18.4" y2="5.6" />
                        </svg>
                    </div>
                    <div className="leading-none flex flex-col">
                        <span className="font-display text-[15px] font-bold tracking-tight text-[#1c1c21]">Life</span>
                        <span className="font-display text-[15px] font-bold tracking-tight text-[#1c1c21]">Harmony</span>
                    </div>
                </Link>

                {/* Desktop Nav Links */}
                <div className="hidden md:flex items-center gap-1 glass-pill px-2 py-1.5 shadow-glass-sm">
                    {navLinks.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            className={({ isActive }) =>
                                `px-4 h-9 rounded-full text-[13px] font-medium flex items-center transition-all duration-200 ${isActive
                                    ? 'bg-[#1c1c21] text-white shadow-sm'
                                    : 'text-[#65656d] hover:text-[#1c1c21] hover:bg-black/[0.03]'
                                }`
                            }
                        >
                            {link.label}
                        </NavLink>
                    ))}
                </div>

                {/* Right Action Icons */}
                <div className="flex items-center gap-2 sm:gap-3">
                    {/* Instant Search Button */}
                    <button
                        onClick={() => setSearchOpen(true)}
                        className="w-11 h-11 rounded-full glass-pill flex items-center justify-center hover:scale-105 active:scale-95 transition-all text-[#1c1c21]"
                        aria-label="Search catalog"
                        title="Search supplements"
                    >
                        <Search className="w-4 h-4" strokeWidth={1.9} />
                    </button>

                    {/* Wishlist Button */}
                    <Link
                        to="/wishlist"
                        className="relative w-11 h-11 rounded-full glass-pill flex items-center justify-center hover:scale-105 active:scale-95 transition-all text-[#1c1c21]"
                        aria-label="Wishlist"
                    >
                        <Heart className="w-4 h-4" strokeWidth={1.9} />
                        {wishlistCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#1c1c21] text-white text-[10px] font-bold flex items-center justify-center shadow-xs animate-in zoom-in-50 duration-200">
                                {wishlistCount}
                            </span>
                        )}
                    </Link>

                    {/* Cart Drawer Trigger */}
                    <button
                        onClick={() => setDrawerOpen(true)}
                        className="relative w-11 h-11 rounded-full bg-[#1c1c21] text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-sm"
                        aria-label="Cart"
                    >
                        <ShoppingCart className="w-4 h-4" strokeWidth={1.9} />
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#adc8f8] text-[#1c1c21] text-[10px] font-bold flex items-center justify-center shadow-xs">
                                {cartCount}
                            </span>
                        )}
                    </button>

                    {/* Authenticated User Menu or Login Button */}
                    {isAuthenticated ? (
                        <div className="relative hidden sm:block" ref={menuRef}>
                            <button
                                onClick={() => setUserMenuOpen((v) => !v)}
                                className="flex items-center gap-2 h-11 pl-1.5 pr-3 rounded-full glass-pill hover:bg-white transition-all shadow-glass-sm"
                                aria-label="User menu"
                            >
                                <span className="w-8 h-8 rounded-full bg-[#1c1c21] text-white flex items-center justify-center text-[12px] font-semibold">
                                    {initials || <User className="w-4 h-4" />}
                                </span>
                                <span className="text-[13px] font-medium max-w-[100px] truncate text-[#1c1c21]">
                                    {user.name}
                                </span>
                                <ChevronDown
                                    className={`w-3.5 h-3.5 text-[#65656d] transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`}
                                />
                            </button>

                            {userMenuOpen && (
                                <div className="absolute right-0 top-[calc(100%+8px)] w-56 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-black/5 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                                    <div className="px-3 py-3 border-b border-black/5">
                                        <div className="text-[13px] font-semibold truncate text-[#1c1c21]">
                                            {user.name}
                                        </div>
                                        <div className="text-[11px] text-[#65656d] truncate">
                                            {user.email}
                                        </div>
                                    </div>
                                    <div className="py-1">
                                        <Link
                                            to="/profile"
                                            onClick={() => setUserMenuOpen(false)}
                                            className="flex items-center gap-3 px-3 h-10 rounded-xl text-[13px] text-[#2d2d33] hover:bg-[#f6ebf1]/60 transition-colors"
                                        >
                                            <User className="w-4 h-4 text-[#65656d]" /> My profile
                                        </Link>
                                        <Link
                                            to="/profile"
                                            state={{ tab: 'orders' }}
                                            onClick={() => setUserMenuOpen(false)}
                                            className="flex items-center gap-3 px-3 h-10 rounded-xl text-[13px] text-[#2d2d33] hover:bg-[#f6ebf1]/60 transition-colors"
                                        >
                                            <Package className="w-4 h-4 text-[#65656d]" /> My orders
                                        </Link>
                                        <Link
                                            to="/profile"
                                            state={{ tab: 'addresses' }}
                                            onClick={() => setUserMenuOpen(false)}
                                            className="flex items-center gap-3 px-3 h-10 rounded-xl text-[13px] text-[#2d2d33] hover:bg-[#f6ebf1]/60 transition-colors"
                                        >
                                            <MapPin className="w-4 h-4 text-[#65656d]" /> Addresses
                                        </Link>
                                    </div>
                                    <div className="border-t border-black/5 pt-1">
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-3 h-10 rounded-xl text-[13px] text-red-600 hover:bg-red-50/80 transition-colors"
                                        >
                                            <LogOut className="w-4 h-4" /> Sign out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link
                            to="/login"
                            className="hidden sm:inline-flex btn-dark px-6 h-11 rounded-full text-sm font-medium items-center shadow-xs"
                        >
                            Login
                        </Link>
                    )}

                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setMobileOpen((v) => !v)}
                        className="md:hidden w-11 h-11 rounded-full glass-pill flex items-center justify-center text-[#1c1c21]"
                        aria-label="Menu"
                    >
                        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </nav>

            {/* Quick Search Overlay Modal */}
            {searchOpen && (
                <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-xl bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-black/10 overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-4 border-b border-black/5 flex items-center gap-3">
                            <Search className="w-5 h-5 text-[#858590] shrink-0" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by vitamin, supplement, or goal (e.g. immunity, sleep)..."
                                className="w-full text-sm bg-transparent outline-none placeholder:text-[#9e9ea7]"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="p-1 rounded-full hover:bg-black/5 text-[#858590]"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                            <button
                                onClick={() => setSearchOpen(false)}
                                className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#f0e8ed] hover:bg-[#ebdbe7] text-[#2d2d33] transition-colors"
                            >
                                Esc
                            </button>
                        </div>

                        {/* Search Results Preview */}
                        <div className="max-h-[380px] overflow-y-auto p-3">
                            {searchLoading ? (
                                <div className="py-8 text-center text-sm text-[#858590]">
                                    Searching catalogue...
                                </div>
                            ) : searchResults.length > 0 ? (
                                <div className="space-y-1">
                                    {searchResults.map((product) => (
                                        <Link
                                            key={product.id}
                                            to={`/product/${product.id}`}
                                            onClick={() => setSearchOpen(false)}
                                            className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-[#f8eff4] transition-colors group"
                                        >
                                            <div className="w-12 h-12 rounded-xl bg-[#faf7fa] overflow-hidden shrink-0">
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-semibold text-[#1c1c21] truncate">
                                                    {product.name}
                                                </h4>
                                                <p className="text-xs text-[#70707a] truncate">
                                                    {product.subtitle}
                                                </p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <span className="text-sm font-bold text-[#1c1c21]">
                                                    ₹{Number(product.price).toFixed(2)}
                                                </span>
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-[#1c1c21] transition-all" />
                                        </Link>
                                    ))}
                                    <div className="pt-2 text-center border-t border-black/5">
                                        <Link
                                            to="/shop"
                                            onClick={() => setSearchOpen(false)}
                                            className="text-xs font-medium text-[#1c1c21] hover:underline"
                                        >
                                            View all products in shop &rarr;
                                        </Link>
                                    </div>
                                </div>
                            ) : searchQuery ? (
                                <div className="py-8 text-center">
                                    <p className="text-sm text-[#858590]">No products found for "{searchQuery}"</p>
                                    <Link
                                        to="/shop"
                                        onClick={() => setSearchOpen(false)}
                                        className="inline-block mt-3 text-xs font-medium underline"
                                    >
                                        Browse all shop items
                                    </Link>
                                </div>
                            ) : (
                                <div className="py-4 px-2">
                                    <p className="text-xs uppercase font-semibold text-[#8e8e98] tracking-wider mb-2">
                                        Suggested Searches
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {['Vitamin D3', 'Collagen', 'Immunity', 'Magnesium', 'Multivitamin'].map((term) => (
                                            <button
                                                key={term}
                                                onClick={() => setSearchQuery(term)}
                                                className="px-3 py-1.5 rounded-full bg-[#f4e8ee] hover:bg-[#ede0e7] text-xs font-medium text-[#2d2d33] transition-colors"
                                            >
                                                {term}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile Drawer Menu */}
            {mobileOpen && (
                <div className="md:hidden mt-4 glass-panel rounded-3xl p-4 flex flex-col gap-1 shadow-xl animate-in slide-in-from-top-3 duration-200">
                    {navLinks.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            onClick={() => setMobileOpen(false)}
                            className={({ isActive }) =>
                                `px-4 h-11 rounded-2xl text-sm font-semibold flex items-center transition-colors ${isActive
                                    ? 'bg-[#1c1c21] text-white'
                                    : 'text-[#2d2d33] hover:bg-black/5'
                                }`
                            }
                        >
                            {link.label}
                        </NavLink>
                    ))}

                    {isAuthenticated ? (
                        <>
                            <div className="border-t border-black/10 my-2" />
                            <div className="px-4 py-2 flex items-center gap-3">
                                <span className="w-9 h-9 rounded-full bg-[#1c1c21] text-white flex items-center justify-center text-[12px] font-semibold">
                                    {initials}
                                </span>
                                <div className="min-w-0">
                                    <div className="text-[13px] font-semibold truncate text-[#1c1c21]">
                                        {user.name}
                                    </div>
                                    <div className="text-[11px] text-[#65656d] truncate">
                                        {user.email}
                                    </div>
                                </div>
                            </div>
                            <Link
                                to="/profile"
                                onClick={() => setMobileOpen(false)}
                                className="px-4 h-11 rounded-2xl text-sm font-medium flex items-center gap-2 text-[#2d2d33] hover:bg-black/5"
                            >
                                <User className="w-4 h-4 text-[#65656d]" /> My profile
                            </Link>
                            <Link
                                to="/profile"
                                state={{ tab: 'orders' }}
                                onClick={() => setMobileOpen(false)}
                                className="px-4 h-11 rounded-2xl text-sm font-medium flex items-center gap-2 text-[#2d2d33] hover:bg-black/5"
                            >
                                <Package className="w-4 h-4 text-[#65656d]" /> My orders
                            </Link>
                            <button
                                onClick={() => {
                                    setMobileOpen(false);
                                    handleLogout();
                                }}
                                className="px-4 h-11 rounded-2xl text-sm font-medium flex items-center gap-2 text-red-600 hover:bg-red-50/80 text-left transition-colors"
                            >
                                <LogOut className="w-4 h-4" /> Sign out
                            </button>
                        </>
                    ) : (
                        <Link
                            to="/login"
                            onClick={() => setMobileOpen(false)}
                            className="btn-dark h-11 rounded-2xl text-sm font-medium flex items-center justify-center mt-2 shadow-sm"
                        >
                            Login
                        </Link>
                    )}
                </div>
            )}
        </header>
    );
}