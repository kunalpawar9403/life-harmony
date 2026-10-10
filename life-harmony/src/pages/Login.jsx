// src/pages/Login.jsx
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Loader2, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/use-toast';

export default function Login() {
    const { login, register } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();
    const redirectTo = location.state?.from?.pathname || '/profile';

    const [mode, setMode] = useState('login');
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({ name: '', email: '', password: '' });

    const handleChange = (e) => {
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!form.email || !form.password) {
            setError('Please enter your email and password.');
            return;
        }
        if (mode === 'register' && !form.name) {
            setError('Please enter your name.');
            return;
        }
        if (mode === 'register' && form.password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        setSubmitting(true);
        try {
            if (mode === 'login') {
                await login({ email: form.email, password: form.password });
                toast({
                    title: 'Welcome back!',
                    description: 'You are now signed in to your wellness dashboard.',
                });
            } else {
                await register(form);
                toast({
                    title: 'Account created!',
                    description: 'Welcome to Life Harmony.',
                });
            }
            navigate(redirectTo, { replace: true });
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                'Something went wrong.'
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="relative overflow-hidden mt-2 rounded-[24px] xs:rounded-[36px] glass-panel px-4 xs:px-6 md:px-14 py-8 xs:py-14 md:py-20 border border-white/70 shadow-glass">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 rounded-full bg-gradient-to-br from-[#bbcffb]/30 to-[#f6d2de]/20 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-80 h-80 rounded-full bg-gradient-to-tr from-[#f6d2de]/25 to-[#bbcffb]/15 blur-3xl pointer-events-none" />

            <div className="max-w-[460px] mx-auto relative z-10">
                {/* Mode Selector Pill */}
                <div className="flex p-1 rounded-full bg-white/70 border border-white/90 shadow-sm max-w-[280px] mx-auto mb-6 xs:mb-8">
                    <button
                        type="button"
                        onClick={() => { setMode('login'); setError(''); }}
                        className={`flex-1 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-all ${
                            mode === 'login'
                                ? 'bg-[#1a1a1a] text-white shadow-sm'
                                : 'text-[#666] hover:text-[#1a1a1a]'
                        }`}
                    >
                        Sign In
                    </button>
                    <button
                        type="button"
                        onClick={() => { setMode('register'); setError(''); }}
                        className={`flex-1 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-all ${
                            mode === 'register'
                                ? 'bg-[#1a1a1a] text-white shadow-sm'
                                : 'text-[#666] hover:text-[#1a1a1a]'
                        }`}
                    >
                        Register
                    </button>
                </div>

                <div className="text-center">
                    <h1 className="font-display text-[28px] xs:text-[38px] md:text-[52px] leading-[0.98] xs:leading-[0.95] tracking-tight text-[#1a1a1a]">
                        {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                    </h1>
                    <p className="text-xs xs:text-[14px] text-[#666] mt-2 xs:mt-3">
                        {mode === 'login'
                            ? 'Access your saved protocols, order tracking, and member pricing.'
                            : 'Join our daily wellness collective and unlock personalized recommendations.'}
                    </p>
                </div>

                {error && (
                    <div className="mt-6 rounded-2xl bg-rose-50 border border-rose-200 px-4 py-3 text-[13px] text-rose-700 font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                    {mode === 'register' && (
                        <div>
                            <label className="text-[11px] uppercase tracking-wider font-semibold text-[#555] block mb-1.5">
                                Full Name
                            </label>
                            <input
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                className="w-full h-12 rounded-2xl bg-white/95 px-4 text-sm text-[#1a1a1a] border border-[#363636]/15 shadow-sm outline-none focus:ring-2 focus:ring-[#bbcffb] focus:border-transparent transition-all"
                                placeholder="Elena Vance"
                                autoComplete="name"
                            />
                        </div>
                    )}

                    <div>
                        <label className="text-[11px] uppercase tracking-wider font-semibold text-[#555] block mb-1.5">
                            Email Address
                        </label>
                        <input
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            className="w-full h-12 rounded-2xl bg-white/95 px-4 text-sm text-[#1a1a1a] border border-[#363636]/15 shadow-sm outline-none focus:ring-2 focus:ring-[#bbcffb] focus:border-transparent transition-all"
                            placeholder="elena@example.com"
                            autoComplete="email"
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-1.5">
                            <label className="text-[11px] uppercase tracking-wider font-semibold text-[#555]">
                                Password
                            </label>
                            {mode === 'login' && (
                                <span className="text-[11px] text-[#777] hover:text-[#1a1a1a] cursor-pointer">
                                    Forgot?
                                </span>
                            )}
                        </div>
                        <div className="relative">
                            <input
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                value={form.password}
                                onChange={handleChange}
                                className="w-full h-12 rounded-2xl bg-white/95 px-4 pr-12 text-sm text-[#1a1a1a] border border-[#363636]/15 shadow-sm outline-none focus:ring-2 focus:ring-[#bbcffb] focus:border-transparent transition-all"
                                placeholder="••••••••"
                                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((v) => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center transition-colors"
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? (
                                    <EyeOff className="w-4 h-4 text-[#777]" />
                                ) : (
                                    <Eye className="w-4 h-4 text-[#777]" />
                                )}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="btn-dark w-full h-12 rounded-full text-xs font-semibold uppercase tracking-wider inline-flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-60 mt-2"
                    >
                        {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                        {submitting
                            ? mode === 'login'
                                ? 'Authenticating...'
                                : 'Registering...'
                            : mode === 'login'
                                ? 'Sign In to Account'
                                : 'Create Account'}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-[#363636]/10 flex flex-col items-center gap-3 text-center">
                    <div className="flex items-center gap-2 text-[11px] font-medium text-[#777]">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>256-bit encrypted authentication & private sessions</span>
                    </div>

                    <Link
                        to="/"
                        className="text-[12px] text-[#777] hover:text-[#1a1a1a] transition-colors mt-2 underline underline-offset-4"
                    >
                        Continue exploring as guest
                    </Link>
                </div>
            </div>
        </div>
    );
}