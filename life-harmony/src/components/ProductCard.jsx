// src/components/ProductCard.jsx
import { useState } from 'react';
import { Heart, Star, Check, Plus, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../hooks/use-toast';

export default function ProductCard({ product, compact = false }) {
    const { toast } = useToast();
    const { addToCart, wishlist, toggleWishlist, isInWishlist, setDrawerOpen } = useCart();
    const [justAdded, setJustAdded] = useState(false);
    const isLiked = isInWishlist ? isInWishlist(product) : wishlist.includes(product?.id);

    // Calculate or fallback rating
    const rating = product.reviews?.length
        ? (product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length).toFixed(1)
        : (product.rating ? Number(product.rating).toFixed(1) : '4.9');

    const handleAddToCart = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            await addToCart(product);
            setJustAdded(true);
            toast({
                title: 'Added to cart',
                description: `${product.name} — ₹${Number(product.price).toFixed(2)}`,
            });
            setTimeout(() => setJustAdded(false), 1800);
        } catch (err) {
            toast({
                title: 'Sign in required',
                description:
                    err.response?.data?.message ||
                    'Please sign in to add items to your cart.',
            });
        }
    };

    const handleWishlist = async (e) => {
        e.preventDefault();
        e.stopPropagation();
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

    const productRoute = `/product/${product.slug || product.id}`;
    const productImage = product.image || product.image1 || 'https://images.unsplash.com/photo-1664786908163-85ca46f85138?crop=entropy&cs=srgb&fm=jpg&q=85';

    return (
        <Link
            to={productRoute}
            className="card-shadow-hover bg-white/90 backdrop-blur-md rounded-[20px] xs:rounded-[26px] p-2.5 xs:p-3.5 sm:p-4 md:p-5 flex flex-col relative group border border-white/90 transition-all duration-300"
        >
            {/* Top Badges / Wishlist */}
            <div className="absolute top-2.5 xs:top-3.5 sm:top-4 left-2.5 xs:left-3.5 sm:left-4 right-2.5 xs:right-3.5 sm:right-4 flex items-center justify-between z-10 pointer-events-none gap-1">
                {product.goals && product.goals.length > 0 ? (
                    <span className="text-[9px] xs:text-[10px] font-bold uppercase tracking-wider px-2 xs:px-2.5 py-0.5 xs:py-1 rounded-full bg-white/95 backdrop-blur-md text-[#1c1c21] shadow-2xs border border-black/5 pointer-events-auto max-w-[85px] xs:max-w-[110px] truncate">
                        {product.goals[0]}
                    </span>
                ) : (
                    <span className="text-[9px] xs:text-[10px] font-bold uppercase tracking-wider px-2 xs:px-2.5 py-0.5 xs:py-1 rounded-full bg-white/95 backdrop-blur-md text-[#1c1c21] shadow-2xs border border-black/5 pointer-events-auto">
                        Pure
                    </span>
                )}

                <button
                    onClick={handleWishlist}
                    className="w-7 h-7 xs:w-8 xs:h-8 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center hover:scale-115 active:scale-75 transition-transform duration-200 shadow-2xs pointer-events-auto shrink-0 touch-manipulation"
                    aria-label="Add to wishlist"
                >
                    <Heart
                        className={`w-3.5 h-3.5 xs:w-4 xs:h-4 transition-colors ${
                            isLiked
                                ? 'fill-[#e03154] text-[#e03154]'
                                : 'text-[#60606a] hover:text-[#1c1c21]'
                        }`}
                        strokeWidth={2}
                    />
                </button>
            </div>

            {/* Product Image Stage */}
            <div
                className={`${
                    compact ? 'h-32 xs:h-36 sm:h-44' : 'h-36 xs:h-44 sm:h-52'
                } flex items-center justify-center mb-2.5 sm:mb-4 rounded-[16px] xs:rounded-[20px] bg-gradient-to-b from-[#fbf5f7] to-[#f4e9ee] overflow-hidden relative`}
            >
                <img
                    src={productImage}
                    alt={product.name}
                    className="h-full w-full object-cover group-hover:scale-108 group-hover:-translate-y-1 transition-transform duration-500 ease-out"
                    loading="lazy"
                />
            </div>

            {/* Product Meta */}
            <div className="flex-1 flex flex-col justify-between">
                <div>
                    {/* Rating Bar */}
                    <div className="flex items-center gap-1 xs:gap-1.5 mb-1 xs:mb-1.5">
                        <div className="flex items-center text-amber-400">
                            <Star className="w-2.5 h-2.5 xs:w-3 xs:h-3 fill-amber-400 text-amber-400" />
                        </div>
                        <span className="text-[10px] xs:text-[11px] font-semibold text-[#1c1c21]">
                            {rating}
                        </span>
                        <span className="text-[9px] xs:text-[10px] text-[#787884]">
                            ({product.reviews?.length || 24})
                        </span>
                    </div>

                    <h3 className="font-semibold text-[13px] xs:text-[14px] sm:text-[15px] leading-tight text-[#1c1c21] group-hover:text-[#32323a] transition-colors line-clamp-1">
                        {product.name}
                    </h3>
                    <p className="text-[10px] xs:text-[11px] sm:text-[12px] text-[#70707a] mt-0.5 xs:mt-1 line-clamp-1">
                        {product.subtitle || 'Science-backed daily wellness formulation'}
                    </p>
                </div>

                {/* Price & Action */}
                <div className="flex items-center justify-between gap-1 mt-3 xs:mt-4 pt-2.5 xs:pt-3 border-t border-black/5">
                    <div className="min-w-0">
                        <div className="flex items-baseline gap-1 xs:gap-1.5 flex-wrap">
                            <span className="font-display font-bold text-[14px] xs:text-[16px] sm:text-[17px] text-[#1c1c21]">
                                ₹{Number(product.price).toFixed(2)}
                            </span>
                            {product.originalPrice && product.originalPrice > product.price && (
                                <span className="text-[10px] xs:text-[12px] text-[#9a9aa5] line-through">
                                    ₹{Number(product.originalPrice).toFixed(0)}
                                </span>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={handleAddToCart}
                        disabled={justAdded}
                        className={`h-8 xs:h-9 px-2.5 xs:px-3.5 sm:px-4 rounded-full text-[11px] xs:text-[12px] font-semibold flex items-center justify-center gap-1 transition-all hover:scale-105 active:scale-95 shadow-xs shrink-0 touch-manipulation ${
                            justAdded
                                ? 'bg-emerald-600 text-white animate-badge-pop'
                                : 'btn-dark'
                        }`}
                        aria-label={`Add ${product.name} to cart`}
                    >
                        {justAdded ? (
                            <>
                                <Check className="w-3 xs:w-3.5 h-3 xs:h-3.5" />
                                <span className="hidden xs:inline">Added</span>
                            </>
                        ) : (
                            <>
                                <Plus className="w-3 xs:w-3.5 h-3 xs:h-3.5" />
                                <span>Add</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </Link>
    );
}