// src/pages/About.jsx
import { Leaf, Shield, Truck, Heart, Users, Award, Sparkles, Check, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { blogImages } from '../mock';

const stats = [
    { value: '50K+', label: 'Daily Wellness Users' },
    { value: '99.4%', label: 'Bioavailable Purity' },
    { value: '100%', label: 'Carbon-Neutral Fleet' },
    { value: '0', label: 'Artificial Fillers' },
];

const values = [
    {
        icon: Leaf,
        title: 'Clean Ingredients',
        text: 'We source wild-harvested botanicals and bio-identical vitamins — strictly free from synthetic magnesium stearate or talc.',
    },
    {
        icon: Shield,
        title: 'Rigorous Lab Testing',
        text: 'Every batch undergoes dual third-party testing in ISO 17025 accredited labs for purity, heavy metals, and active potency.',
    },
    {
        icon: Heart,
        title: 'Evidence-Based Synergy',
        text: 'Our formulas are architected by PhD biochemists and functional medicine MDs with clinically studied nutrient ratios.',
    },
    {
        icon: Users,
        title: 'Ethical Direct Sourcing',
        text: 'Direct partnerships with ethical growers around the globe ensure fair living wages and regenerative harvesting.',
    },
    {
        icon: Truck,
        title: 'Swift & Carbon-Neutral',
        text: 'Eco-conscious 100% recyclable cold-sealed glass packaging, shipped free nationwide on all orders over ₹999.',
    },
    {
        icon: Award,
        title: '60-Day Peace of Mind',
        text: 'Try any Life Harmony formulation risk-free. If it doesn’t transform your energy within 60 days, we issue a full refund.',
    },
];

export default function About() {
    return (
        <div className="mt-2 space-y-8">
            {/* Hero Section */}
            <section className="relative overflow-hidden rounded-[36px] glass-panel px-6 md:px-14 py-14 md:py-20 border border-white/70 shadow-glass">
                <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-gradient-to-br from-[#bbcffb]/30 to-[#f6d2de]/30 blur-3xl pointer-events-none" />

                <div className="grid grid-cols-12 gap-10 items-center relative z-10">
                    <div className="col-span-12 md:col-span-7">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-[#363636]/10 text-[11px] font-semibold uppercase tracking-wider text-[#363636] mb-5 shadow-sm">
                            <Sparkles className="w-3.5 h-3.5 text-[#bbcffb]" />
                            <span>The Life Harmony Philosophy</span>
                        </div>

                        <h1 className="font-display text-[44px] md:text-[74px] leading-[0.93] tracking-tight text-[#1a1a1a]">
                            WELLNESS,<br />SIMPLIFIED &<br />AMPLIFIED.
                        </h1>

                        <p className="mt-6 text-[15px] md:text-[16px] leading-relaxed text-[#555] max-w-[540px]">
                            Life Harmony was born from a fundamental belief: modern health shouldn't require deciphering cryptic labels, synthetic megadoses, or empty marketing claims. We combine the purest botanical compounds with modern cellular science to help you thrive in high definition.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-4">
                            <Link
                                to="/shop"
                                className="btn-dark inline-flex px-8 h-12 rounded-full text-sm font-semibold tracking-wide items-center gap-2 shadow-md hover:shadow-lg transition-all"
                            >
                                Explore Formulas <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link
                                to="/contact"
                                className="inline-flex px-7 h-12 rounded-full text-sm font-semibold tracking-wide items-center border border-[#363636]/20 bg-white/60 hover:bg-white text-[#1a1a1a] transition-all shadow-sm"
                            >
                                Contact Our Advisory Team
                            </Link>
                        </div>
                    </div>

                    <div className="col-span-12 md:col-span-5">
                        <div className="relative">
                            <div className="rounded-[30px] overflow-hidden aspect-[4/5] bg-white shadow-xl border border-white/60 group">
                                <img
                                    src={blogImages.woman}
                                    alt="Life Harmony founder"
                                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
                                />
                            </div>

                            {/* Floating Quote Card */}
                            <div className="absolute -bottom-6 -left-6 md:-left-8 bg-white/95 backdrop-blur-md rounded-2xl p-5 border border-white/80 shadow-card-hover max-w-[280px]">
                                <div className="text-[12px] italic text-[#444] leading-snug">
                                    "When you give your body high-potency, biologically matched nutrients, vitality is simply the natural outcome."
                                </div>
                                <div className="mt-2 text-[11px] font-bold text-[#1a1a1a] uppercase tracking-wider">
                                    Elena Vance · Founder
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Bar */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((s) => (
                    <div key={s.label} className="rounded-[24px] glass-panel p-6 text-center border border-white/70 shadow-sm">
                        <div className="font-display text-[32px] md:text-[42px] tracking-tight text-[#1a1a1a]">
                            {s.value}
                        </div>
                        <div className="text-[12px] uppercase tracking-wider text-[#666] font-medium mt-1">
                            {s.label}
                        </div>
                    </div>
                ))}
            </section>

            {/* Values Section */}
            <section className="rounded-[36px] glass-panel px-6 md:px-14 py-14 md:py-20 border border-white/70 shadow-glass">
                <div className="max-w-xl">
                    <span className="text-[11px] uppercase tracking-widest text-[#777] font-semibold">
                        Our Guiding Principles
                    </span>
                    <h2 className="font-display text-[34px] md:text-[52px] tracking-tight mt-2 text-[#1a1a1a]">
                        SCIENCE WITHOUT COMPROMISE
                    </h2>
                    <p className="mt-3 text-[14px] text-[#666] leading-relaxed">
                        Six non-negotiable benchmarks govern every single ingredient, capsule, and batch we produce.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                    {values.map((v) => (
                        <div
                            key={v.title}
                            className="bg-white/90 backdrop-blur-sm rounded-[24px] p-7 border border-white/80 shadow-sm hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                        >
                            <div>
                                <div className="w-12 h-12 rounded-2xl bg-[#bbcffb]/40 flex items-center justify-center mb-5 text-[#363636]">
                                    <v.icon className="w-5 h-5" strokeWidth={2} />
                                </div>
                                <h3 className="font-display text-[18px] text-[#1a1a1a]">{v.title}</h3>
                                <p className="text-[13px] leading-relaxed text-[#666] mt-2.5">
                                    {v.text}
                                </p>
                            </div>
                            <div className="mt-5 pt-4 border-t border-[#363636]/10 flex items-center gap-1.5 text-[11px] font-semibold text-[#4264b3]">
                                <Check className="w-3.5 h-3.5" />
                                <span>Verified Standard</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Final Callout Banner */}
            <section className="relative overflow-hidden rounded-[36px] bg-[#1a1a1a] text-white px-6 md:px-14 py-16 md:py-20 text-center shadow-xl">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#bbcffb]/10 blur-3xl pointer-events-none" />
                
                <div className="relative z-10 max-w-2xl mx-auto">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[11px] font-medium uppercase tracking-wider text-[#bbcffb] mb-4">
                        <Sparkles className="w-3.5 h-3.5" /> Start Your Regimen
                    </span>
                    <h2 className="font-display text-[38px] md:text-[58px] leading-[1.02] tracking-tight">
                        Ready to feel the difference?
                    </h2>
                    <p className="mt-4 text-[14px] md:text-[15px] text-[#aaa] leading-relaxed">
                        Join over 50,000 customers who trust Life Harmony every morning for clarity, physical vigor, and calm.
                    </p>
                    <div className="mt-8 flex flex-wrap justify-center gap-4">
                        <Link
                            to="/shop"
                            className="bg-white text-[#1a1a1a] hover:bg-neutral-100 font-semibold px-8 h-12 rounded-full text-sm inline-flex items-center gap-2 shadow-lg transition-all"
                        >
                            Shop All Supplements <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}