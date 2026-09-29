// src/components/NewArrivals.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { getProducts, getGoals } from '../mock';
import ProductCard from './ProductCard';

export default function NewArrivals() {
    const [tab, setTab] = useState('supplements');
    const [activeGoal, setActiveGoal] = useState('all');

    const [goals, setGoals] = useState([{ id: 'all', label: 'All' }]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getGoals().then(setGoals).catch(() => { });
    }, []);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        getProducts({ category: tab, goal: activeGoal })
            .then((list) => {
                if (!cancelled) setProducts(list);
            })
            .catch(() => {
                if (!cancelled) setProducts([]);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [tab, activeGoal]);

    return (
        <section
            id="products"
            className="section-bg rounded-[36px] px-6 sm:px-10 md:px-16 py-12 md:py-20 mt-10 transition-all"
        >
            <div className="grid grid-cols-12 gap-6 items-end">
                <div className="col-span-12 md:col-span-5">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1c1c21]/5 text-[11px] font-semibold text-[#1c1c21] mb-3">
                        <Sparkles className="w-3 h-3 text-[#1c1c21]" /> Fresh Batch Releases
                    </div>
                    <h2 className="font-display text-[38px] sm:text-[52px] md:text-[64px] leading-[0.95] tracking-tight text-[#1c1c21]">
                        NEW ARRIVALS
                    </h2>
                    <p className="mt-4 max-w-[380px] text-[15px] font-medium text-[#50505a]">
                        Targeted nutritional excellence to nourish your daily baseline.
                    </p>
                </div>

                <div className="col-span-12 md:col-span-7 flex flex-col justify-between">
                    {/* Category Switcher Tabs */}
                    <div className="flex items-center gap-2 p-1.5 rounded-full glass-pill self-start md:self-end shadow-xs">
                        <button
                            onClick={() => setTab('vitamins')}
                            className={`px-5 h-9 sm:h-10 rounded-full text-[13px] font-semibold transition-all duration-200 ${
                                tab === 'vitamins'
                                    ? 'bg-[#1c1c21] text-white shadow-sm'
                                    : 'text-[#60606a] hover:text-[#1c1c21]'
                            }`}
                        >
                            Vitamins
                        </button>
                        <button
                            onClick={() => setTab('supplements')}
                            className={`px-5 h-9 sm:h-10 rounded-full text-[13px] font-semibold transition-all duration-200 ${
                                tab === 'supplements'
                                    ? 'bg-[#1c1c21] text-white shadow-sm'
                                    : 'text-[#60606a] hover:text-[#1c1c21]'
                            }`}
                        >
                            Dietary Supplements
                        </button>
                    </div>

                    <div className="mt-6 md:text-right">
                        <p className="text-[13px] leading-[1.65] max-w-[420px] text-[#656570] md:ml-auto">
                            Strengthen immunity, elevate cellular energy, and sustain mental focus with zero artificial compromises.
                        </p>
                        <div className="mt-3">
                            <Link
                                to="/shop"
                                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#1c1c21] hover:opacity-75 transition-opacity group"
                            >
                                <span>Explore all products</span>
                                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Goal Filter Chips */}
            <div className="mt-8 pt-6 border-t border-black/5 flex flex-wrap items-center gap-2">
                <span className="text-[11px] uppercase tracking-wider font-bold text-[#80808a] mr-2">
                    Filter by goal:
                </span>
                {goals.map((g) => (
                    <button
                        key={g.id}
                        onClick={() => setActiveGoal(g.id)}
                        className={`px-3.5 h-8 rounded-full text-[12px] font-semibold transition-all duration-200 ${
                            activeGoal === g.id
                                ? 'bg-[#1c1c21] text-white shadow-xs'
                                : 'bg-white/80 hover:bg-white text-[#454550] border border-black/5 hover:border-black/15 shadow-2xs'
                        }`}
                    >
                        {g.label}
                    </button>
                ))}
            </div>

            {/* Product Grid or Skeleton Loader */}
            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-8">
                    {[1, 2, 3, 4].map((n) => (
                        <div key={n} className="rounded-[26px] bg-white/70 p-4 border border-white/80">
                            <div className="h-44 rounded-[20px] skeleton-shimmer mb-4" />
                            <div className="h-4 w-3/4 rounded-full skeleton-shimmer mb-2" />
                            <div className="h-3 w-1/2 rounded-full skeleton-shimmer mb-4" />
                            <div className="h-8 w-full rounded-full skeleton-shimmer" />
                        </div>
                    ))}
                </div>
            ) : products.length === 0 ? (
                <div className="mt-10 rounded-[26px] bg-white/80 backdrop-blur-md p-12 text-center border border-black/5">
                    <p className="text-sm font-medium text-[#60606a]">
                        No products match this goal yet.
                    </p>
                    <button
                        onClick={() => {
                            setActiveGoal('all');
                            setTab('supplements');
                        }}
                        className="btn-dark mt-4 px-5 h-9 rounded-full text-xs font-semibold"
                    >
                        Reset filters
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-8">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </section>
    );
}