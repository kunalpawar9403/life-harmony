// src/components/Footer.jsx
import { useState } from 'react';
import { Instagram, Mail, Globe, ArrowRight, Check, ShieldCheck, RefreshCw, Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (email.trim() && email.includes('@')) {
            setSubscribed(true);
            setEmail('');
        }
    };

    return (
        <footer className="mt-14 rounded-[36px] px-6 sm:px-10 md:px-16 py-12 md:py-16 glass-panel border border-white/80 transition-all">
            {/* Value Guarantees Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pb-12 border-b border-black/5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#adc8f8]/40 flex items-center justify-center shrink-0">
                        <Leaf className="w-5 h-5 text-[#1c1c21]" />
                    </div>
                    <div>
                        <h5 className="text-xs font-bold uppercase tracking-wider text-[#1c1c21]">Clean Label Standards</h5>
                        <p className="text-[12px] text-[#656570]">100% vegan, non-GMO, zero synthetic fillers</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#f4c9d7]/40 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-5 h-5 text-[#1c1c21]" />
                    </div>
                    <div>
                        <h5 className="text-xs font-bold uppercase tracking-wider text-[#1c1c21]">Physician Formulated</h5>
                        <p className="text-[12px] text-[#656570]">Validated dosage levels backed by clinical studies</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#c8e6d9]/50 flex items-center justify-center shrink-0">
                        <RefreshCw className="w-5 h-5 text-[#1c1c21]" />
                    </div>
                    <div>
                        <h5 className="text-xs font-bold uppercase tracking-wider text-[#1c1c21]">30-Day Guarantee</h5>
                        <p className="text-[12px] text-[#656570]">Feel the perceptible difference or full refund</p>
                    </div>
                </div>
            </div>

            {/* Main Footer Links & Newsletter */}
            <div className="grid grid-cols-12 gap-8 pt-12">
                <div className="col-span-12 md:col-span-5">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-full bg-[#1c1c21] flex items-center justify-center">
                            <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="1.8">
                                <circle cx="12" cy="12" r="3" />
                                <line x1="12" y1="3" x2="12" y2="6" />
                                <line x1="12" y1="18" x2="12" y2="21" />
                                <line x1="3" y1="12" x2="6" y2="12" />
                                <line x1="18" y1="12" x2="21" y2="12" />
                            </svg>
                        </div>
                        <div className="leading-tight">
                            <div className="font-display text-[15px] font-bold text-[#1c1c21]">Life</div>
                            <div className="font-display text-[15px] font-bold text-[#1c1c21]">Harmony</div>
                        </div>
                    </Link>
                    <p className="mt-4 max-w-[340px] text-[13px] leading-[1.65] text-[#555560]">
                        Bio-intelligent daily formulations created to align your energy, immunity, and cellular vitality with modern science.
                    </p>

                    {/* Newsletter Subscription */}
                    <div className="mt-6 max-w-sm">
                        <h5 className="text-xs font-bold uppercase tracking-wider text-[#1c1c21] mb-2">
                            Join the Harmony Collective
                        </h5>
                        <p className="text-xs text-[#656570] mb-3">
                            Subscribe for early formula drops and receive 15% off your first routine.
                        </p>
                        {subscribed ? (
                            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-800 flex items-center gap-2">
                                <Check className="w-4 h-4 text-emerald-600" />
                                <span>Welcome! Use code HARMONY15 at checkout.</span>
                            </div>
                        ) : (
                            <form onSubmit={handleSubscribe} className="flex gap-2">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email..."
                                    required
                                    className="flex-1 h-10 px-4 rounded-full bg-white text-xs outline-none border border-black/10 focus:border-[#1c1c21]"
                                />
                                <button
                                    type="submit"
                                    className="btn-dark px-4 h-10 rounded-full text-xs font-semibold shrink-0 flex items-center gap-1"
                                >
                                    <span>Join</span>
                                    <ArrowRight className="w-3 h-3" />
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                <div className="col-span-6 md:col-span-3 md:pl-6">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-[#1c1c21] mb-4">Shop Collections</h4>
                    <ul className="space-y-2.5 text-[13px] text-[#555560]">
                        <li><Link to="/shop" className="hover:text-[#1c1c21] transition-colors">Daily Vitamins</Link></li>
                        <li><Link to="/shop" className="hover:text-[#1c1c21] transition-colors">Dietary Supplements</Link></li>
                        <li><Link to="/shop" className="hover:text-[#1c1c21] transition-colors">Clinical Bundles &amp; Sets</Link></li>
                        <li><Link to="/shop" className="hover:text-[#1c1c21] transition-colors">Immunity &amp; Defense</Link></li>
                        <li><Link to="/shop" className="hover:text-[#1c1c21] transition-colors">Energy &amp; Focus</Link></li>
                    </ul>
                </div>

                <div className="col-span-6 md:col-span-4">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-[#1c1c21] mb-4">Company &amp; Care</h4>
                    <ul className="space-y-2.5 text-[13px] text-[#555560]">
                        <li><Link to="/about" className="hover:text-[#1c1c21] transition-colors">Our Scientific Board</Link></li>
                        <li><Link to="/blog" className="hover:text-[#1c1c21] transition-colors">Wellness Journal</Link></li>
                        <li><Link to="/contact" className="hover:text-[#1c1c21] transition-colors">Contact Care Team</Link></li>
                        <li><Link to="/profile" className="hover:text-[#1c1c21] transition-colors">Track Your Order</Link></li>
                        <li><Link to="/about" className="hover:text-[#1c1c21] transition-colors">Quality &amp; Testing Reports</Link></li>
                    </ul>
                </div>
            </div>

            {/* Social pills */}
            <div className="flex flex-wrap items-center gap-2.5 mt-10 pt-8 border-t border-black/5">
                <a
                    href="mailto:hello@lifeharmony.com"
                    className="inline-flex items-center gap-2 glass-pill px-4 h-9 text-[12px] font-medium text-[#2d2d33] hover:bg-white transition-colors"
                >
                    <Mail className="w-3.5 h-3.5 text-[#1c1c21]" /> hello@lifeharmony.com
                </a>
                <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 glass-pill px-4 h-9 text-[12px] font-medium text-[#2d2d33] hover:bg-white transition-colors"
                >
                    <Instagram className="w-3.5 h-3.5 text-[#1c1c21]" /> @lifeharmony_wellness
                </a>
                <span className="inline-flex items-center gap-2 glass-pill px-4 h-9 text-[12px] font-medium text-[#2d2d33]">
                    <Globe className="w-3.5 h-3.5 text-[#1c1c21]" /> Global Shipping Available
                </span>
            </div>

            {/* Bottom Bar */}
            <div className="mt-8 pt-6 border-t border-black/5 flex flex-col sm:flex-row justify-between text-[11px] text-[#80808a] gap-2">
                <span>© {new Date().getFullYear()} Life Harmony Inc. All science-backed formulations reserved.</span>
                <div className="flex gap-5">
                    <span className="hover:text-[#1c1c21] cursor-pointer">Privacy Policy</span>
                    <span className="hover:text-[#1c1c21] cursor-pointer">Terms of Service</span>
                    <span className="hover:text-[#1c1c21] cursor-pointer">Accessibility</span>
                </div>
            </div>
        </footer>
    );
}