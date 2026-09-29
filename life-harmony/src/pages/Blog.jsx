// src/pages/Blog.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Clock, ArrowRight, Sparkles, BookOpen } from 'lucide-react';
import { getBlogPosts } from '../mock';

const categories = ['All', 'Nutrition', 'Wellness', 'Supplements', 'Lifestyle'];

export default function Blog() {
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState('All');

    const [featured, setFeatured] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        getBlogPosts({ category, q: query })
            .then(({ featured, posts }) => {
                if (cancelled) return;
                setFeatured(featured);
                setPosts(posts);
            })
            .catch(() => {
                if (cancelled) return;
                setFeatured(null);
                setPosts([]);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [category, query]);

    // When searching or filtering by category, hide featured.
    const showFeatured = featured && !query && category === 'All';

    return (
        <div className="mt-2 space-y-8">
            {/* Header Banner */}
            <section className="relative overflow-hidden rounded-[32px] glass-panel px-6 md:px-14 py-12 md:py-16 border border-white/60 shadow-glass">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 rounded-full bg-gradient-to-br from-[#bbcffb]/30 to-[#f6d2de]/20 blur-3xl pointer-events-none" />
                
                <div className="relative z-10 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 border border-[#363636]/10 text-[11px] font-semibold uppercase tracking-wider text-[#363636] mb-4 shadow-sm">
                        <BookOpen className="w-3.5 h-3.5 text-[#363636]" />
                        <span>The Journal of Wellness</span>
                    </div>

                    <h1 className="font-display text-[42px] md:text-[68px] leading-[0.95] tracking-tight text-[#1a1a1a]">
                        THE SCIENCE & SOUL OF HARMONY
                    </h1>
                    <p className="mt-4 text-[14px] md:text-[15px] text-[#555] leading-relaxed max-w-[520px]">
                        Deep-dives into cellular nutrition, circadian health, bioavailable botanical formulations, and daily mindfulness rituals.
                    </p>

                    <div className="relative mt-8 max-w-[440px]">
                        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#888]" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search articles, ingredients, routines..."
                            className="w-full h-12 rounded-full bg-white/95 pl-11 pr-4 text-sm text-[#1a1a1a] placeholder:text-[#999] border border-[#363636]/10 shadow-sm outline-none focus:ring-2 focus:ring-[#bbcffb] focus:border-transparent transition-all"
                        />
                    </div>
                </div>
            </section>

            {/* Featured Article */}
            {showFeatured && (
                <section className="rounded-[32px] glass-panel p-6 md:p-10 border border-white/70 shadow-glass hover:shadow-card-hover transition-all duration-300">
                    <div className="grid grid-cols-12 gap-8 items-center">
                        <div className="col-span-12 md:col-span-7">
                            <div className="rounded-[24px] overflow-hidden aspect-[16/10] bg-white relative group shadow-sm">
                                <img
                                    src={featured.image}
                                    alt={featured.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                />
                                <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-medium tracking-wide">
                                    <Sparkles className="w-3 h-3 text-[#bbcffb]" />
                                    <span>Editor's Pick</span>
                                </div>
                            </div>
                        </div>
                        <div className="col-span-12 md:col-span-5 flex flex-col justify-center">
                            <div className="flex items-center gap-2">
                                <span className="px-2.5 py-1 rounded-full bg-[#bbcffb]/40 text-[#1a1a1a] text-[11px] font-semibold uppercase tracking-wider">
                                    {featured.category}
                                </span>
                            </div>

                            <h2 className="font-display text-[30px] md:text-[42px] leading-[1.05] tracking-tight mt-4 text-[#1a1a1a]">
                                {featured.title}
                            </h2>
                            <p className="mt-4 text-[14px] leading-relaxed text-[#666]">
                                {featured.excerpt}
                            </p>
                            
                            <div className="flex items-center gap-3 mt-6 text-[12px] text-[#777]">
                                <span className="font-medium text-[#444]">{featured.date}</span>
                                <span>•</span>
                                <span className="inline-flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" />
                                    {featured.readTime}
                                </span>
                            </div>

                            <Link
                                to={`/blog/${featured.id}`}
                                className="btn-dark inline-flex items-center justify-center gap-2 mt-8 px-7 h-12 rounded-full text-sm font-semibold tracking-wide w-fit shadow-md hover:shadow-lg transition-all"
                            >
                                Read article <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* Category Navigation & Article Grid */}
            <section className="space-y-6">
                <div className="flex flex-wrap items-center gap-2">
                    {categories.map((c) => (
                        <button
                            key={c}
                            onClick={() => setCategory(c)}
                            className={`px-5 h-10 rounded-full text-[13px] font-medium transition-all ${
                                category === c
                                    ? 'bg-[#1a1a1a] text-white shadow-md'
                                    : 'bg-white/80 hover:bg-white text-[#555] hover:text-[#1a1a1a] border border-[#363636]/10'
                            }`}
                        >
                            {c}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="rounded-[24px] bg-white/70 p-5 space-y-4 border border-white/80 shadow-sm">
                                <div className="aspect-[4/3] rounded-[18px] skeleton-shimmer" />
                                <div className="w-24 h-4 rounded-full skeleton-shimmer" />
                                <div className="w-full h-6 rounded-lg skeleton-shimmer" />
                                <div className="w-3/4 h-4 rounded-lg skeleton-shimmer" />
                            </div>
                        ))}
                    </div>
                ) : posts.length === 0 ? (
                    <div className="rounded-[32px] glass-panel p-16 text-center border border-white/60">
                        <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center mx-auto mb-4 text-[#888] shadow-sm">
                            <Search className="w-6 h-6" />
                        </div>
                        <h3 className="font-display text-xl text-[#1a1a1a]">No articles found</h3>
                        <p className="text-sm text-[#777] mt-2 max-w-sm mx-auto">
                            We couldn't find any articles matching "{query}". Try a different search term or category.
                        </p>
                        <button
                            onClick={() => { setQuery(''); setCategory('All'); }}
                            className="mt-6 px-6 h-10 rounded-full bg-[#1a1a1a] text-white text-xs font-semibold uppercase tracking-wider"
                        >
                            Reset filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {posts.map((p) => (
                            <Link
                                key={p.id}
                                to={`/blog/${p.id}`}
                                className="group rounded-[24px] bg-white/90 backdrop-blur-sm border border-white/80 shadow-card-hover overflow-hidden flex flex-col hover:-translate-y-1 transition-all duration-300"
                            >
                                <div className="aspect-[16/11] overflow-hidden bg-[#faf7fa] relative">
                                    <img
                                        src={p.image}
                                        alt={p.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                                    />
                                    <div className="absolute top-3 left-3">
                                        <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-semibold uppercase tracking-wider text-[#1a1a1a] shadow-sm">
                                            {p.category}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-6 flex flex-col flex-1">
                                    <h3 className="font-display text-[19px] leading-snug text-[#1a1a1a] group-hover:text-[#4264b3] transition-colors">
                                        {p.title}
                                    </h3>
                                    <p className="text-[13px] text-[#666] leading-relaxed mt-2.5 flex-1 line-clamp-3">
                                        {p.excerpt}
                                    </p>
                                    
                                    <div className="flex items-center justify-between pt-5 mt-4 border-t border-[#363636]/10 text-[12px] text-[#888]">
                                        <span>{p.date}</span>
                                        <span className="inline-flex items-center gap-1 font-medium text-[#555]">
                                            <Clock className="w-3.5 h-3.5" />
                                            {p.readTime}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}