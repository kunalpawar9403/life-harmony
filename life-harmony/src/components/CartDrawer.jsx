// src/components/CartDrawer.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import { useCart } from '../context/CartContext';
import { Minus, Plus, Trash2, ShoppingBag, Truck, Sparkles, ShieldCheck, Tag, Check } from 'lucide-react';

const FREE_SHIPPING_THRESHOLD = 999.0;

export default function CartDrawer() {
    const {
        drawerOpen,
        setDrawerOpen,
        items,
        updateQty,
        removeFromCart,
        subtotal,
        cartCount,
    } = useCart();
    const navigate = useNavigate();

    const [couponCode, setCouponCode] = useState('');
    const [couponApplied, setCouponApplied] = useState(false);
    const [couponDiscount, setCouponDiscount] = useState(0);

    const handleApplyCoupon = (e) => {
        e.preventDefault();
        if (couponCode.trim().toUpperCase() === 'HARMONY10') {
            setCouponApplied(true);
            setCouponDiscount(subtotal * 0.1);
        }
    };

    const handleCheckout = () => {
        if (items.length === 0) return;
        setDrawerOpen(false);
        navigate('/checkout');
    };

    // Calculate free shipping progress
    const progress = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
    const amountRemaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
    const finalTotal = Math.max(0, subtotal - (couponApplied ? couponDiscount : 0));

    return (
        <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
            <SheetContent className="w-full sm:max-w-md flex flex-col bg-white/95 backdrop-blur-2xl p-0 border-l border-black/10">
                <SheetHeader className="px-6 pt-6 pb-4 border-b border-black/5">
                    <div className="flex items-center justify-between">
                        <SheetTitle className="font-display text-2xl font-bold tracking-tight text-[#1c1c21]">
                            Your Bag ({cartCount})
                        </SheetTitle>
                    </div>

                    {/* Free Shipping Progress Indicator */}
                    <div className="mt-4 p-3.5 rounded-2xl bg-[#f8edf3] border border-black/5">
                        <div className="flex items-center justify-between text-xs font-semibold text-[#1c1c21] mb-2">
                            <span className="flex items-center gap-1.5">
                                <Truck className="w-3.5 h-3.5 text-[#1c1c21]" />
                                {subtotal >= FREE_SHIPPING_THRESHOLD ? (
                                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                                        <Sparkles className="w-3.5 h-3.5" /> Free Express Shipping Unlocked!
                                    </span>
                                ) : (
                                    <span>
                                        Add <strong className="font-bold">₹{amountRemaining.toFixed(2)}</strong> for Free Express Shipping
                                    </span>
                                )}
                            </span>
                            <span className="text-[11px] text-[#70707a]">{progress}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-white/80 overflow-hidden">
                            <div
                                className={`h-full transition-all duration-500 rounded-full ${
                                    subtotal >= FREE_SHIPPING_THRESHOLD
                                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                                        : 'bg-[#1c1c21]'
                                }`}
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                </SheetHeader>

                {items.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center px-6 pb-24 md:pb-6 text-center">
                        <div className="w-20 h-20 rounded-full bg-[#f8edf3] flex items-center justify-center mb-4">
                            <ShoppingBag
                                className="w-8 h-8 text-[#1c1c21]"
                                strokeWidth={1.6}
                            />
                        </div>
                        <h4 className="font-display text-lg font-bold text-[#1c1c21] mb-1">
                            Your bag is currently empty
                        </h4>
                        <p className="text-xs text-[#70707a] max-w-xs mb-6">
                            Start exploring our physician-formulated vitamins and cellular support sets.
                        </p>
                        <button
                            onClick={() => {
                                setDrawerOpen(false);
                                navigate('/shop');
                            }}
                            className="btn-dark px-7 h-11 rounded-full text-xs font-semibold active:scale-95"
                        >
                            Browse Store Collections
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Cart Items List */}
                        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                            {items.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex gap-3 bg-white rounded-2xl p-3.5 border border-black/5 shadow-2xs hover:shadow-xs transition-shadow"
                                >
                                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#faf7fa] shrink-0 border border-black/5">
                                        {item.image && (
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                            />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                                        <div className="flex justify-between items-start gap-2">
                                            <div className="min-w-0">
                                                <h4 className="text-sm font-semibold text-[#1c1c21] truncate">
                                                    {item.name}
                                                </h4>
                                                {item.subtitle && (
                                                    <p className="text-[11px] text-[#70707a] truncate">
                                                        {item.subtitle}
                                                    </p>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                className="text-[#9a9aa5] hover:text-red-500 p-1 transition-colors"
                                                aria-label="Remove item"
                                            >
                                                <Trash2
                                                    className="w-4 h-4"
                                                    strokeWidth={1.8}
                                                />
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-black/5">
                                            {/* Quantity Pill */}
                                            <div className="inline-flex items-center gap-2 bg-[#f4edf2] rounded-full px-2 py-0.5">
                                                <button
                                                    onClick={() => updateQty(item.id, item.qty - 1)}
                                                    className="w-5 h-5 rounded-full bg-white flex items-center justify-center hover:scale-110 active:scale-95 transition-transform shadow-3xs"
                                                    aria-label="Decrease quantity"
                                                >
                                                    <Minus className="w-2.5 h-2.5 text-[#1c1c21]" />
                                                </button>
                                                <span className="text-xs font-bold w-5 text-center text-[#1c1c21]">
                                                    {item.qty}
                                                </span>
                                                <button
                                                    onClick={() => updateQty(item.id, item.qty + 1)}
                                                    className="w-5 h-5 rounded-full bg-white flex items-center justify-center hover:scale-110 active:scale-95 transition-transform shadow-3xs"
                                                    aria-label="Increase quantity"
                                                >
                                                    <Plus className="w-2.5 h-2.5 text-[#1c1c21]" />
                                                </button>
                                            </div>

                                            <span className="text-sm font-bold text-[#1c1c21]">
                                                ₹{(Number(item.price) * item.qty).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Promo Code Quick Bar */}
                            <div className="pt-2">
                                {couponApplied ? (
                                    <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center justify-between">
                                        <span className="flex items-center gap-1.5">
                                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                                            <span>10% Discount Applied (HARMONY10)</span>
                                        </span>
                                        <span>-₹{couponDiscount.toFixed(2)}</span>
                                    </div>
                                ) : (
                                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                            <input
                                                type="text"
                                                value={couponCode}
                                                onChange={(e) => setCouponCode(e.target.value)}
                                                placeholder="Enter coupon code (try HARMONY10)"
                                                className="w-full h-9 pl-9 pr-3 text-xs bg-[#f6edf2] rounded-xl outline-none uppercase font-semibold text-[#1c1c21] placeholder:capitalize placeholder:font-normal"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="px-3.5 h-9 rounded-xl bg-[#1c1c21] text-white text-xs font-semibold hover:bg-black transition-colors"
                                        >
                                            Apply
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>

                        {/* Footer Summary & Checkout */}
                        <div className="border-t border-black/10 px-6 pt-4 pb-28 md:pb-6 space-y-3.5 bg-white">
                            <div className="flex justify-between text-xs text-[#656570]">
                                <span>Subtotal</span>
                                <span className="font-semibold text-[#1c1c21]">₹{subtotal.toFixed(2)}</span>
                            </div>

                            {couponApplied && (
                                <div className="flex justify-between text-xs text-emerald-600 font-semibold">
                                    <span>Discount (10%)</span>
                                    <span>-₹{couponDiscount.toFixed(2)}</span>
                                </div>
                            )}

                            <div className="flex justify-between text-xs text-[#656570]">
                                <span>Estimated Shipping</span>
                                <span className="font-medium text-[#1c1c21]">
                                    {subtotal >= FREE_SHIPPING_THRESHOLD ? (
                                        <span className="text-emerald-700 font-bold uppercase">Free</span>
                                    ) : (
                                        'Calculated next'
                                    )}
                                </span>
                            </div>

                            <div className="flex justify-between items-baseline pt-2 border-t border-black/5">
                                <span className="font-bold text-sm text-[#1c1c21]">Estimated Total</span>
                                <span className="font-display text-2xl font-bold text-[#1c1c21]">
                                    ₹{finalTotal.toFixed(2)}
                                </span>
                            </div>

                            <button
                                onClick={handleCheckout}
                                className="btn-dark w-full h-12 rounded-full text-sm font-semibold flex items-center justify-center gap-2 shadow-md active:scale-95"
                            >
                                <span>Proceed to Checkout</span>
                            </button>

                            <div className="flex items-center justify-center gap-2 text-[10px] text-[#80808a] pt-1">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Guaranteed 256-bit Encrypted Checkout • 30-Day Money Back</span>
                            </div>
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
}