// src/pages/Shop.jsx
import { useEffect, useState } from 'react';
import { Search, SlidersHorizontal, X, ArrowUpDown, Sparkles } from 'lucide-react';
import { getProducts, getGoals } from '../mock';
import ProductCard from '../components/ProductCard';

const sortOptions = [
    { id: 'featured', label: 'Featured' },
    { id: 'price-asc', label: 'Price: Low to High' },
    { id: 'price-desc', label: 'Price: High to Low' },
    { id: 'name', label: 'Name A–Z' },
];

export default function Shop() {
    const [query, setQuery] = useState('');
    const [activeGoal, setActiveGoal] = useState('all');
    const [sort, setSort] = useState('featured');
    const [maxPrice, setMaxPrice] = useState(3000);
    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

    const [goals, setGoals] = useState([{ id: 'all', label: 'All' }]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getGoals().then(setGoals).catch(() => { });
    }, []);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        getProducts({ goal: activeGoal, q: query, maxPrice, sort })
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
    }, [query, activeGoal, sort, maxPrice]);

    const activeGoalLabel = goals.find((g) => g.id === activeGoal)?.label || activeGoal;
    const hasActiveFilters = query || activeGoal !== 'all' || maxPrice < 3000 || sort !== 'featured';

    const handleResetFilters = () => {
        setQuery('');
        setActiveGoal('all');
        setSort('featured');
        setMaxPrice(3000);
    };

    return (
        <div className="mt-2">
            {/* Header Hero Banner */}
            <section className="section-bg rounded-[36px] px-6 sm:px-10 md:px-16 py-10 md:py-14 transition-all">
                <div className="max-w-2xl">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1c1c21]/5 text-[11px] font-semibold text-[#1c1c21] mb-3">
                        <Sparkles className="w-3.5 h-3.5 text-[#1c1c21]" /> Complete Catalog
                    </div>
                    <h1 className="font-display text-[40px] sm:text-[52px] md:text-[64px] leading-[0.95] tracking-tight text-[#1c1c21]">
                        SHOP ALL
                    </h1>
                    <p className="mt-3 text-[14px] text-[#5b5b66] leading-relaxed">
                        Pure bioavailable supplements tested for verified potency and rapid cellular absorption. Filter by your personal vitality goals.
                    </p>
                </div>
            </section>

            {/* Mobile Filter Toggle & Summary Bar */}
            <div className="mt-6 md:hidden flex items-center justify-between gap-3 px-1">
                <button
                    onClick={() => setMobileFilterOpen(true)}
                    className="flex-1 h-11 rounded-full glass-pill flex items-center justify-center gap-2 text-xs font-semibold text-[#1c1c21] shadow-2xs"
                >
                    <SlidersHorizontal className="w-4 h-4" />
                    <span>Filter &amp; Sort {hasActiveFilters ? '• Active' : ''}</span>
                </button>
                <div className="text-xs font-semibold text-[#70707a] px-3">
                    {loading ? 'Searching...' : `${products.length} Items`}
                </div>
            </div>

            {/* Main Content Layout */}
            <section className="mt-6 md:mt-8 grid grid-cols-12 gap-6 items-start">
                {/* Desktop Sticky Sidebar */}
                <aside className="hidden md:block col-span-12 md:col-span-3">
                    <div className="section-bg rounded-[28px] p-6 sticky top-6 shadow-sm border border-white/80 space-y-6">
                        <div className="flex items-center justify-between border-b border-black/5 pb-3">
                            <div className="flex items-center gap-2">
                                <SlidersHorizontal className="w-4 h-4 text-[#1c1c21]" />
                                <h3 className="font-bold text-sm text-[#1c1c21]">Filters</h3>
                            </div>
                            {hasActiveFilters && (
                                <button
                                    onClick={handleResetFilters}
                                    className="text-[11px] font-semibold text-slate-500 hover:text-[#1c1c21] underline"
                                >
                                    Clear all
                                </button>
                            )}
                        </div>

                        {/* Search Input */}
                        <div>
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9a9aa5]" />
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search formulas..."
                                    className="w-full h-10 rounded-full bg-white/90 pl-10 pr-4 text-xs font-medium outline-none border border-black/5 focus:border-[#1c1c21] focus:ring-1 focus:ring-[#1c1c21] transition-all"
                                />
                                {query && (
                                    <button
                                        onClick={() => setQuery('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Goal Pills */}
                        <div>
                            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#80808a] mb-2.5">
                                Health Goal
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                                {goals.map((g) => (
                                    <button
                                        key={g.id}
                                        onClick={() => setActiveGoal(g.id)}
                                        className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all ${
                                            activeGoal === g.id
                                                ? 'bg-[#1c1c21] text-white shadow-xs'
                                                : 'bg-white/80 hover:bg-white text-[#454550] border border-black/5 hover:border-black/15'
                                        }`}
                                    >
                                        {g.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Max Price Slider */}
                        <div>
                            <div className="flex justify-between items-baseline mb-2">
                                <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#80808a]">
                                    Max Price
                                </h4>
                                <span className="text-xs font-bold text-[#1c1c21]">
                                    ₹{maxPrice}
                                </span>
                            </div>
                            <input
                                type="range"
                                min="500"
                                max="3000"
                                step="100"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(Number(e.target.value))}
                                className="w-full accent-[#1c1c21] cursor-pointer"
                            />
                            <div className="flex justify-between text-[10px] text-[#90909a] mt-1">
                                <span>₹500</span>
                                <span>₹3,000</span>
                            </div>
                        </div>

                        {/* Sort Dropdown */}
                        <div>
                            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#80808a] mb-2">
                                Sort By
                            </h4>
                            <select
                                value={sort}
                                onChange={(e) => setSort(e.target.value)}
                                className="w-full h-10 rounded-full bg-white/90 px-4 text-xs font-medium outline-none border border-black/5 focus:border-[#1c1c21] cursor-pointer"
                            >
                                {sortOptions.map((o) => (
                                    <option key={o.id} value={o.id}>
                                        {o.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </aside>

                {/* Products Grid Area */}
                <div className="col-span-12 md:col-span-9">
                    {/* Active Filter Chips Strip */}
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-5 px-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-semibold text-[#70707a]">
                                Showing <strong className="text-[#1c1c21]">{products.length}</strong> products
                            </span>

                            {activeGoal !== 'all' && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-black/5 text-xs font-medium text-[#1c1c21]">
                                    <span>Goal: {activeGoalLabel}</span>
                                    <button onClick={() => setActiveGoal('all')}>
                                        <X className="w-3 h-3 text-slate-400 hover:text-black" />
                                    </button>
                                </span>
                            )}

                            {query && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-black/5 text-xs font-medium text-[#1c1c21]">
                                    <span>"{query}"</span>
                                    <button onClick={() => setQuery('')}>
                                        <X className="w-3 h-3 text-slate-400 hover:text-black" />
                                    </button>
                                </span>
                            )}

                            {maxPrice < 3000 && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-black/5 text-xs font-medium text-[#1c1c21]">
                                    <span>Under ₹{maxPrice}</span>
                                    <button onClick={() => setMaxPrice(3000)}>
                                        <X className="w-3 h-3 text-slate-400 hover:text-black" />
                                    </button>
                                </span>
                            )}
                        </div>

                        {/* Desktop Sort Quick Select */}
                        <div className="hidden sm:flex items-center gap-2">
                            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                            <select
                                value={sort}
                                onChange={(e) => setSort(e.target.value)}
                                className="h-9 px-3 rounded-full bg-white/80 border border-black/5 text-xs font-medium outline-none text-[#1c1c21] cursor-pointer"
                            >
                                {sortOptions.map((o) => (
                                    <option key={o.id} value={o.id}>
                                        {o.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Products Grid or Skeleton Shimmers */}
                    {loading ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                            {[1, 2, 3, 4, 5, 6].map((n) => (
                                <div key={n} className="rounded-[26px] bg-white/70 p-4 border border-white/80">
                                    <div className="h-48 rounded-[20px] skeleton-shimmer mb-4" />
                                    <div className="h-4 w-3/4 rounded-full skeleton-shimmer mb-2" />
                                    <div className="h-3 w-1/2 rounded-full skeleton-shimmer mb-4" />
                                    <div className="h-9 w-full rounded-full skeleton-shimmer" />
                                </div>
                            ))}
                        </div>
                    ) : products.length === 0 ? (
                        <div className="rounded-[32px] bg-white/80 backdrop-blur-md p-14 text-center border border-black/5">
                            <h3 className="font-display text-xl font-bold text-[#1c1c21] mb-2">
                                No products match your criteria
                            </h3>
                            <p className="text-xs text-[#70707a] max-w-sm mx-auto mb-6">
                                Try widening your price range, searching for another ingredient, or choosing a different wellness goal.
                            </p>
                            <button
                                onClick={handleResetFilters}
                                className="btn-dark px-6 h-10 rounded-full text-xs font-semibold"
                            >
                                Reset all filters
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                            {products.map((p) => (
                                <ProductCard key={p.id} product={p} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Mobile Filter Modal Sheet */}
            {mobileFilterOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs p-0 sm:p-4">
                    <div className="w-full sm:max-w-md bg-white rounded-t-[32px] sm:rounded-[32px] p-6 max-h-[85vh] overflow-y-auto space-y-6 shadow-2xl animate-in slide-in-from-bottom-5 duration-200">
                        <div className="flex items-center justify-between pb-3 border-b border-black/5">
                            <h3 className="font-display text-lg font-bold text-[#1c1c21]">Filters &amp; Sort</h3>
                            <button
                                onClick={() => setMobileFilterOpen(false)}
                                className="p-1 rounded-full hover:bg-black/5 text-slate-500"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Search */}
                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-[#80808a] block mb-2">Search</label>
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search products..."
                                className="w-full h-11 rounded-full bg-[#f6edf2] px-4 text-sm outline-none"
                            />
                        </div>

                        {/* Goals */}
                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-[#80808a] block mb-2">Goal</label>
                            <div className="flex flex-wrap gap-2">
                                {goals.map((g) => (
                                    <button
                                        key={g.id}
                                        onClick={() => setActiveGoal(g.id)}
                                        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold ${
                                            activeGoal === g.id
                                                ? 'bg-[#1c1c21] text-white'
                                                : 'bg-[#f6edf2] text-[#40404a]'
                                        }`}
                                    >
                                        {g.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Price */}
                        <div>
                            <div className="flex justify-between items-baseline mb-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-[#80808a]">Max Price</label>
                                <span className="text-sm font-bold text-[#1c1c21]">₹{maxPrice}</span>
                            </div>
                            <input
                                type="range"
                                min="500"
                                max="3000"
                                step="100"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(Number(e.target.value))}
                                className="w-full accent-[#1c1c21]"
                            />
                        </div>

                        {/* Sort */}
                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-[#80808a] block mb-2">Sort</label>
                            <select
                                value={sort}
                                onChange={(e) => setSort(e.target.value)}
                                className="w-full h-11 rounded-full bg-[#f6edf2] px-4 text-sm outline-none"
                            >
                                {sortOptions.map((o) => (
                                    <option key={o.id} value={o.id}>
                                        {o.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="pt-2 flex gap-3">
                            <button
                                onClick={handleResetFilters}
                                className="flex-1 h-12 rounded-full border border-black/10 text-xs font-semibold text-[#1c1c21]"
                            >
                                Reset
                            </button>
                            <button
                                onClick={() => setMobileFilterOpen(false)}
                                className="flex-2 btn-dark h-12 rounded-full text-xs font-semibold"
                            >
                                View {products.length} Results
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}