// src/components/PickOfMonth.jsx
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getProducts } from '../mock';
import ProductCard from './ProductCard';

export default function PickOfMonth() {
    const [page, setPage] = useState(0);
    const [pickOfMonth, setPickOfMonth] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        getProducts({ category: 'pick_of_month' })
            .then((list) => {
                if (!cancelled) setPickOfMonth(list);
            })
            .catch(() => {
                if (!cancelled) setPickOfMonth([]);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    const perPage = 3;
    const totalPages = Math.max(1, Math.ceil(pickOfMonth.length / perPage));

    const start = page * perPage;
    const visible = pickOfMonth.slice(start, start + perPage);
    while (
        visible.length < perPage &&
        pickOfMonth.length >= perPage &&
        pickOfMonth.length > 0
    ) {
        visible.push(pickOfMonth[visible.length % pickOfMonth.length]);
    }

    const goPrev = () => setPage((p) => (p - 1 + totalPages) % totalPages);
    const goNext = () => setPage((p) => (p + 1) % totalPages);

    return (
        <section className="section-bg rounded-[36px] px-6 sm:px-10 md:px-16 py-12 md:py-20 mt-10 transition-all">
            <div className="grid grid-cols-12 gap-6 items-end">
                <div className="col-span-12 md:col-span-6">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1c1c21]/5 text-[11px] font-semibold text-[#1c1c21] mb-3">
                        <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Community Top Rated
                    </div>
                    <h2 className="font-display text-[38px] sm:text-[52px] md:text-[64px] leading-[0.95] tracking-tight text-[#1c1c21]">
                        PICK OF THE
                        <br />
                        MONTH
                    </h2>
                </div>
                <div className="col-span-12 md:col-span-6 md:pl-8 flex flex-col md:items-end gap-5">
                    <p className="text-[14px] leading-[1.6] text-[#555560] max-w-[360px] md:text-right">
                        Our highest-repurchased community favorites that provide consistent, perceptible everyday impact.
                    </p>
                    <div className="flex items-center gap-2.5 p-1 rounded-full glass-pill shadow-2xs">
                        <button
                            onClick={goPrev}
                            className="w-10 h-10 rounded-full bg-white/80 hover:bg-white text-[#1c1c21] flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-2xs"
                            aria-label="Previous page"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-xs font-semibold px-2 min-w-[42px] text-center text-[#1c1c21]">
                            {page + 1} / {totalPages}
                        </span>
                        <button
                            onClick={goNext}
                            className="w-10 h-10 rounded-full bg-white/80 hover:bg-white text-[#1c1c21] flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-2xs"
                            aria-label="Next page"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
                    {[1, 2, 3].map((n) => (
                        <div key={n} className="rounded-[26px] bg-white/70 p-4 border border-white/80">
                            <div className="h-44 rounded-[20px] skeleton-shimmer mb-4" />
                            <div className="h-4 w-3/4 rounded-full skeleton-shimmer mb-2" />
                            <div className="h-3 w-1/2 rounded-full skeleton-shimmer" />
                        </div>
                    ))}
                </div>
            ) : pickOfMonth.length === 0 ? (
                <div className="mt-10 rounded-[26px] bg-white/80 p-12 text-center border border-black/5">
                    <p className="text-sm text-[#7a7a7a]">No products available in this selection.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-7 gap-6 mt-10 items-center">
                    <div className="md:col-span-2">
                        {visible[0] && (
                            <ProductCard product={visible[0]} compact />
                        )}
                    </div>
                    <div className="md:col-span-2">
                        {visible[1] && (
                            <ProductCard product={visible[1]} compact />
                        )}
                    </div>

                    {/* Center Rotating Interactive Seal */}
                    <div className="md:col-span-1 flex justify-center py-4 md:py-0">
                        <Link
                            to="/shop"
                            className="relative w-[150px] h-[150px] group flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
                            title="View all products"
                        >
                            <svg
                                viewBox="0 0 200 200"
                                className="rotating-text w-full h-full group-hover:[animation-duration:12s]"
                            >
                                <defs>
                                    <path
                                        id="circle-path"
                                        d="M 100,100 m -75,0 a 75,75 0 1,1 150,0 a 75,75 0 1,1 -150,0"
                                    />
                                </defs>
                                <text
                                    fill="#1c1c21"
                                    fontSize="11"
                                    fontWeight="600"
                                    letterSpacing="1.8"
                                >
                                    <textPath xlinkHref="#circle-path">
                                        VIEW ALL PRODUCTS • VIEW ALL PRODUCTS •
                                    </textPath>
                                </text>
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-12 h-12 rounded-full bg-[#1c1c21] text-white flex items-center justify-center group-hover:scale-110 group-hover:bg-black transition-all shadow-md">
                                    <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" />
                                </div>
                            </div>
                        </Link>
                    </div>

                    <div className="md:col-span-2">
                        {visible[2] && (
                            <ProductCard product={visible[2]} compact />
                        )}
                    </div>
                </div>
            )}
        </section>
    );
}