import { X, Heart, ShoppingBag, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

export function Toaster() {
    const { toasts } = useToast();

    return (
        <div 
            aria-live="polite"
            className="fixed bottom-20 sm:bottom-6 right-3 sm:right-6 left-3 sm:left-auto z-[120] flex max-h-screen flex-col-reverse gap-2.5 pointer-events-none sm:max-w-[390px]"
        >
            {toasts.map((t) => (
                <ToastItem key={t.id} {...t} />
            ))}
        </div>
    );
}

function ToastItem({ id, title, description, open, onOpenChange }) {
    if (!open) return null;

    const lowerTitle = (title || '').toLowerCase();
    const isWishlist = lowerTitle.includes('wishlist') || lowerTitle.includes('saved');
    const isCart = lowerTitle.includes('cart');

    return (
        <div className="pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-[20px] border border-white/80 bg-white/95 backdrop-blur-xl p-3.5 sm:p-4 shadow-xl transition-all animate-in slide-in-from-bottom-4 duration-300">
            {/* Visual Icon Badge */}
            <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
                    isWishlist
                        ? 'bg-[#ffebee] text-[#e03154]'
                        : isCart
                        ? 'bg-[#e8f1ff] text-[#1c1c21]'
                        : 'bg-[#ecfdf5] text-emerald-600'
                }`}
            >
                {isWishlist ? (
                    <Heart className="w-4 h-4 fill-current" />
                ) : isCart ? (
                    <ShoppingBag className="w-4 h-4" />
                ) : (
                    <CheckCircle2 className="w-4 h-4" />
                )}
            </div>

            <div className="flex-1 min-w-0 pr-4">
                {title && (
                    <h5 className="text-[13px] font-bold text-[#1c1c21] tracking-tight leading-snug">
                        {title}
                    </h5>
                )}
                {description && (
                    <p className="text-[12px] text-[#60606a] mt-0.5 leading-relaxed line-clamp-2">
                        {description}
                    </p>
                )}
            </div>

            <button
                onClick={() => onOpenChange?.(false)}
                className="absolute right-2.5 top-2.5 rounded-full p-1.5 text-[#888894] hover:text-[#1c1c21] hover:bg-black/5 active:scale-90 transition-all touch-manipulation"
                aria-label="Close notification"
            >
                <X className="h-3.5 w-3.5" />
            </button>
        </div>
    );
}