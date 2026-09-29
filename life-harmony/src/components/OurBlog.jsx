// src/components/OurBlog.jsx
import { ArrowRight, BookOpen, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { blogImages } from '../mock';

export default function OurBlog() {
    return (
        <section className="section-bg rounded-[36px] px-6 sm:px-10 md:px-16 py-12 md:py-20 mt-10 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1c1c21]/5 text-[11px] font-semibold text-[#1c1c21] mb-3">
                        <BookOpen className="w-3 h-3 text-[#1c1c21]" /> Editorial &amp; Science Insights
                    </div>
                    <h2 className="font-display text-[38px] sm:text-[52px] md:text-[64px] leading-[0.95] tracking-tight text-[#1c1c21]">
                        OUR JOURNAL
                    </h2>
                </div>
                <Link
                    to="/blog"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#1c1c21] hover:underline group"
                >
                    <span>Read all journal articles</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            <div className="grid grid-cols-12 gap-5 md:gap-6 mt-10 items-stretch">
                {/* Story 1: Citrus Card */}
                <Link
                    to="/blog"
                    className="col-span-12 sm:col-span-6 md:col-span-3 group block"
                >
                    <div className="rounded-[24px] overflow-hidden aspect-[3/4] bg-white relative shadow-sm border border-white/80">
                        <img
                            src={blogImages.citrus}
                            alt="Citrus flat lay"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3">
                            <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-[#1c1c21]">
                                Nutrition
                            </span>
                        </div>
                    </div>
                    <h4 className="font-semibold text-sm sm:text-base mt-3 group-hover:text-slate-600 transition-colors">
                        Seasonal Micronutrients: Optimizing Daily Vitamin C &amp; Zinc
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-[#70707a] mt-1.5">
                        <Clock className="w-3 h-3" />
                        <span>4 min read</span>
                    </div>
                </Link>

                {/* Story 2: Featured Portrait Center */}
                <Link
                    to="/blog"
                    className="col-span-12 sm:col-span-6 md:col-span-4 group relative block"
                >
                    <div className="rounded-[24px] overflow-hidden aspect-[3/4] bg-white relative shadow-sm border border-white/80">
                        <img
                            src={blogImages.woman}
                            alt="Radiant woman"
                            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3">
                            <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-[#1c1c21]">
                                Longevity
                            </span>
                        </div>
                        {/* Elegant Corner Accent Overlay */}
                        <div className="absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-black/75 via-black/35 to-transparent text-white">
                            <h4 className="font-display text-lg sm:text-xl leading-tight font-bold">
                                The Cellular Aging Protocol: How NAD+ &amp; D3 Protect DNA
                            </h4>
                            <p className="text-xs text-white/80 mt-1">
                                Clinical researcher Dr. Elena Vance breaks down new longevity data.
                            </p>
                        </div>
                    </div>
                </Link>

                {/* Story 3: Text & Value Manifesto */}
                <div className="col-span-12 sm:col-span-7 md:col-span-3 flex flex-col justify-between p-6 rounded-[24px] bg-white/80 backdrop-blur-md border border-white/80 shadow-xs">
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#80808a]">
                            About the journal
                        </span>
                        <h3 className="font-display text-[20px] font-bold leading-tight text-[#1c1c21] mt-2">
                            Evidence Over Hype. Real Biochemistry.
                        </h3>
                        <p className="text-[13px] leading-[1.65] text-[#555560] mt-3">
                            Stay informed with peer-reviewed research, nutritional science breakdowns, and real bioavailability testing insights written by biochemistry experts.
                        </p>
                    </div>

                    <div className="pt-4 border-t border-black/5 mt-4">
                        <Link
                            to="/blog"
                            className="btn-dark w-full h-10 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5"
                        >
                            <span>Browse All Articles</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>

                {/* Story 4: Pills Texture Card */}
                <Link
                    to="/blog"
                    className="col-span-12 sm:col-span-5 md:col-span-2 group block"
                >
                    <div className="rounded-[24px] overflow-hidden aspect-square sm:aspect-auto sm:h-full bg-gradient-to-br from-[#c8e6d9] to-[#b0d9c5] relative shadow-sm">
                        <img
                            src={blogImages.pills}
                            alt="Clean Capsules"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 mix-blend-multiply opacity-90"
                        />
                        <div className="absolute inset-0 p-4 flex flex-col justify-between bg-black/10">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#1c1c21] bg-white/80 backdrop-blur-md px-2 py-0.5 rounded-full self-start">
                                Clean Label
                            </span>
                            <span className="text-xs font-bold text-[#1c1c21] group-hover:underline">
                                Plantgel vs Gelatin &rarr;
                            </span>
                        </div>
                    </div>
                </Link>
            </div>
        </section>
    );
}