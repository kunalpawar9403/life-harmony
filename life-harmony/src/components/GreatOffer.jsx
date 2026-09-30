// src/components/GreatOffer.jsx
import { useState, useEffect } from 'react';
import { Heart, Clock, Check, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getProducts, greatOfferFallback } from '../mock';
import { useCart } from '../context/CartContext';
import { useToast } from '../hooks/use-toast';

export default function GreatOffer() {
    const { toast } = useToast();
    const { addToCart, wishlist, toggleWishlist, isInWishlist, setDrawerOpen } = useCart();

    const [offer, setOffer] = useState(greatOfferFallback);
    const [justAdded, setJustAdded] = useState(false);
    const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 32, seconds: 45 });

    // Live countdown effect
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
                if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
                if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
                return { hours: 24, minutes: 0, seconds: 0 };
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        let cancelled = false;
        getProducts({ category: 'offer_set' })
            .then((list) => {
                if (cancelled || !list.length) return;
                const o = list[0];
                setOffer({
                    id: o.id,
                    name: o.name,
                    subtitle: o.subtitle,
                    originalPrice: o.originalPrice ?? o.price,
                    price: o.price,
                    image1: o.image,
                    image2: o.image,
                });
            })
            .catch(() => { });
        return () => {
            cancelled = true;
        };
    }, []);

    const isLiked = isInWishlist ? isInWishlist(offer) : wishlist.includes(offer?.id);
    const savings = offer.originalPrice ? (offer.originalPrice - offer.price).toFixed(2) : '7.00';

    const handleAdd = async () => {
        try {
            await addToCart(
                {
                    id: offer.id,
                    name: offer.name,
                    subtitle: offer.subtitle,
                    price: offer.price,
                    image: offer.image1,
                },
                1
            );
            setJustAdded(true);
            toast({
                title: 'Bundle Added to Cart',
                description: `${offer.name} — ₹${Number(offer.price).toFixed(2)}`,
            });
            setTimeout(() => setJustAdded(false), 2000);
        } catch (err) {
            toast({
                title: 'Sign in required',
                description:
                    err.response?.data?.message ||
                    'Please sign in to add items to your cart.',
            });
        }
    };

    const handleWishlist = async () => {
        try {
            await toggleWishlist(offer);
        } catch (err) {
            toast({
                title: 'Sign in required',
                description:
                    err.response?.data?.message ||
                    'Please sign in to save items.',
            });
        }
    };

    return (
        <section className="mt-8 sm:mt-12 overflow-hidden">
            {/* Animated Marquee Banner */}
            <div className="marquee py-3 sm:py-6 overflow-hidden">
                <div className="marquee-content">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <span
                            key={i}
                            className="font-display text-[32px] xs:text-[48px] sm:text-[68px] md:text-[88px] leading-none tracking-tight whitespace-nowrap text-[#1c1c21]/90"
                        >
                            GREAT OFFER &nbsp;•
                        </span>
                    ))}
                </div>
                <div className="marquee-content" aria-hidden="true">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <span
                            key={i}
                            className="font-display text-[32px] xs:text-[48px] sm:text-[68px] md:text-[88px] leading-none tracking-tight whitespace-nowrap text-[#1c1c21]/90"
                        >
                            GREAT OFFER &nbsp;•
                        </span>
                    ))}
                </div>
            </div>

            {/* Bundle Showcase Card */}
            <div className="section-bg rounded-[26px] xs:rounded-[36px] px-4 xs:px-6 sm:px-10 md:px-16 py-8 sm:py-14 md:py-18 grid grid-cols-12 gap-6 sm:gap-8 items-center transition-all overflow-hidden">
                {/* Left Offer Details */}
                <div className="col-span-12 md:col-span-4 order-2 md:order-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2 sm:mb-3">
                        <span className="px-2.5 xs:px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] xs:text-[11px] font-bold uppercase tracking-wider">
                            Save ₹{savings} Today
                        </span>
                        <div className="inline-flex items-center gap-1 text-[10px] xs:text-[11px] font-semibold text-[#656570]">
                            <Clock className="w-3.5 h-3.5" />
                            <span>
                                {String(timeLeft.hours).padStart(2, '0')}:
                                {String(timeLeft.minutes).padStart(2, '0')}:
                                {String(timeLeft.seconds).padStart(2, '0')}
                            </span>
                        </div>
                    </div>

                    <h3 className="font-display text-[22px] xs:text-[26px] sm:text-[34px] leading-tight text-[#1c1c21]">
                        {offer.name}
                    </h3>
                    <p className="text-[12px] sm:text-[13px] text-[#656570] mt-1.5 sm:mt-2">
                        {offer.subtitle}
                    </p>

                    {/* Pricing */}
                    <div className="mt-4 sm:mt-6 flex items-baseline gap-2.5 sm:gap-3 flex-wrap">
                        <span className="text-[15px] sm:text-[17px] text-[#9a9aa5] line-through font-medium">
                            ₹{Number(offer.originalPrice).toFixed(2)}
                        </span>
                        <span className="font-display text-[28px] xs:text-[36px] sm:text-[42px] font-bold text-[#1c1c21]">
                            ₹{Number(offer.price).toFixed(2)}
                        </span>
                        <span className="text-[11px] sm:text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                            Best Value
                        </span>
                    </div>

                    {/* Key Perks */}
                    <ul className="mt-3 sm:mt-4 space-y-1.5 sm:space-y-2 text-[11px] xs:text-[12px] text-[#40404a]">
                        <li className="flex items-center gap-2">
                            <span className="w-4 h-4 rounded-full bg-emerald-500/15 text-emerald-700 flex items-center justify-center shrink-0">
                                <Check className="w-2.5 h-2.5" />
                            </span>
                            <span>Full 60-day dual nutritional synergy supply</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-4 h-4 rounded-full bg-emerald-500/15 text-emerald-700 flex items-center justify-center shrink-0">
                                <Check className="w-2.5 h-2.5" />
                            </span>
                            <span>Includes free express courier delivery</span>
                        </li>
                    </ul>

                    {/* Actions */}
                    <div className="mt-5 sm:mt-7 flex items-center gap-2.5 sm:gap-3">
                        <button
                            onClick={handleAdd}
                            disabled={justAdded}
                            className={`btn-dark flex-1 xs:flex-initial px-5 xs:px-7 h-11 sm:h-12 rounded-full text-xs xs:text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 touch-manipulation ${
                                justAdded ? 'bg-emerald-600' : ''
                            }`}
                        >
                            {justAdded ? (
                                <>
                                    <Check className="w-4 h-4" /> Added to Cart
                                </>
                            ) : (
                                'Claim Bundle Offer'
                            )}
                        </button>
                        <button
                            onClick={handleWishlist}
                            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full glass-pill flex items-center justify-center hover:scale-105 active:scale-95 transition-all shrink-0 touch-manipulation"
                            aria-label="Wishlist bundle"
                        >
                            <Heart
                                className={`w-4 h-4 transition-colors ${
                                    isLiked ? 'fill-[#e03154] text-[#e03154]' : 'text-[#50505a]'
                                }`}
                                strokeWidth={2}
                            />
                        </button>
                    </div>
                </div>

                {/* Center Showcase Pedestal with Dual Bottles */}
                <div className="col-span-12 md:col-span-4 relative min-h-[260px] xs:min-h-[300px] md:min-h-[440px] flex items-end justify-center order-1 md:order-2 overflow-hidden py-4 sm:py-0">
                    <div
                        className="absolute left-1/2 -translate-x-1/2 bottom-0 w-[240px] xs:w-[300px] sm:w-[360px] h-[240px] xs:h-[300px] sm:h-[360px] rounded-t-full pointer-events-none"
                        style={{
                            background:
                                'radial-gradient(ellipse at 50% 60%, rgba(244, 201, 215, 0.45) 0%, rgba(220, 230, 255, 0.3) 60%, transparent 100%)',
                        }}
                    />
                    <div className="relative z-10 flex items-end justify-center gap-2 xs:gap-3 pb-2 sm:pb-6">
                        <div className="w-26 xs:w-32 sm:w-38 md:w-42 h-44 xs:h-52 sm:h-60 md:h-68 rounded-[20px] xs:rounded-[24px] overflow-hidden bg-white shadow-card-hover border border-white/80 transform -rotate-3 hover:rotate-0 transition-transform duration-500 shrink-0">
                            <img
                                src={offer.image1}
                                alt="Supplement 1"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="w-26 xs:w-32 sm:w-38 md:w-42 h-44 xs:h-52 sm:h-60 md:h-68 rounded-[20px] xs:rounded-[24px] overflow-hidden bg-white shadow-card-hover border border-white/80 transform rotate-3 hover:rotate-0 transition-transform duration-500 shrink-0">
                            <img
                                src={offer.image2}
                                alt="Supplement 2"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>

                {/* Right Value Story */}
                <div className="col-span-12 md:col-span-4 md:pl-6 order-3 space-y-4">
                    <div className="glass-panel p-5 rounded-2xl">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1c1c21] mb-1">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Complete Wellness System
                        </div>
                        <p className="text-[13px] leading-[1.65] text-[#555560]">
                            Whether you're training hard, managing busy schedules, or investing in long-term longevity, this set eliminates guesswork by combining complementary bio-pathways.
                        </p>
                    </div>

                    <div className="pt-2">
                        <Link
                            to="/shop"
                            className="inline-flex items-center gap-2 text-sm font-semibold text-[#1c1c21] hover:underline group"
                        >
                            <span>Explore all bundles &amp; sets</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}