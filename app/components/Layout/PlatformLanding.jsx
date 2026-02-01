"use client";

import Link from "next/link";
import { Search, MapPin, Calendar, Star, Shield, Zap, Globe, Users, Building2, ArrowRight, ChevronRight, Play } from "lucide-react";
import { useState, useEffect } from "react";

export default function PlatformLanding() {
    const [featuredTenants, setFeaturedTenants] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFeatured();
    }, []);

    const fetchFeatured = async () => {
        try {
            const res = await fetch('/api/public/tenants');
            const data = await res.json();
            if (data.tenants) setFeaturedTenants(data.tenants);
        } catch (error) { console.error("Failed to fetch featured tenants"); }
        finally { setLoading(false); }
    };

    const features = [
        { icon: Building2, title: 'Multi-Tenant Architecture', desc: 'Secure isolated environments for each business with dedicated customization' },
        { icon: Globe, title: 'Global Reach', desc: 'Multi-currency, multi-language support with localized payment gateways' },
        { icon: Shield, title: 'Enterprise Security', desc: 'Role-based access, data encryption, and compliance-ready infrastructure' },
        { icon: Zap, title: 'Lightning Fast', desc: 'Optimized for speed with instant booking confirmations and real-time sync' },
        { icon: Calendar, title: 'Smart Scheduling', desc: 'Dynamic pricing, buffer times, and intelligent availability management' },
        { icon: Users, title: 'White Label Ready', desc: 'Custom domains, branding, and themes for complete brand control' },
    ];

    const stats = [
        { value: '10K+', label: 'Active Listings' },
        { value: '500+', label: 'Partner Businesses' },
        { value: '1M+', label: 'Bookings Made' },
        { value: '99.9%', label: 'Uptime SLA' },
    ];

    return (
        <div className="min-h-screen bg-white font-sans pt-16">
            {/* Hero Section */}
            <section className="pt-16 pb-20 bg-gradient-to-b from-slate-50 to-white overflow-hidden">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium mb-6">
                                <Zap size={14} /> The #1 Multi-Tenant Booking Platform
                            </div>
                            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 leading-tight mb-6">
                                Launch Your <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">Booking Empire</span> in Minutes
                            </h1>
                            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                                Whether you manage turfs, hotels, coworking spaces, or event venues — our platform gives you the power to scale globally with enterprise-grade features.
                            </p>
                            <div className="flex flex-wrap items-center gap-4 mb-12">
                                <Link href="/register-tenant" className="px-8 py-4 bg-emerald-600 text-white text-lg font-semibold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/30 flex items-center gap-2">
                                    Start Free Trial <ArrowRight size={20} />
                                </Link>
                                <Link href="/browse" className="px-8 py-4 border-2 border-slate-200 text-slate-700 text-lg font-semibold rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2">
                                    <Search size={20} /> Browse Venues
                                </Link>
                            </div>
                            {/* Trust Badges */}
                            <div className="flex items-center gap-6 text-sm text-slate-500">
                                <span className="flex items-center gap-2"><Shield size={16} className="text-emerald-500" /> SOC2 Compliant</span>
                                <span className="flex items-center gap-2"><Star size={16} className="text-amber-500" /> 4.9/5 Rating</span>
                                <span className="flex items-center gap-2"><Users size={16} className="text-blue-500" /> 500+ Partners</span>
                            </div>
                        </div>
                        <div className="relative hidden lg:block">
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-blue-500/20 rounded-3xl blur-3xl"></div>
                            <div className="relative bg-white rounded-3xl shadow-2xl p-6 border border-slate-200">
                                <div className="bg-slate-50 rounded-2xl p-4 mb-4">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                        <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                                        <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="h-8 bg-slate-200 rounded-lg w-3/4"></div>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-lg"></div>)}
                                        </div>
                                        <div className="h-12 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-semibold">Book Now</div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500">Live Preview</span>
                                    <span className="text-emerald-600 font-medium flex items-center gap-1"><Play size={14} /> See Demo</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-16 bg-slate-900">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, idx) => (
                            <div key={idx} className="text-center">
                                <p className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.value}</p>
                                <p className="text-slate-400">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Partners */}
            {featuredTenants.length > 0 && (
                <section className="py-20">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="flex items-end justify-between mb-10">
                            <div>
                                <h2 className="text-3xl font-bold text-slate-900 mb-2">Our Trusted Partners</h2>
                                <p className="text-slate-500">Businesses powering their growth with us</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {featuredTenants.map(tenant => (
                                <Link key={tenant._id} href={`/v/${tenant.slug}`} className="group">
                                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col">
                                        <div className="h-32 bg-slate-100 flex items-center justify-center p-6 relative overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 group-hover:scale-110 transition-transform duration-500"></div>
                                            {tenant.settings?.logo ? (
                                                <img src={tenant.settings.logo} alt={tenant.name} className="h-16 w-auto object-contain relative z-10" />
                                            ) : (
                                                <div className="w-16 h-16 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-2xl font-bold relative z-10 shadow-lg">
                                                    {tenant.name.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-6 flex-1 flex flex-col">
                                            <h3 className="font-bold text-slate-900 mb-2 text-lg">{tenant.name}</h3>
                                            <p className="text-sm text-slate-500 mb-4 font-mono">@{tenant.slug}</p>

                                            <div className="mt-auto flex flex-wrap gap-2">
                                                {tenant.modules?.slice(0, 3).map(mod => (
                                                    <span key={mod} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md capitalize font-medium">{mod}</span>
                                                ))}
                                                {tenant.modules?.length > 3 && <span className="px-2 py-1 bg-slate-100 text-slate-400 text-xs rounded-md">+{(tenant.modules.length - 3)}</span>}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Features */}
            <section id="features" className="py-20 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Everything You Need to Scale</h2>
                        <p className="text-xl text-slate-500 max-w-2xl mx-auto">From multi-currency support to white-labeling, we provide enterprise-grade features for growing businesses.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, idx) => (
                            <div key={idx} className="bg-white p-8 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:shadow-lg transition-all duration-300 group">
                                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                    <feature.icon size={28} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                                <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-gradient-to-r from-emerald-600 to-blue-600">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Transform Your Business?</h2>
                    <p className="text-xl text-white/80 mb-8">Join 500+ businesses already using our platform to manage bookings effortlessly.</p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link href="/register-tenant" className="px-8 py-4 bg-white text-emerald-600 text-lg font-semibold rounded-xl hover:bg-slate-100 transition-colors shadow-lg flex items-center gap-2">
                            Start Free Trial <ArrowRight size={20} />
                        </Link>
                        <Link href="/contact" className="px-8 py-4 border-2 border-white text-white text-lg font-semibold rounded-xl hover:bg-white/10 transition-colors">
                            Contact Sales
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
