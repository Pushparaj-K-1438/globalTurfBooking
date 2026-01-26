"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Building2, Mail, Lock, Phone, Globe, ArrowRight, Check, Zap, Shield, Users, Sparkles, Star } from "lucide-react";

export default function RegisterTenant() {
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        email: "",
        password: "",
        mobile: "",
    });
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const res = await fetch("/api/tenants/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            if (res.ok) {
                setMessage({ type: "success", text: data.message });
                setTimeout(() => router.push("/login"), 3000);
            } else {
                setMessage({ type: "error", text: data.error });
            }
        } catch (error) {
            setMessage({ type: "error", text: "Something went wrong. Please try again." });
        } finally {
            setLoading(false);
        }
    };

    const generateSlug = (name) => {
        return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    };

    const features = [
        { icon: Zap, text: "Set up in minutes, not weeks" },
        { icon: Shield, text: "Enterprise-grade security" },
        { icon: Users, text: "Unlimited team members" },
        { icon: Globe, text: "Custom domain support" },
    ];

    const testimonials = [
        { name: "Rahul Sharma", business: "SportX Arena", text: "Increased bookings by 300% in 3 months" },
        { name: "Priya Patel", business: "Wellness Hub", text: "The best platform we've ever used" },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 pt-16">
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Left Side - Value Proposition */}
                    <div className="text-white space-y-8 hidden lg:block">
                        <div>
                            <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-300 rounded-full text-sm font-medium border border-emerald-500/30 mb-6">
                                <Sparkles size={16} /> 14-Day Free Trial
                            </span>
                            <h1 className="text-4xl xl:text-5xl font-bold leading-tight mb-4">
                                Launch Your <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Booking Empire</span> Today
                            </h1>
                            <p className="text-xl text-slate-300 leading-relaxed">
                                Join 500+ businesses already using BookIt to manage appointments, turfs, hotels, and more.
                            </p>
                        </div>

                        {/* Features */}
                        <div className="grid grid-cols-2 gap-4">
                            {features.map((feature, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
                                    <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                                        <feature.icon size={20} className="text-emerald-400" />
                                    </div>
                                    <span className="text-sm font-medium text-slate-200">{feature.text}</span>
                                </div>
                            ))}
                        </div>

                        {/* Social Proof */}
                        <div className="space-y-4 pt-4">
                            <div className="flex items-center gap-4">
                                <div className="flex -space-x-3">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 border-2 border-slate-800 flex items-center justify-center text-white font-bold text-xs">
                                            {String.fromCharCode(64 + i)}
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <div className="flex items-center gap-1 text-amber-400">
                                        {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} fill="currentColor" />)}
                                    </div>
                                    <p className="text-sm text-slate-400">Rated 4.9/5 by 500+ businesses</p>
                                </div>
                            </div>
                        </div>

                        {/* Testimonial */}
                        <div className="bg-white/5 rounded-2xl p-6 border border-white/10 backdrop-blur-sm">
                            <p className="text-lg text-slate-200 italic mb-4">"BookIt transformed our business. We went from manual spreadsheets to a fully automated booking system in just one day."</p>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-bold">RS</div>
                                <div>
                                    <p className="font-semibold text-white">Rahul Sharma</p>
                                    <p className="text-sm text-slate-400">Founder, SportX Arena</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Registration Form */}
                    <div className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto">
                        <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 relative overflow-hidden">
                            {/* Decorative Elements */}
                            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 rounded-full blur-3xl -z-10"></div>

                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30">
                                    <Building2 size={32} className="text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900">Create Your Account</h2>
                                <p className="text-slate-500 mt-1">Start your 14-day free trial</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Business Name */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Business Name</label>
                                    <div className="relative">
                                        <Building2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            required
                                            className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                            placeholder="e.g., Premium Sports Arena"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value, slug: generateSlug(e.target.value) })}
                                        />
                                    </div>
                                </div>

                                {/* Subdomain */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Your Subdomain</label>
                                    <div className="flex items-center gap-2">
                                        <div className="relative flex-1">
                                            <Globe size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type="text"
                                                required
                                                className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                                placeholder="my-business"
                                                value={formData.slug}
                                                onChange={(e) => setFormData({ ...formData, slug: generateSlug(e.target.value) })}
                                            />
                                        </div>
                                        <span className="text-slate-400 font-medium">.bookit.com</span>
                                    </div>
                                    {formData.slug && (
                                        <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                                            <Check size={12} /> {formData.slug}.bookit.com is available
                                        </p>
                                    )}
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Admin Email</label>
                                    <div className="relative">
                                        <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="email"
                                            required
                                            className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                            placeholder="you@company.com"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                                    <div className="relative">
                                        <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="password"
                                            required
                                            className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                            placeholder="Min. 8 characters"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
                                    <div className="relative">
                                        <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="tel"
                                            required
                                            className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                            placeholder="+91 98765 43210"
                                            value={formData.mobile}
                                            onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Message */}
                                {message && (
                                    <div className={`p-4 rounded-xl ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                        <p className="text-sm font-medium flex items-center gap-2">
                                            {message.type === 'success' ? <Check size={16} /> : '⚠️'} {message.text}
                                        </p>
                                    </div>
                                )}

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white font-bold rounded-xl hover:from-emerald-700 hover:to-cyan-700 transition-all shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Creating Account...
                                        </>
                                    ) : (
                                        <>
                                            Start Free Trial <ArrowRight size={20} />
                                        </>
                                    )}
                                </button>

                                {/* Terms */}
                                <p className="text-xs text-center text-slate-500">
                                    By signing up, you agree to our{" "}
                                    <Link href="/terms" className="text-emerald-600 hover:underline">Terms of Service</Link> and{" "}
                                    <Link href="/privacy" className="text-emerald-600 hover:underline">Privacy Policy</Link>
                                </p>

                                {/* Login Link */}
                                <p className="text-center text-slate-600 pt-4 border-t border-slate-100">
                                    Already have an account?{" "}
                                    <Link href="/login" className="text-emerald-600 font-semibold hover:underline">Sign in</Link>
                                </p>
                            </form>
                        </div>

                        {/* Trust Badges */}
                        <div className="mt-6 flex items-center justify-center gap-6 text-slate-400 text-sm">
                            <span className="flex items-center gap-1"><Shield size={14} /> SSL Secured</span>
                            <span className="flex items-center gap-1"><Check size={14} /> No Credit Card</span>
                            <span className="flex items-center gap-1"><Zap size={14} /> Instant Setup</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
