// src/components/MobileBottomNav.jsx
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Sparkles, Heart, ShoppingBag, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function MobileBottomNav() {
    const location = useLocation();
    const navigate = useNavigate();
    const { cartCount, wishlist, drawerOpen, setDrawerOpen } = useCart();
    const { isAuthenticated, user } = useAuth();

    const [rippleIndex, setRippleIndex] = useState(null);
    const [prevCartCount, setPrevCartCount] = useState(cartCount);
    const [cartBadgePop, setCartBadgePop] = useState(false);

    // Trigger badge animation when cart count changes
    useEffect(() => {
        if (cartCount !== prevCartCount) {
            setCartBadgePop(true);
            const timer = setTimeout(() => setCartBadgePop(false), 450);
            setPrevCartCount(cartCount);
            return () => clearTimeout(timer);
        }
    }, [cartCount, prevCartCount]);

    const wishlistCount = wishlist?.length || 0;

    // Determine active index
    const pathname = location.pathname;
    let activeIndex = 0;

    if (drawerOpen) {
        activeIndex = 3; // Cart tab active when bag is open
    } else if (pathname === '/') {
        activeIndex = 0; // Home
    } else if (pathname.startsWith('/shop') || pathname.startsWith('/product')) {
        activeIndex = 1; // Shop
    } else if (pathname.startsWith('/wishlist')) {
        activeIndex = 2; // Wishlist
    } else if (pathname.startsWith('/profile') || pathname.startsWith('/login')) {
        activeIndex = 4; // Account
    } else {
        activeIndex = -1; // Other pages (e.g. blog, about)
    }

    const navItems = [
        {
            id: 'home',
            label: 'Home',
            icon: Home,
            action: () => {
                if (drawerOpen) setDrawerOpen(false);
                navigate('/');
            },
        },
        {
            id: 'shop',
            label: 'Shop',
            icon: Sparkles,
            action: () => {
                if (drawerOpen) setDrawerOpen(false);
                navigate('/shop');
            },
        },
        {
            id: 'wishlist',
            label: 'Wishlist',
            icon: Heart,
            badge: wishlistCount,
            isHeart: true,
            action: () => {
                if (drawerOpen) setDrawerOpen(false);
                navigate('/wishlist');
            },
        },
        {
            id: 'cart',
            label: 'Cart',
            icon: ShoppingBag,
            badge: cartCount,
            isCart: true,
            action: () => {
                setDrawerOpen(!drawerOpen);
            },
        },
        {
            id: 'account',
            label: isAuthenticated ? (user?.name?.split(' ')[0] || 'Profile') : 'Sign In',
            icon: User,
            initials: isAuthenticated && user?.name
                ? user.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
                : null,
            action: () => {
                if (drawerOpen) setDrawerOpen(false);
                navigate(isAuthenticated ? '/profile' : '/login');
            },
        },
    ];

    const handleItemClick = (index, itemAction) => {
        setRippleIndex(index);
        setTimeout(() => setRippleIndex(null), 300);
        itemAction();
    };

    return (
        <aside
            aria-label="Mobile Navigation"
            className="md:hidden fixed bottom-0 left-0 right-0 w-full z-50 bg-white border-t border-[#e2e2e8] shadow-[0_-4px_25px_rgba(0,0,0,0.06)] pointer-events-auto"
        >
            {/* Inner Full-Width Container (Solid white, edge-to-edge) */}
            <div className="relative w-full max-w-lg mx-auto px-2 pt-2 pb-[max(env(safe-area-inset-bottom,0px),10px)] flex items-center justify-between">
                
                {/* Sliding Morphing Magnetic Active Indicator Pill */}
                {activeIndex >= 0 && (
                    <div
                        className="absolute top-2 bottom-[max(env(safe-area-inset-bottom,0px),10px)] rounded-[18px] bg-[#1c1c21] shadow-[0_4px_16px_rgba(28,28,33,0.22)] transition-all duration-350 ease-[cubic-bezier(0.34,1.4,0.64,1)] pointer-events-none z-0"
                        style={{
                            width: `calc((100% - 16px) / ${navItems.length})`,
                            left: `calc(8px + ${activeIndex} * ((100% - 16px) / ${navItems.length}))`,
                        }}
                    />
                )}

                {/* Navigation Action Buttons (Full width distribution) */}
                {navItems.map((item, idx) => {
                    const Icon = item.icon;
                    const isActive = activeIndex === idx;
                    const hasRipple = rippleIndex === idx;

                    return (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => handleItemClick(idx, item.action)}
                            className="relative flex-1 py-1.5 sm:py-2 flex flex-col items-center justify-center rounded-[18px] z-10 transition-transform duration-200 active:scale-90 select-none group focus:outline-none touch-manipulation cursor-pointer"
                            aria-label={item.label}
                        >
                            {/* Tap Ripple Animation Wave */}
                            {hasRipple && (
                                <span className="absolute w-10 h-10 rounded-full bg-black/10 animate-ripple pointer-events-none" />
                            )}

                            {/* Icon Container with Elastic Micro-Bounce */}
                            <div className="relative flex items-center justify-center">
                                {item.initials ? (
                                    <div
                                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold tracking-tight transition-all duration-300 ${
                                            isActive
                                                ? 'bg-white text-[#1c1c21] shadow-xs'
                                                : 'bg-[#1c1c21]/10 text-[#1c1c21] group-hover:scale-110'
                                        }`}
                                    >
                                        {item.initials}
                                    </div>
                                ) : (
                                    <Icon
                                        className={`w-5 h-5 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                                            isActive
                                                ? 'text-white scale-110 -translate-y-0.5 animate-tab-bounce drop-shadow-[0_2px_8px_rgba(255,255,255,0.4)]'
                                                : 'text-[#4e4e59] group-hover:text-[#1c1c21]'
                                        } ${item.isHeart && wishlistCount > 0 ? 'animate-heart-pulse text-rose-500 fill-rose-500/20' : ''}`}
                                        strokeWidth={isActive ? 2.3 : 1.9}
                                    />
                                )}

                                {/* Animated Notification Count Badge (Wishlist or Cart) */}
                                {Boolean(item.badge && item.badge > 0) && (
                                    <span
                                        className={`absolute -top-1.5 -right-2 min-w-[17px] h-[17px] px-1 rounded-full text-[9px] font-extrabold flex items-center justify-center shadow-xs border transition-transform duration-300 ${
                                            isActive
                                                ? 'bg-rose-500 text-white border-[#1c1c21]'
                                                : 'bg-[#1c1c21] text-white border-white'
                                        } ${item.isCart && cartBadgePop ? 'animate-badge-pop scale-125' : ''}`}
                                    >
                                        {item.badge > 99 ? '99+' : item.badge}
                                    </span>
                                )}
                            </div>

                            {/* Label with Smooth Fluid Reveal */}
                            <span
                                className={`text-[10px] mt-0.5 tracking-tight font-medium transition-all duration-300 max-w-[62px] truncate ${
                                    isActive
                                        ? 'text-white font-semibold scale-100 opacity-100 -translate-y-0.5'
                                        : 'text-[#6d6d78] group-hover:text-[#1c1c21] scale-95 opacity-90'
                                }`}
                            >
                                {item.label}
                            </span>

                            {/* Active Tiny Glow Dot */}
                            {isActive && (
                                <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-white/90 shadow-[0_0_6px_#ffffff] animate-pulse" />
                            )}
                        </button>
                    );
                })}
            </div>
        </aside>
    );
}
