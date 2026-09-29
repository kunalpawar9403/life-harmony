// src/components/ProductCard.jsx
import { useState } from 'react';
import { Heart, Star, Check, Plus, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../hooks/use-toast';

export default function ProductCard({ product, compact = false }) {
    const { toast } = useToast();
    const { addToCart, wishlist, toggleWishlist, setDrawerOpen } = useCart();
    const [justAdded, setJustAdded] = useState(false);
    const isLiked = wishlist.includes(product.id);

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
            await toggleWishlist(product.id);
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
        <Link
            to={`/product/${product.id}`}
            className="card-shadow-hover bg-white/90 backdrop-blur-md rounded-[26px] p-3.5 sm:p-4 md:p-5 flex flex-col relative group border border-white/90 transition-all duration-300"
        >
            {/* Top Badges / Wishlist */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10 pointer-events-none">
                {product.goals && product.goals.length > 0 ? (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[#1c1c21] shadow-xs border border-black/5 pointer-events-auto">
                        {product.goals[0]}
                    </span>
                ) : (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[#1c1c21] shadow-xs border border-black/5 pointer-events-auto">
                        Pure Formula
                    </span>
                )}

                <button
                    onClick={handleWishlist}
                    className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center hover:scale-115 active:scale-75 transition-transform duration-200 shadow-xs pointer-events-auto"
                    aria-label="Add to wishlist"
                >
                    <Heart
                        className={`w-4 h-4 transition-colors ${
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
                    compact ? 'h-36 sm:h-44' : 'h-44 sm:h-52'
                } flex items-center justify-center mb-3 sm:mb-4 rounded-[20px] bg-gradient-to-b from-[#fbf5f7] to-[#f4e9ee] overflow-hidden relative`}
            >
                <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover group-hover:scale-108 group-hover:-translate-y-1 transition-transform duration-500 ease-out"
                    loading="lazy"
                />
            </div>

            {/* Product Meta */}
            <div className="flex-1 flex flex-col justify-between">
                <div>
                    {/* Rating Bar */}
                    <div className="flex items-center gap-1.5 mb-1.5">
                        <div className="flex items-center text-amber-400">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        </div>
                        <span className="text-[11px] font-semibold text-[#1c1c21]">
                            {rating}
                        </span>
                        <span className="text-[10px] text-[#787884]">
                            ({product.reviews?.length || 24})
                        </span>
                    </div>

                    <h3 className="font-semibold text-[14px] sm:text-[15px] leading-tight text-[#1c1c21] group-hover:text-[#32323a] transition-colors">
                        {product.name}
                    </h3>
                    <p className="text-[11px] sm:text-[12px] text-[#70707a] mt-1 line-clamp-1">
                        {product.subtitle || 'Science-backed daily wellness formulation'}
                    </p>
                </div>

                {/* Price & Action */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-black/5">
                    <div>
                        <div className="flex items-baseline gap-1.5">
                            <span className="font-display font-bold text-[16px] sm:text-[17px] text-[#1c1c21]">
                                ₹{Number(product.price).toFixed(2)}
                            </span>
                            {product.originalPrice && product.originalPrice > product.price && (
                                <span className="text-[12px] text-[#9a9aa5] line-through">
                                    ₹{Number(product.originalPrice).toFixed(2)}
                                </span>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={handleAddToCart}
                        disabled={justAdded}
                        className={`h-9 px-3.5 sm:px-4 rounded-full text-[12px] font-semibold flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 shadow-xs ${
                            justAdded
                                ? 'bg-emerald-600 text-white animate-badge-pop'
                                : 'btn-dark'
                        }`}
                        aria-label={`Add ${product.name} to cart`}
                    >
                        {justAdded ? (
                            <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Added</span>
                            </>
                        ) : (
                            <>
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </Link>
    );
}