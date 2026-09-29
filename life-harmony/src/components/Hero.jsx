import { useState } from 'react';
import { ArrowRight, Star, ShieldCheck, Sparkles, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { heroProduct } from '../mock';

export default function Hero() {
    const [tilt, setTilt] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        setTilt({ x: x * 12, y: y * -12 });
    };

    const handleMouseLeave = () => {
        setTilt({ x: 0, y: 0 });
    };

    return (
        <section className="hero-bg rounded-[30px] sm:rounded-[36px] px-6 sm:px-8 lg:px-12 pt-5 sm:pt-7 pb-6 sm:pb-8 relative overflow-hidden transition-all animate-fade-up">
            {/* Top Subtle Status Badge */}
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 backdrop-blur-md border border-white/80 text-[11px] sm:text-[12px] font-semibold text-[#1c1c21] shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Clinically Validated Daily Formulations
                </span>
                <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1c1c21]/5 text-[11px] font-medium text-[#4a4a52]">
                    <Sparkles className="w-3 h-3 text-[#1c1c21]" /> Clean Label Certified
                </span>
            </div>

            {/* Main Headline */}
            <div className="max-w-4xl">
                <h1 className="font-display text-[32px] sm:text-[44px] md:text-[52px] lg:text-[62px] leading-[0.95] tracking-tight text-[#1c1c21]">
                    HEALTHCARE.<br className="hidden md:inline" />{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1c1c21] via-[#3a3542] to-[#605567]">
                        REAL RESULTS.
                    </span>
                </h1>
            </div>

            <div className="grid grid-cols-12 gap-6 lg:gap-8 mt-4 sm:mt-6 items-center">
                {/* Left column */}
                <div className="col-span-12 md:col-span-4 flex flex-col justify-between order-2 md:order-1">
                    <p className="text-[13px] sm:text-[14px] leading-[1.6] text-[#42424b] font-medium max-w-sm">
                        Take the step towards a healthier, more vibrant life. Clean, bioavailable ingredients designed by physicians to fuel your body with absolute confidence.
                    </p>

                    <div className="mt-5 sm:mt-6 space-y-4">
                        <div className="flex flex-wrap items-center gap-2.5">
                            <Link
                                to="/shop"
                                className="btn-dark btn-shine inline-flex items-center gap-2.5 pl-5 pr-2 h-11 sm:h-12 rounded-full text-xs sm:text-sm font-semibold group shadow-md"
                            >
                                Shop collection
                                <span className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center group-hover:translate-x-1.5 transition-transform">
                                    <ArrowRight className="w-3.5 h-3.5 text-white" />
                                </span>
                            </Link>
                            <Link
                                to="/about"
                                className="px-4 sm:px-5 h-11 sm:h-12 rounded-full glass-pill text-xs sm:text-sm font-semibold text-[#1c1c21] hover:bg-white flex items-center transition-all hover:scale-105 active:scale-95"
                            >
                                Our Science
                            </Link>
                        </div>

                        {/* Customer rating snippet */}
                        <div className="pt-3 border-t border-black/5 flex items-center gap-3">
                            <div className="flex -space-x-1.5">
                                {[
                                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face',
                                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
                                    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face',
                                ].map((src, i) => (
                                    <img
                                        key={i}
                                        src={src}
                                        alt="Verified user"
                                        className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 border-white object-cover shadow-xs transition-transform hover:scale-125 hover:z-20 duration-200"
                                    />
                                ))}
                            </div>
                            <div className="text-[11px] sm:text-[12px] leading-tight text-[#4a4a52]">
                                <div className="flex items-center gap-1 font-semibold text-[#1c1c21]">
                                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                    <span>4.9 / 5.0</span>
                                </div>
                                <span className="text-[10px] sm:text-[11px] text-[#70707a]">from 3,200+ verified routines</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Center product visual with interactive 3D cursor tilt */}
                <div
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    className="col-span-12 md:col-span-5 relative flex justify-center items-center min-h-[340px] sm:min-h-[380px] md:min-h-[420px] order-1 md:order-2 cursor-pointer"
                >
                    {/* Glowing pedestal backdrop */}
                    <div className="absolute w-[240px] sm:w-[300px] h-[240px] sm:h-[300px] rounded-full bg-gradient-to-tr from-[#adc8f8]/40 via-[#f4c9d7]/30 to-white/60 blur-[36px] pointer-events-none animate-pulse-subtle" />

                    {/* Bottle container with floating animation & responsive 3D tilt */}
                    <div
                        className="relative w-[230px] sm:w-[260px] md:w-[290px] h-[340px] sm:h-[380px] md:h-[420px] flex items-center justify-center animate-float transition-transform duration-300 ease-out"
                        style={{
                            transform: `perspective(1000px) rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)`,
                        }}
                    >
                        {/* Soft ground contact shadow */}
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-36 sm:w-44 h-5 bg-[#1c1c21]/18 blur-lg rounded-full pointer-events-none" />

                        {/* 3D Realistic Bottle Image */}
                        <img
                            src="/bottle-3d-transparent.png"
                            alt="Life Harmony Vitamin D3+K2 3D Bottle"
                            className="w-full h-full object-contain filter drop-shadow-[0_20px_35px_rgba(20,30,60,0.16)] select-none transition-transform duration-500 hover:scale-105 relative z-10"
                        />

                        {/* Interactive Organic Floating Feature Callouts */}
                        <div className="absolute -top-1 -left-2 sm:-left-6 z-20 animate-float-badge-1">
                            <div className="callout shadow-sm hover:scale-110 active:scale-95 transition-transform cursor-pointer text-[11px] sm:text-xs py-1.5 px-3">
                                <span className="callout-plus bg-emerald-500 text-white border-emerald-500 w-4 h-4 text-[10px]">✓</span>
                                <span>Bioavailable MCT Oil</span>
                            </div>
                        </div>

                        <div className="absolute top-20 -right-2 sm:-right-8 z-20 animate-float-badge-2">
                            <div className="callout shadow-sm hover:scale-110 active:scale-95 transition-transform cursor-pointer text-[11px] sm:text-xs py-1.5 px-3">
                                <span className="callout-plus bg-[#1c1c21] text-white border-[#1c1c21] w-4 h-4 text-[10px]">-</span>
                                <span>Zero Fillers or GMOs</span>
                            </div>
                        </div>

                        <div className="absolute bottom-8 -left-3 sm:-left-8 z-20 animate-float-badge-3">
                            <div className="callout shadow-sm hover:scale-110 active:scale-95 transition-transform cursor-pointer text-[11px] sm:text-xs py-1.5 px-3">
                                <span className="callout-plus bg-blue-500 text-white border-blue-500 w-4 h-4 text-[10px]">+</span>
                                <span>100% Plantgel® Shell</span>
                            </div>
                        </div>

                        {/* Floating Capsule Orb Accent */}
                        <div className="hidden lg:flex absolute -right-12 top-1/2 -translate-y-1/2 w-20 h-20 circle-blue items-center justify-center p-2.5 animate-float-slow z-20 shadow-md hover:scale-115 transition-transform">
                            <div className="relative w-10 h-10">
                                <div className="absolute top-1 left-1 w-7 h-2.5 rounded-full bg-[#adc8f8] shadow-sm rotate-45" />
                                <div className="absolute bottom-1.5 right-1 w-7 h-2.5 rounded-full bg-white/95 shadow-sm -rotate-12" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right column */}
                <div className="col-span-12 md:col-span-3 md:pl-2 space-y-3.5 order-3">
                    <div className="glass-panel p-4 rounded-2xl">
                        <div className="w-8 h-8 rounded-full bg-[#adc8f8]/40 flex items-center justify-center mb-2">
                            <ShieldCheck className="w-4 h-4 text-[#1c1c21]" />
                        </div>
                        <h4 className="text-xs sm:text-sm font-semibold text-[#1c1c21]">Third-Party Certified</h4>
                        <p className="text-[11px] sm:text-[12px] leading-[1.5] text-[#5b5b66] mt-1">
                            Every batch undergoes triple-testing for heavy metals, purity, and exact potency.
                        </p>
                    </div>

                    <div className="glass-panel p-4 rounded-2xl">
                        <div className="w-8 h-8 rounded-full bg-[#f5c6d6]/40 flex items-center justify-center mb-2">
                            <Award className="w-4 h-4 text-[#1c1c21]" />
                        </div>
                        <h4 className="text-xs sm:text-sm font-semibold text-[#1c1c21]">Targeted Synergy</h4>
                        <p className="text-[11px] sm:text-[12px] leading-[1.5] text-[#5b5b66] mt-1">
                            Vitamins D3 and K2 work symbiotically to ensure calcium reaches your bones, not arteries.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}