"use client";

import { useState } from "react";
import Link from "next/link";
import { RefreshCw, Calendar, Clock, AlertCircle, CheckCircle, XCircle, HelpCircle } from "lucide-react";

export default function RefundsPage() {
    const [lastUpdated] = useState("January 1, 2026");

    const refundScenarios = [
        {
            title: "Cancellation by Customer",
            icon: XCircle,
            items: [
                { time: "72+ hours before", refund: "100% refund", color: "emerald" },
                { time: "24-72 hours before", refund: "75% refund", color: "emerald" },
                { time: "Less than 24 hours", refund: "50% refund", color: "amber" },
                { time: "No-show", refund: "No refund", color: "red" }
            ]
        },
        {
            title: "Cancellation by Venue",
            icon: AlertCircle,
            items: [
                { time: "Any time", refund: "100% refund", color: "emerald" },
                { time: "Last-minute cancellation", refund: "100% + 10% credit", color: "emerald" }
            ]
        },
        {
            title: "Service Issues",
            icon: HelpCircle,
            items: [
                { time: "Major issues reported", refund: "Up to 100% refund", color: "emerald" },
                { time: "Minor issues", refund: "Partial refund (case-by-case)", color: "amber" }
            ]
        }
    ];

    const faqs = [
        {
            q: "How long does a refund take?",
            a: "Refunds are typically processed within 5-7 business days. The amount will be credited to your original payment method."
        },
        {
            q: "Can I get a refund after the booking?",
            a: "Yes, if you experienced significant issues that affected your experience. Contact our support team with details and evidence within 48 hours of your booking."
        },
        {
            q: "What if the venue overbooked?",
            a: "You'll receive a full refund plus a 10% credit on your next booking. We take overbooking very seriously."
        },
        {
            q: "Are service fees refundable?",
            a: "Service fees are fully refundable for cancellations made 72+ hours in advance. For later cancellations, service fees may be retained."
        },
        {
            q: "What about weather-related cancellations?",
            a: "For outdoor venues, weather-related cancellations by either party are eligible for full refund or free rescheduling."
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 pt-16">
            {/* Hero */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-16">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <RefreshCw size={32} className="text-emerald-400" />
                    </div>
                    <h1 className="text-4xl font-bold mb-4">Refund & Cancellation Policy</h1>
                    <p className="text-slate-300 text-lg">
                        Transparent policies to protect both customers and venue partners.
                    </p>
                    <div className="flex items-center justify-center gap-2 mt-4 text-sm text-slate-400">
                        <Calendar size={16} />
                        Last updated: {lastUpdated}
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-12">
                {/* Quick Overview */}
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 mb-8">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Refund Timeline Overview</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[
                            { time: "72+ hrs", rate: "100%", color: "bg-emerald-500" },
                            { time: "24-72 hrs", rate: "75%", color: "bg-emerald-400" },
                            { time: "<24 hrs", rate: "50%", color: "bg-amber-500" },
                            { time: "No-show", rate: "0%", color: "bg-red-500" }
                        ].map((item, idx) => (
                            <div key={idx} className="text-center">
                                <div className={`${item.color} text-white rounded-xl py-4 mb-2`}>
                                    <p className="text-3xl font-bold">{item.rate}</p>
                                </div>
                                <p className="text-sm text-slate-600">{item.time} before booking</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Detailed Scenarios */}
                <div className="space-y-6 mb-12">
                    {refundScenarios.map((scenario, idx) => (
                        <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                                    <scenario.icon size={20} className="text-slate-600" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">{scenario.title}</h3>
                            </div>
                            <div className="space-y-3">
                                {scenario.items.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <Clock size={16} className="text-slate-400" />
                                            <span className="text-slate-700">{item.time}</span>
                                        </div>
                                        <span className={`font-semibold ${item.color === 'emerald' ? 'text-emerald-600' :
                                                item.color === 'amber' ? 'text-amber-600' : 'text-red-600'
                                            }`}>
                                            {item.refund}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* How to Request Refund */}
                <div className="bg-gradient-to-r from-emerald-600 to-cyan-600 rounded-2xl p-8 text-white mb-12">
                    <h2 className="text-2xl font-bold mb-4">How to Request a Refund</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { step: "1", title: "Go to My Bookings", desc: "Find the booking you want to cancel" },
                            { step: "2", title: "Click Cancel", desc: "Select your cancellation reason" },
                            { step: "3", title: "Confirm Refund", desc: "Refund processed in 5-7 days" }
                        ].map((item, idx) => (
                            <div key={idx} className="text-center">
                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">
                                    {item.step}
                                </div>
                                <h3 className="font-bold mb-1">{item.title}</h3>
                                <p className="text-sm text-white/80">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* FAQs */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        {faqs.map((faq, idx) => (
                            <div key={idx} className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
                                <h3 className="font-bold text-slate-900 mb-2 flex items-start gap-2">
                                    <span className="w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">?</span>
                                    {faq.q}
                                </h3>
                                <p className="text-slate-600 pl-8">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Important Notes */}
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-12">
                    <h3 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
                        <AlertCircle size={20} /> Important Notes
                    </h3>
                    <ul className="space-y-2 text-amber-700 text-sm">
                        <li>• Individual venues may have stricter cancellation policies - always check before booking</li>
                        <li>• Promotional bookings may have different refund terms</li>
                        <li>• Refund amounts are calculated based on the booking time, not request time</li>
                        <li>• Disputes must be raised within 7 days of the booking date</li>
                    </ul>
                </div>

                {/* Contact */}
                <div className="text-center">
                    <p className="text-slate-600 mb-4">Need help with a refund?</p>
                    <Link href="/contact" className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors">
                        Contact Support
                    </Link>
                </div>
            </div>
        </div>
    );
}
