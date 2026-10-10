// src/pages/ProductDetail.jsx
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
    ChevronLeft,
    Heart,
    Minus,
    Plus,
    Star,
    Check,
    Shield,
    Truck,
    Leaf,
    Sparkles,
    BadgeCheck,
    Clock,
    Share2,
    CheckCircle2
} from 'lucide-react';
import { getProduct, getGoals } from '../mock';
import { useCart } from '../context/CartContext';
import { useToast } from '../hooks/use-toast';
import ProductCard from '../components/ProductCard';

export default function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart, wishlist, toggleWishlist, isInWishlist, setDrawerOpen } = useCart();
    const { toast } = useToast();

    const [product, setProduct] = useState(null); // null=loading, undefined=not found
    const [related, setRelated] = useState([]);
    const [goals, setGoals] = useState([]);
    const [qty, setQty] = useState(1);
    const [activeTab, setActiveTab] = useState('ingredients');
    const [selectedImageIdx, setSelectedImageIdx] = useState(0);
    const [justAdded, setJustAdded] = useState(false);

    useEffect(() => {
        getGoals().then(setGoals).catch(() => { });
    }, []);

    useEffect(() => {
        let cancelled = false;
        setProduct(null);
        setSelectedImageIdx(0);
        getProduct(id)
            .then((data) => {
                if (cancelled) return;
                setProduct(data.product);
                setRelated(data.related || []);
            })
            .catch(() => {
                if (!cancelled) setProduct(undefined);
            });
        return () => {
            cancelled = true;
        };
    }, [id]);

    if (product === null) {
        return (
            <div className="section-bg rounded-[36px] p-20 text-center mt-6">
                <div className="w-10 h-10 rounded-full border-2 border-[#1c1c21] border-t-transparent animate-spin mx-auto mb-4" />
                <p className="text-sm font-semibold text-[#656570]">Retrieving formula clinical data...</p>
            </div>
        );
    }

    if (product === undefined) {
        return (
            <div className="section-bg rounded-[36px] p-20 text-center mt-6">
                <h2 className="font-display text-3xl font-bold text-[#1c1c21]">Product not found</h2>
                <p className="text-sm text-[#70707a] mt-2">The formulation you requested is not currently listed.</p>
                <button
                    onClick={() => navigate('/shop')}
                    className="btn-dark mt-6 px-7 h-11 rounded-full text-xs font-semibold"
                >
                    Back to Catalog
                </button>
            </div>
        );
    }

    const isLiked = isInWishlist ? isInWishlist(product) : wishlist.includes(product?.id);
    const avgRating = product.reviews?.length
        ? (
            product.reviews.reduce((s, r) => s + r.rating, 0) /
            product.reviews.length
        ).toFixed(1)
        : '5.0';

    // Build multi-image gallery angles
    const galleryImages = [
        product.image,
        'https://images.unsplash.com/photo-1664786908163-85ca46f85138?crop=entropy&cs=srgb&fm=jpg&q=85',
        'https://images.unsplash.com/photo-1624362772755-4d5843e67047?crop=entropy&cs=srgb&fm=jpg&q=85',
    ];

    const handleAdd = async () => {
        try {
            await addToCart(product, qty);
            setJustAdded(true);
            toast({
                title: 'Added to cart',
                description: `${product.name} × ${qty}`,
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
            await toggleWishlist(product);
        } catch (err) {
            toast({
                title: 'Sign in required',
                description:
                    err.response?.data?.message ||
                    'Please sign in to save items.',
            });
        }
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: product.name,
                text: product.subtitle,
                url: window.location.href,
            }).catch(() => {});
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast({ title: 'Link Copied', description: 'Product link copied to clipboard.' });
        }
    };

    const goalLabel = (gid) =>
        goals.find((g) => g.id === gid)?.label || gid;

    return (
        <div className="mt-2 pb-32 sm:pb-16">
            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-2 text-xs font-semibold mb-4 sm:mb-6 px-1 text-[#70707a] overflow-x-auto no-scrollbar whitespace-nowrap">
                <Link
                    to="/shop"
                    className="inline-flex items-center gap-1 hover:text-[#1c1c21] transition-colors shrink-0"
                >
                    <ChevronLeft className="w-3.5 h-3.5" /> Back to Shop
                </Link>
                <span>/</span>
                <span className="text-[#1c1c21] truncate max-w-[200px] xs:max-w-none">{product.name}</span>
            </div>

            {/* Main Product Showcase Section */}
            <section className="section-bg rounded-[24px] xs:rounded-[36px] px-4 xs:px-6 sm:px-10 md:px-16 py-6 xs:py-10 sm:py-14 md:py-16 grid grid-cols-1 md:grid-cols-12 gap-6 xs:gap-8 md:gap-14 transition-all">
                {/* Left: Gallery & Image Previews */}
                <div className="md:col-span-6 flex flex-col gap-3 xs:gap-4">
                    {/* Primary Large Image */}
                    <div className="rounded-[22px] xs:rounded-[28px] bg-gradient-to-b from-[#fbf6f8] to-[#f4e8ee] overflow-hidden aspect-square flex items-center justify-center p-4 xs:p-6 sm:p-8 shadow-card-hover border border-white/80 relative group">
                        <img
                            src={galleryImages[selectedImageIdx]}
                            alt={product.name}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3 xs:top-4 xs:left-4">
                            <span className="px-2.5 xs:px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[9px] xs:text-[10px] font-bold uppercase tracking-wider text-[#1c1c21] shadow-2xs border border-black/5">
                                Verified Potency
                            </span>
                        </div>
                    </div>

                    {/* Thumbnail Selector */}
                    <div className="flex items-center gap-2.5 xs:gap-3 overflow-x-auto no-scrollbar pb-1">
                        {galleryImages.map((src, i) => (
                            <button
                                key={i}
                                onClick={() => setSelectedImageIdx(i)}
                                className={`w-16 h-16 xs:w-20 xs:h-20 rounded-[14px] xs:rounded-[18px] bg-white overflow-hidden p-1.5 xs:p-2 transition-all border shrink-0 ${
                                    selectedImageIdx === i
                                        ? 'border-[#1c1c21] shadow-md ring-2 ring-[#1c1c21]/10 scale-102'
                                        : 'border-black/5 hover:border-black/20 opacity-70 hover:opacity-100'
                                }`}
                            >
                                <img
                                    src={src}
                                    alt={`Angle ${i + 1}`}
                                    className="w-full h-full object-cover rounded-lg xs:rounded-xl"
                                />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right: Product Purchase Details */}
                <div className="md:col-span-6 flex flex-col justify-between">
                    <div>
                        {/* Goals Pills */}
                        <div className="flex items-center gap-1.5 xs:gap-2 flex-wrap mb-2.5 xs:mb-3">
                            {product.goals?.map((g) => (
                                <span
                                    key={g}
                                    className="text-[9px] xs:text-[10px] uppercase font-bold tracking-widest px-2.5 xs:px-3 py-0.5 xs:py-1 rounded-full bg-[#adc8f8]/50 text-[#1c1c21] border border-black/5"
                                >
                                    {goalLabel(g)}
                                </span>
                            ))}
                            <span className="text-[9px] xs:text-[10px] uppercase font-bold tracking-widest px-2.5 xs:px-3 py-0.5 xs:py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                                In Stock • Ships Today
                            </span>
                        </div>

                        {/* Title & Subtitle */}
                        <h1 className="font-display text-[28px] xs:text-[34px] sm:text-[44px] md:text-[50px] leading-[1.05] xs:leading-[0.98] tracking-tight text-[#1c1c21]">
                            {product.name}
                        </h1>
                        <p className="text-xs xs:text-sm sm:text-base text-[#60606a] mt-2 xs:mt-2.5 font-medium">
                            {product.subtitle}
                        </p>

                        {/* Rating Row */}
                        <div className="flex items-center gap-2 xs:gap-3 mt-3 xs:mt-4 pt-2 border-t border-black/5 flex-wrap">
                            <div className="flex items-center gap-1 text-amber-400">
                                {[1, 2, 3, 4, 5].map((n) => (
                                    <Star
                                        key={n}
                                        className={`w-3.5 h-3.5 xs:w-4 xs:h-4 ${
                                            n <= Math.round(Number(avgRating))
                                                ? 'fill-amber-400 text-amber-400'
                                                : 'text-slate-300'
                                        }`}
                                    />
                                ))}
                            </div>
                            <span className="text-xs font-semibold text-[#1c1c21]">
                                {avgRating}
                            </span>
                            <span className="text-[11px] xs:text-xs text-[#70707a]">
                                • {product.reviews?.length || 24} Verified Reviews
                            </span>
                        </div>

                        {/* Price Row */}
                        <div className="mt-4 xs:mt-6 flex items-baseline gap-2 xs:gap-3 flex-wrap">
                            <span className="font-display text-[32px] xs:text-[40px] sm:text-[48px] font-bold text-[#1c1c21] leading-none">
                                ₹{Number(product.price).toFixed(2)}
                            </span>
                            <span className="text-[11px] xs:text-xs font-semibold text-[#70707a]">
                                / 30-Day Routine Supply
                            </span>
                            <span className="text-[10px] xs:text-xs font-bold text-emerald-700 bg-emerald-50 px-2 xs:px-2.5 py-0.5 xs:py-1 rounded-full">
                                Free Shipping Eligible
                            </span>
                        </div>

                        {/* Benefits Highlights List */}
                        {product.benefits?.length > 0 && (
                            <div className="mt-4 xs:mt-6 p-3.5 xs:p-4 rounded-2xl bg-white/70 border border-black/5 space-y-2">
                                {product.benefits.map((b) => (
                                    <div
                                        key={b}
                                        className="flex items-start gap-2.5 text-xs sm:text-sm text-[#353540]"
                                    >
                                        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                                            <Check className="w-3 h-3 stroke-[2.5]" />
                                        </span>
                                        <span className="font-medium leading-snug">{b}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Purchase Box: Quantity Stepper & Add to Cart */}
                    <div className="mt-6 xs:mt-8 pt-5 xs:pt-6 border-t border-black/5 space-y-3 xs:space-y-4">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            <div className="flex items-center gap-2 xs:gap-3 justify-between sm:justify-start">
                                {/* Quantity Controls */}
                                <div className="inline-flex items-center gap-1.5 xs:gap-2 bg-white rounded-full p-1.5 shadow-2xs border border-black/5 shrink-0">
                                    <button
                                        onClick={() => setQty(Math.max(1, qty - 1))}
                                        className="w-8 h-8 xs:w-9 xs:h-9 rounded-full bg-[#f6edf2] flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
                                        aria-label="Decrease quantity"
                                    >
                                        <Minus className="w-3.5 h-3.5 text-[#1c1c21]" />
                                    </button>
                                    <span className="w-7 xs:w-8 text-center text-xs xs:text-sm font-bold text-[#1c1c21]">
                                        {qty}
                                    </span>
                                    <button
                                        onClick={() => setQty(qty + 1)}
                                        className="w-8 h-8 xs:w-9 xs:h-9 rounded-full bg-[#f6edf2] flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
                                        aria-label="Increase quantity"
                                    >
                                        <Plus className="w-3.5 h-3.5 text-[#1c1c21]" />
                                    </button>
                                </div>

                                {/* Wishlist & Share on Mobile */}
                                <div className="flex items-center gap-2 sm:hidden">
                                    <button
                                        onClick={handleWishlist}
                                        className="w-10 h-10 rounded-full glass-pill flex items-center justify-center active:scale-95 transition-all shadow-2xs"
                                        aria-label="Add to wishlist"
                                    >
                                        <Heart
                                            className={`w-4 h-4 transition-colors ${
                                                isLiked ? 'fill-[#e03154] text-[#e03154]' : 'text-[#60606a]'
                                            }`}
                                            strokeWidth={2}
                                        />
                                    </button>
                                    <button
                                        onClick={handleShare}
                                        className="w-10 h-10 rounded-full glass-pill flex items-center justify-center active:scale-95 transition-all shadow-2xs"
                                        aria-label="Share product"
                                    >
                                        <Share2 className="w-4 h-4 text-[#60606a]" />
                                    </button>
                                </div>
                            </div>

                            {/* Main Add Button */}
                            <button
                                onClick={handleAdd}
                                disabled={justAdded}
                                className={`flex-1 h-11 xs:h-12 rounded-full text-xs xs:text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 ${
                                    justAdded ? 'bg-emerald-600 text-white' : 'btn-dark'
                                }`}
                            >
                                {justAdded ? (
                                    <>
                                        <CheckCircle2 className="w-4 h-4" /> Added to Your Bag!
                                    </>
                                ) : (
                                    <span>
                                        Add to Cart • ₹{(Number(product.price) * qty).toFixed(2)}
                                    </span>
                                )}
                            </button>

                            {/* Wishlist & Share on Desktop */}
                            <div className="hidden sm:flex items-center gap-2">
                                <button
                                    onClick={handleWishlist}
                                    className="w-12 h-12 rounded-full glass-pill flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-2xs"
                                    aria-label="Add to wishlist"
                                >
                                    <Heart
                                        className={`w-4 h-4 transition-colors ${
                                            isLiked ? 'fill-[#e03154] text-[#e03154]' : 'text-[#60606a]'
                                        }`}
                                        strokeWidth={2}
                                    />
                                </button>
                                <button
                                    onClick={handleShare}
                                    className="w-12 h-12 rounded-full glass-pill flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-2xs"
                                    aria-label="Share product"
                                >
                                    <Share2 className="w-4 h-4 text-[#60606a]" />
                                </button>
                            </div>
                        </div>

                        {/* Purity Guarantee Mini Cards */}
                        <div className="grid grid-cols-3 gap-1.5 xs:gap-2 pt-2">
                            <div className="flex flex-col xs:flex-row items-center justify-center text-center xs:text-left gap-1 xs:gap-2 p-2 rounded-xl bg-white/70 border border-black/5 text-[10px] xs:text-[11px] font-semibold text-[#1c1c21]">
                                <Leaf className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-emerald-600 shrink-0" />
                                <span className="leading-tight">100% Non-GMO</span>
                            </div>
                            <div className="flex flex-col xs:flex-row items-center justify-center text-center xs:text-left gap-1 xs:gap-2 p-2 rounded-xl bg-white/70 border border-black/5 text-[10px] xs:text-[11px] font-semibold text-[#1c1c21]">
                                <Shield className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-blue-600 shrink-0" />
                                <span className="leading-tight">Triple Lab Tested</span>
                            </div>
                            <div className="flex flex-col xs:flex-row items-center justify-center text-center xs:text-left gap-1 xs:gap-2 p-2 rounded-xl bg-white/70 border border-black/5 text-[10px] xs:text-[11px] font-semibold text-[#1c1c21]">
                                <Truck className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-indigo-600 shrink-0" />
                                <span className="leading-tight">Fast 2-Day Air</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Deep Info Tabs Section (Ingredients, Reviews, Directions) */}
            <section className="section-bg rounded-[24px] xs:rounded-[36px] px-4 xs:px-6 sm:px-10 md:px-16 py-8 xs:py-10 md:py-14 mt-8 xs:mt-10 transition-all">
                <div className="w-full overflow-x-auto no-scrollbar pb-1">
                    <div className="flex items-center gap-1.5 xs:gap-2 p-1.5 rounded-full glass-pill self-start shadow-xs w-max">
                        <button
                            onClick={() => setActiveTab('ingredients')}
                            className={`px-3.5 xs:px-5 h-9 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                                activeTab === 'ingredients'
                                    ? 'bg-[#1c1c21] text-white shadow-xs'
                                    : 'text-[#60606a] hover:text-[#1c1c21]'
                            }`}
                        >
                            Supplement Facts
                        </button>
                        <button
                            onClick={() => setActiveTab('reviews')}
                            className={`px-3.5 xs:px-5 h-9 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                                activeTab === 'reviews'
                                    ? 'bg-[#1c1c21] text-white shadow-xs'
                                    : 'text-[#60606a] hover:text-[#1c1c21]'
                            }`}
                        >
                            Reviews ({product.reviews?.length || 0})
                        </button>
                        <button
                            onClick={() => setActiveTab('directions')}
                            className={`px-3.5 xs:px-5 h-9 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                                activeTab === 'directions'
                                    ? 'bg-[#1c1c21] text-white shadow-xs'
                                    : 'text-[#60606a] hover:text-[#1c1c21]'
                            }`}
                        >
                            Usage &amp; Storage
                        </button>
                    </div>
                </div>

                <div className="mt-6 xs:mt-8">
                    {activeTab === 'ingredients' && (
                        <div className="bg-white/90 backdrop-blur-md rounded-2xl xs:rounded-3xl p-4 xs:p-6 sm:p-8 border border-black/5 shadow-xs">
                            <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 mb-4">
                                <div>
                                    <h3 className="font-display text-lg xs:text-xl font-bold text-[#1c1c21]">
                                        Supplement Facts Breakdown
                                    </h3>
                                    <p className="text-[11px] xs:text-xs text-[#70707a] mt-0.5">
                                        Per serving. † Daily Value (DV) established under US Pharmacopeia specifications.
                                    </p>
                                </div>
                                <span className="self-start xs:self-center px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold">
                                    USP Verified
                                </span>
                            </div>

                            <div className="overflow-x-auto no-scrollbar rounded-2xl border border-black/5 mt-4 xs:mt-6">
                                <table className="w-full min-w-[380px] sm:min-w-full text-xs xs:text-sm">
                                    <thead className="bg-[#f8eff3] text-left text-[10px] xs:text-xs font-bold uppercase tracking-wider text-[#1c1c21]">
                                        <tr>
                                            <th className="px-3 xs:px-4 py-3 xs:py-3.5">Active Ingredient</th>
                                            <th className="px-3 xs:px-4 py-3 xs:py-3.5">Amount Per Serving</th>
                                            <th className="px-3 xs:px-4 py-3 xs:py-3.5 text-right">% Daily Value</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-black/5">
                                        {product.ingredients?.map((ing, i) => (
                                            <tr key={i} className="hover:bg-black/[0.01] transition-colors">
                                                <td className="px-3 xs:px-4 py-2.5 xs:py-3 font-semibold text-[#1c1c21]">
                                                    {ing.name}
                                                </td>
                                                <td className="px-3 xs:px-4 py-2.5 xs:py-3 text-[#656570]">
                                                    {ing.amount}
                                                </td>
                                                <td className="px-3 xs:px-4 py-2.5 xs:py-3 text-right font-bold text-[#1c1c21]">
                                                    {ing.dv}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'reviews' && (
                        <div className="space-y-4 xs:space-y-6">
                            {/* Rating Breakdown Bar */}
                            <div className="bg-white/90 rounded-2xl xs:rounded-3xl p-4 xs:p-6 sm:p-8 border border-black/5 grid grid-cols-1 sm:grid-cols-12 gap-4 xs:gap-6 items-center">
                                <div className="sm:col-span-4 text-center sm:text-left">
                                    <div className="font-display text-4xl xs:text-5xl font-bold text-[#1c1c21]">
                                        {avgRating}
                                    </div>
                                    <div className="flex items-center justify-center sm:justify-start gap-1 text-amber-400 my-2">
                                        {[1, 2, 3, 4, 5].map((n) => (
                                            <Star key={n} className="w-4 h-4 fill-amber-400" />
                                        ))}
                                    </div>
                                    <p className="text-xs text-[#70707a]">Based on {product.reviews?.length || 24} verified purchase reviews</p>
                                </div>
                                <div className="sm:col-span-8 space-y-2">
                                    {[
                                        { stars: 5, pct: '88%' },
                                        { stars: 4, pct: '10%' },
                                        { stars: 3, pct: '2%' },
                                        { stars: 2, pct: '0%' },
                                        { stars: 1, pct: '0%' },
                                    ].map((row) => (
                                        <div key={row.stars} className="flex items-center gap-2 xs:gap-3 text-xs">
                                            <span className="w-12 font-medium text-[#70707a] shrink-0">{row.stars} stars</span>
                                            <div className="flex-1 h-2 rounded-full bg-[#f4ebee] overflow-hidden">
                                                <div className="h-full bg-amber-400 rounded-full" style={{ width: row.pct }} />
                                            </div>
                                            <span className="w-8 text-right font-semibold text-[#1c1c21] shrink-0">{row.pct}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Review Cards List */}
                            <div className="space-y-3">
                                {product.reviews?.map((r) => (
                                    <div
                                        key={r.id}
                                        className="bg-white/90 rounded-2xl p-4 xs:p-5 border border-black/5 shadow-2xs"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h4 className="font-bold text-xs xs:text-sm text-[#1c1c21]">
                                                        {r.title}
                                                    </h4>
                                                    <span className="inline-flex items-center gap-1 text-[9px] xs:text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                                                        <BadgeCheck className="w-3 h-3 text-emerald-600" /> Verified Buyer
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <div className="flex items-center gap-0.5 text-amber-400">
                                                        {[1, 2, 3, 4, 5].map((n) => (
                                                            <Star
                                                                key={n}
                                                                className={`w-3 h-3 ${
                                                                    n <= r.rating ? 'fill-amber-400' : 'text-slate-200'
                                                                }`}
                                                            />
                                                        ))}
                                                    </div>
                                                    <span className="text-[11px] xs:text-xs text-[#70707a]">
                                                        {r.name} • {r.date}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-xs sm:text-sm mt-2.5 xs:mt-3 leading-relaxed text-[#40404a]">
                                            "{r.text}"
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'directions' && (
                        <div className="bg-white/90 rounded-2xl xs:rounded-3xl p-4 xs:p-6 sm:p-8 max-w-2xl border border-black/5 shadow-xs space-y-4 xs:space-y-6">
                            <div>
                                <h3 className="font-display text-base xs:text-lg font-bold text-[#1c1c21] mb-2">
                                    Recommended Daily Protocol
                                </h3>
                                <p className="text-xs sm:text-sm leading-relaxed text-[#555560]">
                                    Take 1 Plantgel® capsule daily with your first meal of the day, preferably containing healthy fats (such as avocado, eggs, or olive oil) to maximize lipid bioavailability.
                                </p>
                            </div>
                            <div className="pt-4 border-t border-black/5">
                                <h4 className="font-display text-sm xs:text-base font-bold text-[#1c1c21] mb-2">
                                    Quality Cautions &amp; Storage
                                </h4>
                                <p className="text-xs sm:text-sm leading-relaxed text-[#70707a]">
                                    Store at room temperature (59°F–77°F) away from moisture and direct sunlight. Keep bottle tightly sealed. If pregnant, nursing, taking blood thinners, or under medical supervision, consult your primary physician before commencing.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Related Products Recommendation */}
            {related.length > 0 && (
                <section className="section-bg rounded-[24px] xs:rounded-[36px] px-4 xs:px-6 sm:px-10 md:px-16 py-8 xs:py-12 md:py-16 mt-8 xs:mt-10 transition-all">
                    <h2 className="font-display text-[26px] xs:text-[32px] sm:text-[42px] font-bold tracking-tight text-[#1c1c21] mb-6 xs:mb-8">
                        COMPLEMENTARY FORMULAS
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 xs:gap-4 md:gap-6">
                        {related.map((p) => (
                            <ProductCard key={p.id} product={p} />
                        ))}
                    </div>
                </section>
            )}

            {/* Sticky Floating Mobile Purchase Capsule (Floats cleanly right above MobileBottomNav) */}
            <div className="md:hidden fixed bottom-[calc(60px+max(env(safe-area-inset-bottom,0px),10px)+8px)] inset-x-3 xs:inset-x-4 max-w-md mx-auto bg-white/95 backdrop-blur-xl border border-black/10 rounded-2xl p-2.5 z-40 shadow-[0_8px_25px_rgba(0,0,0,0.12)] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-10 h-10 rounded-xl object-cover bg-slate-100 shrink-0 border border-black/5"
                    />
                    <div className="min-w-0">
                        <div className="text-xs font-bold text-[#1c1c21] truncate">{product.name}</div>
                        <div className="text-xs font-semibold text-[#656570]">₹{Number(product.price).toFixed(2)}</div>
                    </div>
                </div>
                <button
                    onClick={handleAdd}
                    disabled={justAdded}
                    className={`px-3.5 xs:px-4 h-9 rounded-full text-xs font-semibold shrink-0 shadow-sm transition-all active:scale-95 flex items-center gap-1.5 ${
                        justAdded ? 'bg-emerald-600 text-white' : 'btn-dark'
                    }`}
                >
                    {justAdded ? (
                        <>
                            <CheckCircle2 className="w-3.5 h-3.5" /> Added!
                        </>
                    ) : (
                        'Add to Cart'
                    )}
                </button>
            </div>
        </div>
    );
}