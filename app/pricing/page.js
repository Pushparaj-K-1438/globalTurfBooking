"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, X, Zap, Crown, Building2, Rocket, ArrowRight, HelpCircle } from "lucide-react";

export default function PricingPage() {
    const [billingCycle, setBillingCycle] = useState('monthly');

    const plans = [
        {
            name: "Starter",
            icon: Zap,
            description: "Perfect for small venues just getting started",
            price: { monthly: 999, yearly: 9990 },
            features: [
                { name: "Up to 3 listings", included: true },
                { name: "100 bookings/month", included: true },
                { name: "Email support", included: true },
                { name: "Basic analytics", included: true },
                { name: "1 team member", included: true },
                { name: "Custom domain", included: false },
                { name: "API access", included: false },
                { name: "White-labeling", included: false },
                { name: "Priority support", included: false }
            ],
            commissionRate: 5,
            cta: "Start Free Trial",
            popular: false
        },
        {
            name: "Professional",
            icon: Crown,
            description: "For growing businesses with multiple venues",
            price: { monthly: 2499, yearly: 24990 },
            features: [
                { name: "Up to 10 listings", included: true },
                { name: "Unlimited bookings", included: true },
                { name: "Priority email support", included: true },
                { name: "Advanced analytics", included: true },
                { name: "5 team members", included: true },
                { name: "Custom domain", included: true },
                { name: "API access", included: true },
                { name: "White-labeling", included: false },
                { name: "Dedicated support", included: false }
            ],
            commissionRate: 3,
            cta: "Start Free Trial",
            popular: true,
            badge: "Most Popular"
        },
        {
            name: "Business",
            icon: Building2,
            description: "For large organizations with advanced needs",
            price: { monthly: 4999, yearly: 49990 },
            features: [
                { name: "Unlimited listings", included: true },
                { name: "Unlimited bookings", included: true },
                { name: "24/7 phone support", included: true },
                { name: "Premium analytics", included: true },
                { name: "Unlimited team members", included: true },
                { name: "Custom domain", included: true },
                { name: "Full API access", included: true },
                { name: "White-labeling", included: true },
                { name: "Dedicated account manager", included: true }
            ],
            commissionRate: 2,
            cta: "Start Free Trial",
            popular: false
        },
        {
            name: "Enterprise",
            icon: Rocket,
            description: "Custom solutions for enterprise clients",
            price: { monthly: null, yearly: null },
            features: [
                { name: "Everything in Business", included: true },
                { name: "Custom integrations", included: true },
                { name: "SLA guarantee", included: true },
                { name: "On-premise deployment", included: true },
                { name: "Custom development", included: true },
                { name: "Training & onboarding", included: true },
                { name: "Dedicated infrastructure", included: true },
                { name: "SSO/SAML integration", included: true },
                { name: "Custom commission rates", included: true }
            ],
            commissionRate: "Custom",
            cta: "Contact Sales",
            popular: false
        }
    ];

    const faqs = [
        {
            q: "Is there a free trial?",
            a: "Yes! All paid plans come with a 14-day free trial. No credit card required to start."
        },
        {
            q: "Can I change plans later?",
            a: "Absolutely. You can upgrade or downgrade your plan anytime. Changes take effect immediately."
        },
        {
            q: "What payment methods do you accept?",
            a: "We accept UPI, credit/debit cards, net banking, and wire transfers for enterprise plans."
        },
        {
            q: "What's the commission rate?",
            a: "We charge a small percentage on each booking (varies by plan). This is in addition to your subscription fee."
        },
        {
            q: "Do you offer discounts?",
            a: "Yes! Annual billing saves you up to 17%. We also offer discounts for NGOs and educational institutions."
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 pt-16">
            {/* Hero */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 text-white py-20">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Simple, Transparent Pricing</h1>
                    <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-8">
                        Choose the plan that fits your business. All plans include a 14-day free trial.
                    </p>

                    {/* Billing Toggle */}
                    <div className="inline-flex items-center bg-white/10 rounded-full p-1">
                        <button
                            onClick={() => setBillingCycle('monthly')}
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${billingCycle === 'monthly' ? 'bg-white text-slate-900' : 'text-white/80 hover:text-white'
                                }`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setBillingCycle('yearly')}
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${billingCycle === 'yearly' ? 'bg-white text-slate-900' : 'text-white/80 hover:text-white'
                                }`}
                        >
                            Yearly <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full">Save 17%</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Pricing Cards */}
            <div className="max-w-7xl mx-auto px-4 -mt-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {plans.map((plan, idx) => (
                        <div
                            key={idx}
                            className={`bg-white rounded-2xl shadow-lg border-2 transition-all hover:shadow-xl relative ${plan.popular ? 'border-emerald-500 scale-105 z-10' : 'border-slate-100'
                                }`}
                        >
                            {plan.badge && (
                                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                    <span className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-sm font-bold px-4 py-1 rounded-full">
                                        {plan.badge}
                                    </span>
                                </div>
                            )}

                            <div className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${plan.popular ? 'bg-emerald-100' : 'bg-slate-100'
                                        }`}>
                                        <plan.icon size={24} className={plan.popular ? 'text-emerald-600' : 'text-slate-600'} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                                    </div>
                                </div>

                                <p className="text-slate-500 text-sm mb-6">{plan.description}</p>

                                <div className="mb-6">
                                    {plan.price.monthly ? (
                                        <>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-4xl font-bold text-slate-900">
                                                    ₹{(billingCycle === 'monthly' ? plan.price.monthly : Math.round(plan.price.yearly / 12)).toLocaleString()}
                                                </span>
                                                <span className="text-slate-500">/month</span>
                                            </div>
                                            {billingCycle === 'yearly' && (
                                                <p className="text-sm text-slate-500 mt-1">
                                                    Billed ₹{plan.price.yearly.toLocaleString()}/year
                                                </p>
                                            )}
                                        </>
                                    ) : (
                                        <div className="text-2xl font-bold text-slate-900">Custom Pricing</div>
                                    )}
                                    <p className="text-xs text-slate-400 mt-2">
                                        + {plan.commissionRate}% per booking
                                    </p>
                                </div>

                                <Link
                                    href={plan.price.monthly ? "/register-tenant" : "/contact"}
                                    className={`w-full py-3 rounded-xl font-bold text-center block transition-all ${plan.popular
                                            ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white hover:from-emerald-700 hover:to-cyan-700 shadow-lg shadow-emerald-500/20'
                                            : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                                        }`}
                                >
                                    {plan.cta}
                                </Link>
                            </div>

                            <div className="border-t border-slate-100 p-6">
                                <p className="text-sm font-semibold text-slate-900 mb-4">What's included:</p>
                                <ul className="space-y-3">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm">
                                            {feature.included ? (
                                                <Check size={16} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                                            ) : (
                                                <X size={16} className="text-slate-300 mt-0.5 flex-shrink-0" />
                                            )}
                                            <span className={feature.included ? 'text-slate-700' : 'text-slate-400'}>
                                                {feature.name}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* FAQs */}
            <div className="max-w-4xl mx-auto px-4 py-20">
                <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">Frequently Asked Questions</h2>
                <div className="space-y-4">
                    {faqs.map((faq, idx) => (
                        <div key={idx} className="bg-white rounded-xl p-6 border border-slate-100">
                            <h3 className="font-bold text-slate-900 mb-2 flex items-start gap-2">
                                <HelpCircle size={18} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                                {faq.q}
                            </h3>
                            <p className="text-slate-600 pl-6">{faq.a}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-r from-emerald-600 to-cyan-600 py-16">
                <div className="max-w-4xl mx-auto px-4 text-center text-white">
                    <h2 className="text-3xl font-bold mb-4">Ready to grow your business?</h2>
                    <p className="text-xl text-white/80 mb-8">Start your 14-day free trial today. No credit card required.</p>
                    <Link
                        href="/register-tenant"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-white text-emerald-600 font-bold rounded-xl hover:bg-slate-100 transition-all shadow-lg"
                    >
                        Get Started Free <ArrowRight size={20} />
                    </Link>
                </div>
            </div>
        </div>
    );
}
