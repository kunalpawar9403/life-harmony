// src/pages/BlogPost.jsx
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Clock, Calendar, Share2, Sparkles, CheckCircle2 } from 'lucide-react';
import { getBlogPost } from '../mock';
import { useToast } from '../hooks/use-toast';

export default function BlogPost() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [post, setPost] = useState(null); // null=loading, undefined=not found
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        getBlogPost(id)
            .then((p) => {
                if (!cancelled) setPost(p);
            })
            .catch(() => {
                if (!cancelled) setPost(undefined);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [id]);

    const handleShare = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(window.location.href);
            toast({
                title: 'Link copied',
                description: 'Article link copied to clipboard.',
            });
        }
    };

    if (loading) {
        return (
            <div className="rounded-[32px] glass-panel p-16 text-center mt-2 border border-white/60 space-y-4">
                <div className="w-1/3 h-8 mx-auto rounded-lg skeleton-shimmer" />
                <div className="w-2/3 h-12 mx-auto rounded-xl skeleton-shimmer" />
                <div className="aspect-[16/9] max-w-3xl mx-auto rounded-2xl skeleton-shimmer" />
            </div>
        );
    }

    if (!post) {
        return (
            <div className="rounded-[32px] glass-panel p-16 text-center mt-2 border border-white/60">
                <h2 className="font-display text-3xl text-[#1a1a1a]">Article not found</h2>
                <p className="text-sm text-[#777] mt-2">The article you requested could not be located.</p>
                <button
                    onClick={() => navigate('/blog')}
                    className="btn-dark mt-6 px-7 h-11 rounded-full text-sm font-semibold tracking-wide"
                >
                    Back to blog
                </button>
            </div>
        );
    }

    return (
        <div className="mt-2 space-y-6">
            {/* Breadcrumb / Top Bar */}
            <div className="flex items-center justify-between text-sm">
                <Link
                    to="/blog"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full glass-pill text-[#555] hover:text-[#1a1a1a] transition-all hover:-translate-x-0.5"
                >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="font-medium text-[13px]">Back to Journal</span>
                </Link>

                <button
                    onClick={handleShare}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-pill text-[#555] hover:text-[#1a1a1a] transition-all text-[13px] font-medium"
                >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share article</span>
                </button>
            </div>

            {/* Main Article Container */}
            <article className="rounded-[24px] xs:rounded-[36px] glass-panel px-4 xs:px-6 md:px-16 py-8 xs:py-12 md:py-16 border border-white/70 shadow-glass">
                <div className="max-w-3xl mx-auto">
                    {/* Category & Badge */}
                    <div className="flex items-center gap-3">
                        <span className="px-3 py-1 rounded-full bg-[#bbcffb]/50 text-[#1a1a1a] text-[10px] xs:text-[11px] font-bold uppercase tracking-wider">
                            {post.category}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] xs:text-[11px] font-medium text-[#777]">
                            <Sparkles className="w-3 h-3 text-[#f6d2de]" /> Verified Editorial
                        </span>
                    </div>

                    {/* Title */}
                    <h1 className="font-display text-[26px] xs:text-[36px] md:text-[56px] leading-[1.08] xs:leading-[1.05] tracking-tight mt-4 xs:mt-5 text-[#1a1a1a]">
                        {post.title}
                    </h1>

                    {/* Metadata Strip */}
                    <div className="flex flex-wrap items-center gap-4 mt-6 pb-8 border-b border-[#363636]/10 text-[13px] text-[#777]">
                        <span className="inline-flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-[#555]" />
                            {post.date}
                        </span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-[#555]" />
                            {post.readTime}
                        </span>
                        <span>•</span>
                        <span className="text-[#444] font-medium">Life Harmony Medical & Science Board</span>
                    </div>

                    {/* Hero Image */}
                    <div className="rounded-[28px] overflow-hidden aspect-[16/9] bg-white my-10 shadow-md">
                        <img
                            src={post.image}
                            alt={post.title}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Key takeaways callout box */}
                    <div className="my-8 p-6 md:p-8 rounded-[24px] bg-white/80 border border-[#bbcffb]/60 shadow-sm">
                        <h4 className="font-display text-[16px] text-[#1a1a1a] mb-3 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-[#4264b3]" />
                            Key Takeaways
                        </h4>
                        <ul className="space-y-2 text-[14px] text-[#555] leading-relaxed">
                            <li>• Formulations with bioavailable piperine increase absorption by up to 2,000%.</li>
                            <li>• Circadian nutrient timing amplifies metabolic receptor uptake.</li>
                            <li>• 3rd-party independent lab testing guarantees absence of heavy metals.</li>
                        </ul>
                    </div>

                    {/* Body Content */}
                    <div className="space-y-6 text-[16px] leading-[1.8] text-[#333]">
                        {(post.content || []).map((para, i) => (
                            <p
                                key={i}
                                className={i === 0 ? 'text-[18px] md:text-[20px] font-light leading-relaxed text-[#222]' : ''}
                            >
                                {para}
                            </p>
                        ))}
                    </div>

                    {/* Bottom Author Bio & CTA */}
                    <div className="mt-14 pt-10 border-t border-[#363636]/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-[#1a1a1a] text-white flex items-center justify-center font-display text-lg">
                                LH
                            </div>
                            <div>
                                <div className="font-semibold text-[14px] text-[#1a1a1a]">Life Harmony Research Team</div>
                                <div className="text-[12px] text-[#777]">Peer-reviewed nutritional and lifestyle science</div>
                            </div>
                        </div>

                        <Link
                            to="/shop"
                            className="btn-dark px-6 h-11 rounded-full text-xs font-semibold uppercase tracking-wider inline-flex items-center"
                        >
                            Explore related formulas
                        </Link>
                    </div>
                </div>
            </article>
        </div>
    );
}