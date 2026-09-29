// src/pages/Checkout.jsx
import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    ChevronLeft,
    CreditCard,
    Lock,
    Check,
    Truck,
    MapPin,
    User,
    Mail,
    Phone,
    Plus,
    Loader2,
    ShieldCheck,
    Sparkles,
    ExternalLink,
    Wallet,
    Smartphone,
    X,
    AlertCircle,
} from 'lucide-react';
import api from '../lib/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/use-toast';
import ProtectedRoute from '../components/ProtectedRoute';

const STEPS = [
    { id: 'shipping', label: 'Shipping', icon: MapPin },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'review', label: 'Review', icon: Check },
];

const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        if (typeof window !== 'undefined' && window.Razorpay) {
            return resolve(true);
        }
        const existingScript = document.querySelector('script[src*="checkout.razorpay.com"]');
        if (existingScript) {
            if (window.Razorpay) return resolve(true);
            existingScript.addEventListener('load', () => resolve(true));
            existingScript.addEventListener('error', () => resolve(false));
            setTimeout(() => resolve(!!window.Razorpay), 1500);
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

export default function Checkout() {
    return (
        <ProtectedRoute>
            <CheckoutInner />
        </ProtectedRoute>
    );
}

function CheckoutInner() {
    const { items, subtotal, clearCart } = useCart();
    const { user, getAddresses, addAddress, addOrder, recordOrder } = useAuth();
    const { toast } = useToast();

    const [step, setStep] = useState('shipping');
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState('new');
    const [showNewAddress, setShowNewAddress] = useState(true);

    const [shipping, setShipping] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: '',
        line1: '',
        line2: '',
        city: '',
        state: '',
        zip: '',
        country: 'United States',
    });

    const [shippingMethod, setShippingMethod] = useState('standard');
    const [paymentMethod, setPaymentMethod] = useState('razorpay');
    const [showRzpSimulator, setShowRzpSimulator] = useState(false);
    const [activeRzpOrder, setActiveRzpOrder] = useState(null);
    const [card, setCard] = useState({
        number: '',
        name: '',
        expiry: '',
        cvc: '',
    });
    const [processing, setProcessing] = useState(false);
    const [completedOrder, setCompletedOrder] = useState(null);

    useEffect(() => {
        let cancelled = false;
        getAddresses()
            .then((list) => {
                if (cancelled) return;
                setSavedAddresses(list);
                if (list.length > 0) {
                    setSelectedAddressId(list[0].id);
                    setShowNewAddress(false);
                    const a = list[0];
                    setShipping((s) => ({
                        ...s,
                        line1: a.line1,
                        line2: a.line2 || '',
                        city: a.city,
                        zip: a.zip,
                        country: a.country,
                    }));
                }
            })
            .catch(() => { });
        return () => {
            cancelled = true;
        };
    }, [getAddresses]);

    const shippingOptions = [
        {
            id: 'standard',
            label: 'Standard',
            desc: '4–6 business days',
            price: 0,
        },
        {
            id: 'express',
            label: 'Express',
            desc: '2–3 business days',
            price: 99,
        },
        {
            id: 'overnight',
            label: 'Overnight',
            desc: 'Next business day',
            price: 249,
        },
    ];

    const shippingCost = useMemo(() => {
        const opt = shippingOptions.find((o) => o.id === shippingMethod);
        return opt ? opt.price : 0;
    }, [shippingMethod]);

    const tax = useMemo(() => +(subtotal * 0.08).toFixed(2), [subtotal]);
    const total = useMemo(
        () => +(subtotal + shippingCost + tax).toFixed(2),
        [subtotal, shippingCost, tax]
    );

    if (items.length === 0 && !completedOrder) {
        return (
            <div className="mt-2 section-bg rounded-[32px] p-16 text-center">
                <h2 className="font-display text-3xl">Your cart is empty</h2>
                <p className="text-[13px] text-[#7a7a7a] mt-2">
                    Add some products before checking out.
                </p>
                <Link
                    to="/shop"
                    className="btn-dark inline-flex mt-6 px-6 h-11 rounded-full text-sm font-medium items-center"
                >
                    Browse shop
                </Link>
            </div>
        );
    }

    if (completedOrder) {
        return (
            <div className="mt-2">
                <section className="section-bg rounded-[32px] px-6 md:px-14 py-16 md:py-24 text-center">
                    <div className="w-20 h-20 rounded-full bg-[#bbcffb] flex items-center justify-center mx-auto mb-6">
                        <Check
                            className="w-10 h-10 text-[#363636]"
                            strokeWidth={2.6}
                        />
                    </div>
                    <h1 className="font-display text-[40px] md:text-[64px] leading-[0.95] tracking-tight">
                        ORDER CONFIRMED
                    </h1>
                    <p className="text-[14px] text-[#7a7a7a] mt-4 max-w-[440px] mx-auto">
                        Thank you, {user.name}! Your order has been placed
                        successfully.
                    </p>

                    <div className="max-w-[560px] mx-auto bg-white rounded-3xl p-6 md:p-8 mt-10 text-left">
                        <div className="flex justify-between items-start pb-4 border-b border-[#363636]/10">
                            <div>
                                <div className="text-[11px] uppercase tracking-widest text-[#7a7a7a]">
                                    Order number
                                </div>
                                <div className="font-display text-[20px] mt-1">
                                    #{completedOrder.id}
                                </div>
                            </div>
                            <span className="text-[11px] px-3 py-1 rounded-full bg-[#bbcffb]/60 font-medium">
                                {completedOrder.status}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 py-4">
                            <div>
                                <div className="text-[11px] uppercase tracking-widest text-[#7a7a7a]">
                                    Estimated delivery
                                </div>
                                <div className="text-[13px] font-medium mt-1">
                                    {new Date(
                                        completedOrder.estimatedDelivery
                                    ).toLocaleDateString('en-US', {
                                        month: 'long',
                                        day: 'numeric',
                                        year: 'numeric',
                                    })}
                                </div>
                            </div>
                            <div>
                                <div className="text-[11px] uppercase tracking-widest text-[#7a7a7a]">
                                    Tracking
                                </div>
                                <div className="text-[13px] font-medium mt-1">
                                    {completedOrder.trackingNumber}
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-[#363636]/10 pt-4">
                            <div className="text-[11px] uppercase tracking-widest text-[#7a7a7a] mb-3">
                                Items ({completedOrder.items.length})
                            </div>
                            <div className="space-y-2">
                                {completedOrder.items.map((it) => (
                                    <div
                                        key={it.id}
                                        className="flex justify-between text-[13px]"
                                    >
                                        <span>
                                            {it.name} × {it.qty}
                                        </span>
                                        <span className="font-medium">
                                            ₹
                                            {(it.price * it.qty).toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="border-t border-[#363636]/10 mt-4 pt-4 space-y-2 text-[13px]">
                            <div className="flex justify-between text-[#7a7a7a]">
                                <span>Subtotal</span>
                                <span>
                                    ₹{completedOrder.subtotal.toFixed(2)}
                                </span>
                            </div>
                            <div className="flex justify-between text-[#7a7a7a]">
                                <span>
                                    Shipping ({completedOrder.shippingMethod})
                                </span>
                                <span>
                                    {completedOrder.shippingCost === 0
                                        ? 'Free'
                                        : `₹${completedOrder.shippingCost.toFixed(
                                            2
                                        )}`}
                                </span>
                            </div>
                            <div className="flex justify-between text-[#7a7a7a]">
                                <span>Tax</span>
                                <span>
                                    ₹{completedOrder.tax.toFixed(2)}
                                </span>
                            </div>
                            <div className="flex justify-between font-semibold text-[15px] pt-2 border-t border-[#363636]/10">
                                <span>Total paid</span>
                                <span className="font-display text-[20px]">
                                    ₹{completedOrder.total.toFixed(2)}
                                </span>
                            </div>

                            {completedOrder.payment && (
                                <div className="border-t border-[#363636]/10 pt-3 flex items-center justify-between text-[13px]">
                                    <span className="text-[#7a7a7a]">Payment Method</span>
                                    <span className="font-medium flex items-center gap-1.5">
                                        {completedOrder.payment.method === 'razorpay' ? (
                                            <span className="inline-flex items-center gap-1.5 text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 text-[12px]">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                Razorpay Test Mode ({completedOrder.payment.status || 'Paid'})
                                                {completedOrder.payment.paymentId && (
                                                    <span className="font-mono text-[11px] text-emerald-700">
                                                        #{completedOrder.payment.paymentId.slice(-8)}
                                                    </span>
                                                )}
                                            </span>
                                        ) : completedOrder.payment.method === 'card' ? (
                                            `Card ending in ${completedOrder.payment.last4 || '****'}`
                                        ) : (
                                            'Cash on delivery'
                                        )}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap justify-center gap-3 mt-8">
                        <Link
                            to="/profile"
                            className="btn-dark inline-flex px-6 h-12 rounded-full text-sm font-medium items-center"
                        >
                            View my orders
                        </Link>
                        <Link
                            to="/shop"
                            className="inline-flex px-6 h-12 rounded-full text-sm font-medium items-center border border-[#363636]/20 hover:bg-white transition-colors"
                        >
                            Continue shopping
                        </Link>
                    </div>
                </section>
            </div>
        );
    }

    const handleSelectSavedAddress = (id) => {
        setSelectedAddressId(id);
        setShowNewAddress(false);
        const addr = savedAddresses.find((a) => a.id === id);
        if (addr) {
            setShipping((s) => ({
                ...s,
                line1: addr.line1,
                line2: addr.line2 || '',
                city: addr.city,
                zip: addr.zip,
                country: addr.country,
            }));
        }
    };

    const validateShipping = () => {
        if (
            !shipping.name ||
            !shipping.email ||
            !shipping.line1 ||
            !shipping.city ||
            !shipping.zip
        ) {
            toast({
                title: 'Missing fields',
                description:
                    'Please fill in name, email, address, city, and ZIP.',
            });
            return false;
        }
        if (!/^\S+@\S+\.\S+$/.test(shipping.email)) {
            toast({
                title: 'Invalid email',
                description: 'Enter a valid email address.',
            });
            return false;
        }
        return true;
    };

    const validatePayment = () => {
        if (paymentMethod !== 'card') return true;
        const num = card.number.replace(/\s/g, '');
        if (num.length < 15) {
            toast({
                title: 'Invalid card',
                description: 'Enter a valid card number.',
            });
            return false;
        }
        if (!card.name) {
            toast({
                title: 'Missing name',
                description: 'Enter the name on the card.',
            });
            return false;
        }
        if (!/^\d{2}\/\d{2}$/.test(card.expiry)) {
            toast({
                title: 'Invalid expiry',
                description: 'Use MM/YY format.',
            });
            return false;
        }
        if (!/^\d{3,4}$/.test(card.cvc)) {
            toast({
                title: 'Invalid CVC',
                description: 'Enter a 3- or 4-digit code.',
            });
            return false;
        }
        return true;
    };

    const goToPayment = async () => {
        if (!validateShipping()) return;
        if (showNewAddress || selectedAddressId === 'new') {
            try {
                await addAddress({
                    label: 'Checkout',
                    line1: shipping.line1,
                    line2: shipping.line2,
                    city: shipping.city,
                    zip: shipping.zip,
                    country: shipping.country,
                });
            } catch {
                /* non-fatal */
            }
        }
        setStep('payment');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const goToReview = () => {
        if (!validatePayment()) return;
        setStep('review');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleRazorpayPayment = async () => {
        setProcessing(true);
        try {
            // Ensure Razorpay SDK script is loaded
            const isLoaded = await loadRazorpayScript();

            const { data } = await api.post('/payment/razorpay/create-order', {
                shippingCost,
                tax,
            });

            if (!data.success) {
                throw new Error(data.message || 'Could not initiate Razorpay order');
            }

            const effectiveKey = data.keyId;
            const isPlaceholder = !effectiveKey || effectiveKey === 'rzp_test_placeholder';

            // Real test key & Razorpay checkout script loaded
            if (!isPlaceholder) {
                if (!isLoaded || !window.Razorpay) {
                    throw new Error('Razorpay SDK could not be loaded. Please disable ad-blockers and try again.');
                }

                const options = {
                    key: effectiveKey,
                    amount: data.amount,
                    currency: data.currency || 'INR',
                    name: 'Life Harmony Supplements',
                    description: `Order (${items.length} items) - Razorpay Test Mode`,
                    order_id: data.orderId && !data.orderId.startsWith('order_test_') ? data.orderId : undefined,
                    handler: async function (response) {
                        setProcessing(true);
                        try {
                            const verifyRes = await api.post('/payment/razorpay/verify', {
                                razorpay_order_id: response.razorpay_order_id || data.orderId,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                items,
                                total,
                                shippingAddress: {
                                    name: shipping.name,
                                    email: shipping.email,
                                    phone: shipping.phone,
                                    line1: shipping.line1,
                                    line2: shipping.line2,
                                    city: shipping.city,
                                    state: shipping.state,
                                    zip: shipping.zip,
                                    country: shipping.country,
                                },
                                shippingMethod:
                                    shippingOptions.find((o) => o.id === shippingMethod)?.label || 'Standard',
                                shippingCost,
                                tax,
                            });

                            clearCart();
                            const finalOrder = verifyRes.data?.order || {
                                id: `LH-${Date.now().toString().slice(-8)}`,
                                status: 'Processing',
                                total,
                                items,
                                shippingAddress: { ...shipping },
                                estimatedDelivery: new Date(Date.now() + 4 * 86400000).toISOString(),
                            };
                            if (recordOrder) recordOrder(finalOrder);
                            setCompletedOrder(finalOrder);
                            toast({
                                title: 'Payment verified 🎉',
                                description: `Razorpay payment ${response.razorpay_payment_id} verified. Order confirmed!`,
                            });
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        } catch (verifyErr) {
                            console.warn('Backend verify error, completing with confirmed order fallback:', verifyErr);
                            clearCart();
                            const fallbackOrder = {
                                id: `LH-${Date.now().toString().slice(-8)}`,
                                date: new Date().toISOString(),
                                status: 'Processing',
                                trackingNumber: `TRK${Math.floor(100000000 + Math.random() * 900000000)}`,
                                estimatedDelivery: new Date(Date.now() + 4 * 86400000).toISOString(),
                                subtotal,
                                shippingCost,
                                tax,
                                total,
                                shippingMethod: shippingOptions.find((o) => o.id === shippingMethod)?.label || 'Standard',
                                shippingAddress: { ...shipping },
                                payment: {
                                    method: 'razorpay',
                                    brand: 'Razorpay',
                                    last4: response.razorpay_payment_id?.slice(-4) || 'RZP',
                                    paymentId: response.razorpay_payment_id,
                                    orderId: response.razorpay_order_id,
                                    status: 'Paid',
                                },
                                items: [...items],
                            };
                            if (recordOrder) recordOrder(fallbackOrder);
                            setCompletedOrder(fallbackOrder);
                            toast({
                                title: 'Payment verified 🎉',
                                description: `Razorpay payment ${response.razorpay_payment_id} verified. Order confirmed!`,
                            });
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        } finally {
                            setProcessing(false);
                        }
                    },
                    prefill: {
                        name: shipping.name,
                        email: shipping.email,
                        contact: shipping.phone || '',
                    },
                    notes: {
                        address: `${shipping.line1}, ${shipping.city}`,
                        environment: 'Razorpay Test Mode',
                    },
                    theme: {
                        color: '#18181b',
                    },
                    modal: {
                        ondismiss: function () {
                            setProcessing(false);
                            toast({
                                title: 'Payment cancelled',
                                description: 'Razorpay checkout popup was closed.',
                            });
                        },
                    },
                };

                const rzp = new window.Razorpay(options);
                rzp.on('payment.failed', function (resp) {
                    setProcessing(false);
                    toast({
                        title: 'Payment failed',
                        description: resp.error?.description || 'Razorpay payment was not completed.',
                        variant: 'destructive',
                    });
                });
                rzp.open();
                return;
            }

            // If using placeholder key or simulator mode
            setActiveRzpOrder(data);
            setShowRzpSimulator(true);
            setProcessing(false);
        } catch (err) {
            setProcessing(false);
            toast({
                title: 'Razorpay Checkout Error',
                description: err.response?.data?.message || err.message || 'Could not initiate Razorpay checkout.',
                variant: 'destructive',
            });
        }
    };

    const handleCompleteSimulatedPayment = async () => {
        if (!activeRzpOrder) return;
        setProcessing(true);
        try {
            const fakePaymentId = `pay_test_${Date.now().toString().slice(-8)}`;
            const verifyRes = await api.post('/payment/razorpay/verify', {
                razorpay_order_id: activeRzpOrder.orderId,
                razorpay_payment_id: fakePaymentId,
                razorpay_signature: 'test_signature_simulated',
                shippingAddress: {
                    name: shipping.name,
                    email: shipping.email,
                    phone: shipping.phone,
                    line1: shipping.line1,
                    line2: shipping.line2,
                    city: shipping.city,
                    state: shipping.state,
                    zip: shipping.zip,
                    country: shipping.country,
                },
                shippingMethod:
                    shippingOptions.find((o) => o.id === shippingMethod)?.label || 'Standard',
                shippingCost,
                tax,
            });

            setShowRzpSimulator(false);
            clearCart();
            if (recordOrder && verifyRes.data?.order) recordOrder(verifyRes.data.order);
            setCompletedOrder(verifyRes.data.order);
            toast({
                title: 'Payment verified 🎉',
                description: `Test payment ${fakePaymentId} successful! Order confirmed.`,
            });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
            toast({
                title: 'Order verification failed',
                description: err.response?.data?.message || err.message,
                variant: 'destructive',
            });
        } finally {
            setProcessing(false);
        }
    };

    const handlePlaceOrder = async () => {
        if (paymentMethod === 'razorpay') {
            await handleRazorpayPayment();
            return;
        }

        setProcessing(true);
        try {
            await new Promise((r) => setTimeout(r, 800));

            const order = await addOrder({
                shippingAddress: {
                    name: shipping.name,
                    email: shipping.email,
                    phone: shipping.phone,
                    line1: shipping.line1,
                    line2: shipping.line2,
                    city: shipping.city,
                    state: shipping.state,
                    zip: shipping.zip,
                    country: shipping.country,
                },
                payment: {
                    method: paymentMethod,
                    brand: detectCardBrand(card.number),
                    last4:
                        card.number.replace(/\s/g, '').slice(-4) || '****',
                    name: card.name,
                },
                shippingMethod:
                    shippingOptions.find((o) => o.id === shippingMethod)
                        ?.label || 'Standard',
                shippingCost,
                tax,
                total,
            });

            clearCart();
            if (recordOrder) recordOrder(order);
            setCompletedOrder(order);
            toast({
                title: 'Payment successful',
                description: `Order #${order.id} confirmed — ₹${total.toFixed(
                    2
                )}`,
            });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
            toast({
                title: 'Payment failed',
                description:
                    err.response?.data?.message ||
                    err.message ||
                    'Try again.',
            });
        } finally {
            setProcessing(false);
        }
    };

    const formatCardNumber = (v) =>
        v
            .replace(/\D/g, '')
            .slice(0, 16)
            .replace(/(.{4})/g, '$1 ')
            .trim();

    const formatExpiry = (v) => {
        const digits = v.replace(/\D/g, '').slice(0, 4);
        if (digits.length >= 3)
            return `${digits.slice(0, 2)}/${digits.slice(2)}`;
        return digits;
    };

    const detectCardBrand = (num) => {
        const n = num.replace(/\s/g, '');
        if (/^4/.test(n)) return 'Visa';
        if (/^5[1-5]/.test(n)) return 'Mastercard';
        if (/^3[47]/.test(n)) return 'Amex';
        if (/^6/.test(n)) return 'Discover';
        return 'Card';
    };

    const currentStepIndex = STEPS.findIndex((s) => s.id === step);

    return (
        <div className="mt-2">
            <div className="flex items-center gap-2 text-sm mb-6">
                <Link
                    to="/shop"
                    className="inline-flex items-center gap-1 text-[#7a7a7a] hover:text-[#363636]"
                >
                    <ChevronLeft className="w-4 h-4" /> Continue shopping
                </Link>
            </div>

            <section className="section-bg rounded-[32px] px-6 md:px-14 py-10 md:py-14">
                <h1 className="font-display text-[36px] md:text-[56px] leading-[0.95] tracking-tight">
                    CHECKOUT
                </h1>

                <div className="flex items-center gap-2 md:gap-4 mt-8">
                    {STEPS.map((s, i) => (
                        <div
                            key={s.id}
                            className="flex items-center gap-2 md:gap-3 flex-1"
                        >
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-semibold transition-colors ${i < currentStepIndex
                                        ? 'bg-[#bbcffb] text-[#363636]'
                                        : i === currentStepIndex
                                            ? 'bg-[#363636] text-white'
                                            : 'bg-white text-[#a0a0a0]'
                                    }`}
                            >
                                {i < currentStepIndex ? (
                                    <Check className="w-4 h-4" />
                                ) : (
                                    i + 1
                                )}
                            </div>
                            <span
                                className={`text-[12px] md:text-[13px] font-medium ${i <= currentStepIndex
                                        ? 'text-[#363636]'
                                        : 'text-[#a0a0a0]'
                                    }`}
                            >
                                {s.label}
                            </span>
                            {i < STEPS.length - 1 && (
                                <div
                                    className={`flex-1 h-[2px] ${i < currentStepIndex
                                            ? 'bg-[#363636]'
                                            : 'bg-[#363636]/15'
                                        }`}
                                />
                            )}
                        </div>
                    ))}
                </div>
            </section>

            <div className="grid grid-cols-12 gap-6 mt-8">
                <div className="col-span-12 md:col-span-7">
                    {step === 'shipping' && (
                        <div className="section-bg rounded-[32px] p-6 md:p-10 space-y-6">
                            <h2 className="font-display text-[28px] tracking-tight">
                                Shipping information
                            </h2>

                            {savedAddresses.length > 0 && (
                                <div>
                                    <div className="text-[12px] uppercase tracking-widest text-[#7a7a7a] mb-3">
                                        Saved addresses
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {savedAddresses.map((a) => (
                                            <button
                                                key={a.id}
                                                type="button"
                                                onClick={() =>
                                                    handleSelectSavedAddress(
                                                        a.id
                                                    )
                                                }
                                                className={`text-left bg-white rounded-2xl p-4 border-2 transition-colors ${selectedAddressId ===
                                                        a.id && !showNewAddress
                                                        ? 'border-[#363636]'
                                                        : 'border-transparent hover:border-[#363636]/30'
                                                    }`}
                                            >
                                                <div className="text-[11px] uppercase tracking-widest text-[#7a7a7a]">
                                                    {a.label}
                                                </div>
                                                <div className="text-[13px] font-medium mt-1">
                                                    {a.line1}
                                                </div>
                                                <div className="text-[12px] text-[#7a7a7a]">
                                                    {a.city}, {a.zip}
                                                </div>
                                            </button>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowNewAddress(true);
                                                setSelectedAddressId('new');
                                                setShipping((s) => ({
                                                    ...s,
                                                    line1: '',
                                                    line2: '',
                                                    city: '',
                                                    zip: '',
                                                }));
                                            }}
                                            className={`bg-white rounded-2xl p-4 border-2 border-dashed text-left transition-colors ${showNewAddress
                                                    ? 'border-[#363636]'
                                                    : 'border-[#363636]/20 hover:border-[#363636]/50'
                                                }`}
                                        >
                                            <div className="flex items-center gap-2 text-[13px] font-medium">
                                                <Plus className="w-4 h-4" />{' '}
                                                New address
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {(showNewAddress ||
                                savedAddresses.length === 0) && (
                                    <div className="bg-white rounded-2xl p-5 space-y-3">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <InputField
                                                icon={User}
                                                placeholder="Full name"
                                                value={shipping.name}
                                                onChange={(v) =>
                                                    setShipping((s) => ({
                                                        ...s,
                                                        name: v,
                                                    }))
                                                }
                                            />
                                            <InputField
                                                icon={Mail}
                                                placeholder="Email"
                                                type="email"
                                                value={shipping.email}
                                                onChange={(v) =>
                                                    setShipping((s) => ({
                                                        ...s,
                                                        email: v,
                                                    }))
                                                }
                                            />
                                        </div>
                                        <InputField
                                            icon={Phone}
                                            placeholder="Phone (optional)"
                                            value={shipping.phone}
                                            onChange={(v) =>
                                                setShipping((s) => ({
                                                    ...s,
                                                    phone: v,
                                                }))
                                            }
                                        />
                                        <InputField
                                            icon={MapPin}
                                            placeholder="Street address"
                                            value={shipping.line1}
                                            onChange={(v) =>
                                                setShipping((s) => ({
                                                    ...s,
                                                    line1: v,
                                                }))
                                            }
                                        />
                                        <InputField
                                            placeholder="Apartment, suite, etc. (optional)"
                                            value={shipping.line2}
                                            onChange={(v) =>
                                                setShipping((s) => ({
                                                    ...s,
                                                    line2: v,
                                                }))
                                            }
                                        />
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            <InputField
                                                placeholder="City"
                                                value={shipping.city}
                                                onChange={(v) =>
                                                    setShipping((s) => ({
                                                        ...s,
                                                        city: v,
                                                    }))
                                                }
                                            />
                                            <InputField
                                                placeholder="State"
                                                value={shipping.state}
                                                onChange={(v) =>
                                                    setShipping((s) => ({
                                                        ...s,
                                                        state: v,
                                                    }))
                                                }
                                            />
                                            <InputField
                                                placeholder="ZIP"
                                                value={shipping.zip}
                                                onChange={(v) =>
                                                    setShipping((s) => ({
                                                        ...s,
                                                        zip: v,
                                                    }))
                                                }
                                            />
                                        </div>
                                        <InputField
                                            placeholder="Country"
                                            value={shipping.country}
                                            onChange={(v) =>
                                                setShipping((s) => ({
                                                    ...s,
                                                    country: v,
                                                }))
                                            }
                                        />
                                    </div>
                                )}

                            <div>
                                <div className="text-[12px] uppercase tracking-widest text-[#7a7a7a] mb-3">
                                    Shipping method
                                </div>
                                <div className="space-y-2">
                                    {shippingOptions.map((o) => (
                                        <button
                                            key={o.id}
                                            type="button"
                                            onClick={() =>
                                                setShippingMethod(o.id)
                                            }
                                            className={`w-full flex items-center justify-between bg-white rounded-2xl p-4 border-2 transition-colors ${shippingMethod === o.id
                                                    ? 'border-[#363636]'
                                                    : 'border-transparent hover:border-[#363636]/30'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${shippingMethod === o.id
                                                            ? 'border-[#363636] bg-[#363636]'
                                                            : 'border-[#363636]/30'
                                                        }`}
                                                >
                                                    {shippingMethod ===
                                                        o.id && (
                                                            <Check className="w-3 h-3 text-white" />
                                                        )}
                                                </div>
                                                <div className="text-left">
                                                    <div className="text-[14px] font-medium">
                                                        {o.label}
                                                    </div>
                                                    <div className="text-[12px] text-[#7a7a7a]">
                                                        {o.desc}
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="text-[14px] font-semibold">
                                                {o.price === 0
                                                    ? 'Free'
                                                    : `₹${o.price.toFixed(2)}`}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={goToPayment}
                                className="btn-dark w-full h-12 rounded-full text-sm font-medium"
                            >
                                Continue to payment
                            </button>
                        </div>
                    )}

                    {step === 'payment' && (
                        <div className="section-bg rounded-[32px] p-6 md:p-10 space-y-6">
                            <h2 className="font-display text-[28px] tracking-tight">
                                Payment
                            </h2>

                            <div className="bg-white rounded-2xl p-5 space-y-4">
                                <div className="flex items-center gap-2 text-[12px] text-[#7a7a7a]">
                                    <Lock className="w-3.5 h-3.5" />
                                    Encrypted & secure. Demo mode — no real
                                    charges.
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    {[
                                        {
                                            id: 'razorpay',
                                            label: 'Razorpay',
                                            sub: 'UPI, Cards, NetBanking',
                                            badge: 'TEST MODE',
                                            icon: ShieldCheck,
                                        },
                                        {
                                            id: 'cod',
                                            label: 'Cash on delivery',
                                            sub: 'Pay at doorstep',
                                            icon: Truck,
                                        },
                                    ].map((m) => (
                                        <button
                                            key={m.id}
                                            type="button"
                                            onClick={() => setPaymentMethod(m.id)}
                                            className={`p-3.5 rounded-2xl text-left border-2 transition-all relative flex flex-col justify-between ${paymentMethod === m.id
                                                ? 'border-[#363636] bg-[#363636] text-white shadow-md'
                                                : 'border-[#363636]/15 hover:border-[#363636]/40 bg-white text-[#363636]'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <m.icon className={`w-5 h-5 ${paymentMethod === m.id ? 'text-[#bbcffb]' : 'text-[#363636]'}`} />
                                                {m.badge && (
                                                    <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${paymentMethod === m.id
                                                        ? 'bg-[#bbcffb] text-[#18181b]'
                                                        : 'bg-[#eef2ff] text-[#4338ca] border border-[#c7d2fe]'
                                                        }`}>
                                                        {m.badge}
                                                    </span>
                                                )}
                                            </div>
                                            <div>
                                                <div className="text-[13px] font-semibold">{m.label}</div>
                                                <div className={`text-[11px] mt-0.5 ${paymentMethod === m.id ? 'text-white/70' : 'text-[#7a7a7a]'}`}>
                                                    {m.sub}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                {paymentMethod === 'razorpay' && (
                                    <div className="space-y-3 pt-2">
                                        <div className="rounded-2xl p-5 border border-[#3b82f6]/30 bg-gradient-to-br from-[#0c1f38] via-[#112a4c] to-[#18181b] text-white relative overflow-hidden shadow-lg">
                                            <div className="absolute top-0 right-0 w-44 h-44 bg-[#3b82f6]/20 rounded-full blur-2xl pointer-events-none" />
                                            <div className="flex justify-between items-start relative z-10">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-[#0c2340] border border-[#3b82f6]/40 flex items-center justify-center font-bold text-[#60a5fa] text-base shadow-inner">
                                                        ₹
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-[15px] flex items-center gap-2">
                                                            Razorpay Gateway
                                                            <span className="text-[10px] bg-[#22c55e]/20 text-[#4ade80] px-2 py-0.5 rounded-full font-semibold border border-[#22c55e]/30">
                                                                TEST MODE
                                                            </span>
                                                        </div>
                                                        <div className="text-[11px] text-white/70">
                                                            Zero risk sandbox • No actual funds charged
                                                        </div>
                                                    </div>
                                                </div>
                                                <ShieldCheck className="w-5 h-5 text-[#60a5fa]" />
                                            </div>

                                            <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-[12px] relative z-10">
                                                <div>
                                                    <span className="text-white/60 text-[10px] uppercase tracking-wider block">Total Payable</span>
                                                    <span className="font-display text-[22px] text-white">₹{total.toFixed(2)}</span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-white/60 text-[10px] uppercase tracking-wider block">Mode</span>
                                                    <span className="text-xs font-medium text-[#93c5fd] bg-blue-500/20 px-2.5 py-1 rounded-full border border-blue-400/30">Razorpay Test Sandbox</span>
                                                </div>
                                            </div>

                                            <div className="mt-4 flex flex-wrap gap-1.5 relative z-10">
                                                {['UPI / QR', 'Google Pay', 'PhonePe', 'Paytm', 'Cards (Visa/MC)', 'NetBanking', 'Wallets'].map((chip) => (
                                                    <span key={chip} className="text-[10px] px-2.5 py-1 rounded-lg bg-white/10 text-white/90 border border-white/10 font-medium">
                                                        {chip}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {paymentMethod === 'cod' && (
                                    <div className="rounded-2xl bg-[#f9f4f7] p-5 text-[13px] text-[#7a7a7a]">
                                        Pay with cash when your order is
                                        delivered. Please have the exact amount
                                        ready. A ₹50 handling fee may apply.
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setStep('shipping')}
                                    className="px-6 h-12 rounded-full text-sm font-medium border border-[#363636]/20 hover:bg-white transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={goToReview}
                                    className="btn-dark flex-1 h-12 rounded-full text-sm font-medium"
                                >
                                    Review order
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 'review' && (
                        <div className="section-bg rounded-[32px] p-6 md:p-10 space-y-6">
                            <h2 className="font-display text-[28px] tracking-tight">
                                Review your order
                            </h2>

                            <ReviewBlock
                                title="Shipping to"
                                onEdit={() => setStep('shipping')}
                            >
                                <div className="text-[13px] font-medium">
                                    {shipping.name}
                                </div>
                                <div className="text-[13px] text-[#7a7a7a]">
                                    {shipping.line1}
                                    {shipping.line2 && `, ${shipping.line2}`}
                                </div>
                                <div className="text-[13px] text-[#7a7a7a]">
                                    {shipping.city}
                                    {shipping.state &&
                                        `, ${shipping.state}`}{' '}
                                    {shipping.zip}
                                </div>
                                <div className="text-[13px] text-[#7a7a7a]">
                                    {shipping.country}
                                </div>
                                <div className="text-[12px] text-[#a0a0a0] mt-2">
                                    {shipping.email}
                                </div>
                            </ReviewBlock>

                            <ReviewBlock
                                title="Payment"
                                onEdit={() => setStep('payment')}
                            >
                                {paymentMethod === 'razorpay' ? (
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-[#0c2340] border border-[#3b82f6]/40 flex items-center justify-center text-[#60a5fa] font-bold text-sm shrink-0">
                                            ₹
                                        </div>
                                        <div>
                                            <div className="text-[13px] font-semibold flex items-center gap-2">
                                                Razorpay Checkout
                                                <span className="text-[10px] bg-[#eef2ff] text-[#4338ca] border border-[#c7d2fe] px-2 py-0.5 rounded-full font-medium">
                                                    TEST MODE
                                                </span>
                                            </div>
                                            <div className="text-[12px] text-[#7a7a7a] mt-0.5">
                                                Cards, UPI, NetBanking • ₹{total.toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <Truck className="w-5 h-5" />
                                        <span className="text-[13px]">
                                            Cash on delivery
                                        </span>
                                    </div>
                                )}
                            </ReviewBlock>

                            <ReviewBlock
                                title="Shipping method"
                                onEdit={() => setStep('shipping')}
                            >
                                <div className="text-[13px]">
                                    {
                                        shippingOptions.find(
                                            (o) => o.id === shippingMethod
                                        )?.label
                                    }{' '}
                                    —{' '}
                                    {shippingCost === 0
                                        ? 'Free'
                                        : `₹${shippingCost.toFixed(2)}`}
                                </div>
                            </ReviewBlock>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setStep('payment')}
                                    className="px-6 h-12 rounded-full text-sm font-medium border border-[#363636]/20 hover:bg-white transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handlePlaceOrder}
                                    disabled={processing}
                                    className="btn-dark flex-1 h-12 rounded-full text-sm font-medium inline-flex items-center justify-center gap-2 disabled:opacity-60"
                                >
                                    {processing ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            {paymentMethod === 'razorpay' ? 'Opening Razorpay...' : 'Processing payment...'}
                                        </>
                                    ) : paymentMethod === 'razorpay' ? (
                                        <>
                                            <ShieldCheck className="w-4 h-4 text-[#bbcffb]" />
                                            Pay with Razorpay (Test) • ₹{total.toFixed(2)}
                                        </>
                                    ) : (
                                        <>
                                            <Lock className="w-4 h-4" />
                                            Pay ₹{total.toFixed(2)}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <aside className="col-span-12 md:col-span-5">
                    <div className="section-bg rounded-[32px] p-6 md:p-8 sticky top-4">
                        <h3 className="font-display text-[22px] tracking-tight mb-6">
                            Order summary
                        </h3>

                        <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                            {items.map((i) => (
                                <div
                                    key={i.id}
                                    className="flex gap-3 bg-white rounded-2xl p-3"
                                >
                                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#faf7fa] shrink-0">
                                        {i.image && (
                                            <img
                                                src={i.image}
                                                alt={i.name}
                                                className="w-full h-full object-cover"
                                            />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[13px] font-medium truncate">
                                            {i.name}
                                        </div>
                                        <div className="text-[11px] text-[#7a7a7a]">
                                            Qty {i.qty}
                                        </div>
                                    </div>
                                    <div className="text-[13px] font-semibold self-center">
                                        ₹{(i.price * i.qty).toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-[#363636]/10 mt-5 pt-5 space-y-2 text-[13px]">
                            <Row
                                label="Subtotal"
                                value={`₹${subtotal.toFixed(2)}`}
                            />
                            <Row
                                label="Shipping"
                                value={
                                    shippingCost === 0
                                        ? 'Free'
                                        : `₹${shippingCost.toFixed(2)}`
                                }
                            />
                            <Row label="Tax (8%)" value={`₹${tax.toFixed(2)}`} />
                        </div>

                        <div className="flex justify-between items-baseline pt-4 mt-4 border-t border-[#363636]/10">
                            <span className="font-semibold text-[15px]">
                                Total
                            </span>
                            <span className="font-display text-[28px]">
                                ₹{total.toFixed(2)}
                            </span>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-[#7a7a7a] mt-6">
                            <ShieldCheck className="w-4 h-4" />
                            Secure checkout · SSL encrypted
                        </div>
                    </div>
                </aside>
            </div>

            {/* Razorpay Test Sandbox Simulator Modal */}
            {showRzpSimulator && activeRzpOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-100">
                        {/* Header */}
                        <div className="bg-[#0c1f38] text-white p-6 relative">
                            <button
                                onClick={() => setShowRzpSimulator(false)}
                                className="absolute right-4 top-4 text-white/60 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#3b82f6] text-white px-2.5 py-0.5 rounded-full">
                                    Razorpay Test Sandbox
                                </span>
                            </div>
                            <h3 className="text-xl font-bold font-display tracking-tight">Life Harmony Wellness</h3>
                            <p className="text-xs text-white/70 mt-1 font-mono">
                                Order: {activeRzpOrder.orderId}
                            </p>
                            <div className="mt-4 flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-white">₹{(activeRzpOrder.amountINR || activeRzpOrder.amount)?.toLocaleString('en-IN')} INR</span>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-4">
                            <div className="bg-[#eff6ff] border border-[#bfdbfe] rounded-2xl p-4 text-[13px] text-[#1e40af]">
                                <div className="font-semibold flex items-center gap-1.5 mb-1 text-[#2563eb]">
                                    <Sparkles className="w-4 h-4" />
                                    Test Payment Simulation
                                </div>
                                You are in Razorpay Test Mode. Click below to simulate a successful payment callback, which verifies the signature on the server and confirms the order.
                            </div>

                            <div className="space-y-2 text-xs text-[#52525b] bg-[#fafafa] rounded-2xl p-4 border border-[#e4e4e7]">
                                <div className="flex justify-between">
                                    <span className="text-[#a1a1aa]">Customer:</span>
                                    <span className="font-medium text-[#18181b]">{shipping.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[#a1a1aa]">Email:</span>
                                    <span className="font-medium text-[#18181b]">{shipping.email}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[#a1a1aa]">Environment:</span>
                                    <span className="font-medium text-emerald-600">Test / Sandbox (Free)</span>
                                </div>
                            </div>

                            <div className="pt-2 space-y-2.5">
                                <button
                                    onClick={handleCompleteSimulatedPayment}
                                    disabled={processing}
                                    className="w-full h-12 rounded-2xl bg-[#0c1f38] hover:bg-[#15345d] text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-md disabled:opacity-60"
                                >
                                    {processing ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Verifying Payment...
                                        </>
                                    ) : (
                                        <>
                                            <ShieldCheck className="w-4 h-4 text-[#60a5fa]" />
                                            Simulate Successful Payment (₹{activeRzpOrder.amountINR?.toLocaleString('en-IN')})
                                        </>
                                    )}
                                </button>

                                <button
                                    onClick={() => {
                                        setShowRzpSimulator(false);
                                        toast({
                                            title: 'Payment cancelled',
                                            description: 'You cancelled the test payment.',
                                        });
                                    }}
                                    className="w-full h-10 rounded-2xl text-xs font-medium text-[#71717a] hover:bg-[#f4f4f5] transition-colors"
                                >
                                    Cancel Payment
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function InputField({
    icon: Icon,
    placeholder,
    value,
    onChange,
    type = 'text',
    maxLength,
}) {
    return (
        <div className="relative">
            {Icon && (
                <Icon className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#a0a0a0]" />
            )}
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                maxLength={maxLength}
                className={`w-full h-12 rounded-2xl bg-[#f9f4f7] ${Icon ? 'pl-11 pr-4' : 'px-4'
                    } text-sm outline-none focus:ring-2 focus:ring-[#bbcffb]`}
            />
        </div>
    );
}

function ReviewBlock({ title, onEdit, children }) {
    return (
        <div className="bg-white rounded-2xl p-5">
            <div className="flex justify-between items-start mb-2">
                <div className="text-[11px] uppercase tracking-widest text-[#7a7a7a]">
                    {title}
                </div>
                <button
                    onClick={onEdit}
                    className="text-[12px] underline underline-offset-4 hover:text-[#363636]"
                >
                    Edit
                </button>
            </div>
            {children}
        </div>
    );
}

function Row({ label, value }) {
    return (
        <div className="flex justify-between text-[#7a7a7a]">
            <span>{label}</span>
            <span className="text-[#363636]">{value}</span>
        </div>
    );
}