// src/pages/Wishlist.jsx
import { useEffect, useState } from 'react';
import { Heart, ShoppingBag, ArrowRight, Sparkles, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getProducts } from '../mock';
import ProductCard from '../components/ProductCard';
import { useToast } from '../hooks/use-toast';

export default function Wishlist() {
    const { wishlist, addToCart } = useCart();
    const { toast } = useToast();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!wishlist.length) {
            setItems([]);
            return;
        }
        let cancelled = false;
        setLoading(true);
        getProducts()
            .then((all) => {
                if (cancelled) return;
                setItems(all.filter((p) => wishlist.includes(p.id)));
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [wishlist]);

    const handleAddAllToCart = () => {
        items.forEach((p) => addToCart(p, 1));
        toast({
            title: 'Moved to Cart',
            description: `Added ${items.length} item${items.length > 1 ? 's' : ''} to your cart.`,
        });
    };

    return (
        <div className="mt-2 space-y-8">
            <section className="relative overflow-hidden rounded-[24px] xs:rounded-[36px] glass-panel px-4 xs:px-6 md:px-14 py-8 xs:py-12 md:py-16 border border-white/70 shadow-glass">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 rounded-full bg-gradient-to-br from-[#f6d2de]/30 to-[#bbcffb]/20 blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-5 sm:gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-[#363636]/10 text-[10px] xs:text-[11px] font-semibold uppercase tracking-wider text-[#363636] mb-3 xs:mb-4 shadow-sm">
                            <Heart className="w-3.5 h-3.5 fill-[#f6d2de] text-[#1a1a1a]" />
                            <span>Saved Routines</span>
                        </div>
                        <h1 className="font-display text-[30px] xs:text-[42px] md:text-[68px] leading-[0.98] xs:leading-[0.95] tracking-tight text-[#1a1a1a]">
                            YOUR WISHLIST
                        </h1>
                        <p className="mt-3 xs:mt-4 text-xs xs:text-[14px] text-[#666] max-w-[440px] leading-relaxed">
                            {items.length > 0
                                ? `You have ${items.length} curated formulation${items.length !== 1 ? 's' : ''} saved for your wellness regimen.`
                                : 'Save your favorite formulas and targeted supplements here for quick access.'}
                        </p>
                    </div>

                    {items.length > 0 && (
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleAddAllToCart}
                                className="btn-dark w-full sm:w-auto justify-center px-6 h-11 rounded-full text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
                            >
                                <ShoppingBag className="w-4 h-4" />
                                <span>Add All to Cart</span>
                            </button>
                        </div>
                    )}
                </div>
            </section>

            <section>
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 xs:gap-4 md:gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="rounded-[20px] xs:rounded-[24px] bg-white/70 p-3 xs:p-4 space-y-3 border border-white/80">
                                <div className="aspect-square rounded-xl xs:rounded-2xl skeleton-shimmer" />
                                <div className="w-3/4 h-3.5 rounded-lg skeleton-shimmer" />
                                <div className="w-1/2 h-3.5 rounded-lg skeleton-shimmer" />
                            </div>
                        ))}
                    </div>
                ) : items.length === 0 ? (
                    <div className="rounded-[24px] xs:rounded-[36px] glass-panel p-8 xs:p-16 text-center border border-white/70 shadow-glass">
                        <div className="w-16 h-16 xs:w-20 xs:h-20 rounded-full bg-white/90 border border-white/80 flex items-center justify-center mx-auto mb-4 xs:mb-5 text-[#888] shadow-md">
                            <Heart className="w-8 h-8 xs:w-9 xs:h-9 text-[#888]" strokeWidth={1.5} />
                        </div>
                        <h3 className="font-display text-[22px] xs:text-[26px] text-[#1a1a1a]">Your wishlist is currently empty</h3>
                        <p className="text-xs xs:text-sm text-[#777] max-w-sm mx-auto mt-2 leading-relaxed">
                            Explore our apothecary of targeted formulas and tap the heart icon on any product to save it here.
                        </p>
                        <Link
                            to="/shop"
                            className="btn-dark inline-flex items-center gap-2 mt-6 xs:mt-8 px-6 xs:px-8 h-11 xs:h-12 rounded-full text-xs font-semibold uppercase tracking-wider shadow-md hover:shadow-lg transition-all"
                        >
                            Browse All Formulas <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 xs:gap-4 md:gap-6">
                        {items.map((p) => (
                            <ProductCard key={p.id} product={p} />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}