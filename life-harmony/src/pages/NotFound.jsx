// src/pages/NotFound.jsx
import { Link } from 'react-router-dom';
import { ArrowRight, Compass, Home } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="relative overflow-hidden mt-2 rounded-[24px] xs:rounded-[36px] glass-panel px-4 xs:px-6 md:px-14 py-16 md:py-36 text-center border border-white/70 shadow-glass">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-gradient-to-br from-[#bbcffb]/30 to-[#f6d2de]/30 blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-lg mx-auto">
                <div className="w-14 h-14 xs:w-16 xs:h-16 rounded-full bg-white/90 border border-white/80 flex items-center justify-center mx-auto mb-4 xs:mb-6 text-[#1a1a1a] shadow-md">
                    <Compass className="w-7 h-7 xs:w-8 xs:h-8 animate-spin-slow text-[#4264b3]" strokeWidth={1.8} />
                </div>

                <span className="font-display text-[72px] xs:text-[90px] md:text-[140px] leading-none tracking-tight text-[#1a1a1a] select-none">
                    404
                </span>
                
                <h1 className="font-display text-[24px] xs:text-[28px] md:text-[42px] tracking-tight mt-2 text-[#1a1a1a]">
                    Path Uncharted
                </h1>
                
                <p className="text-xs xs:text-[14px] md:text-[15px] text-[#666] mt-3 xs:mt-4 leading-relaxed">
                    The harmonic frequency you are searching for does not exist or has shifted into a new realm.
                </p>

                <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mt-6 xs:mt-8">
                    <Link
                        to="/"
                        className="btn-dark inline-flex justify-center px-6 xs:px-8 h-12 rounded-full text-xs font-semibold uppercase tracking-wider items-center gap-2 shadow-md hover:shadow-lg transition-all"
                    >
                        <Home className="w-4 h-4" />
                        <span>Return Home</span>
                    </Link>
                    <Link
                        to="/shop"
                        className="inline-flex justify-center px-6 xs:px-8 h-12 rounded-full text-xs font-semibold uppercase tracking-wider items-center gap-2 border border-[#363636]/20 bg-white/70 hover:bg-white text-[#1a1a1a] transition-all shadow-sm"
                    >
                        <span>Explore Shop</span>
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </div>
    );
}