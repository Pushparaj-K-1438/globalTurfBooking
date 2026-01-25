"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FileText, Shield, Scroll, Scale, Calendar, ChevronRight } from "lucide-react";

export default function TermsPage() {
    const [lastUpdated] = useState("January 1, 2026");

    const sections = [
        {
            id: "acceptance",
            title: "1. Acceptance of Terms",
            content: `By accessing and using BookIt ("the Platform"), you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to abide by these terms, please do not use this service.

The Platform reserves the right to update these terms at any time without prior notice. Your continued use of the service following any changes shall constitute your consent to such changes.`
        },
        {
            id: "services",
            title: "2. Description of Services",
            content: `BookIt provides an online platform that enables:
• Venue owners to list and manage bookable spaces (turfs, hotels, event venues, etc.)
• Users to discover, book, and pay for these venues
• Both parties to communicate and manage bookings

We act as an intermediary and do not own, control, or manage any of the venues listed on our platform.`
        },
        {
            id: "accounts",
            title: "3. User Accounts",
            content: `To access certain features, you must register for an account. You agree to:
• Provide accurate and complete information
• Maintain the security of your password
• Accept responsibility for all activities under your account
• Notify us immediately of any unauthorized use

We reserve the right to suspend or terminate accounts that violate these terms.`
        },
        {
            id: "bookings",
            title: "4. Bookings and Payments",
            content: `When you make a booking:
• You agree to pay all charges at the prices listed
• Payment is processed securely through our payment partners
• Booking confirmations are sent via email
• Cancellation policies vary by venue - please check before booking

Refunds are subject to the individual venue's cancellation policy and our discretion.`
        },
        {
            id: "venue-owners",
            title: "5. Venue Owner Responsibilities",
            content: `Venue owners ("Partners") agree to:
• Provide accurate information about their venues
• Honor all confirmed bookings
• Maintain adequate insurance coverage
• Comply with all applicable laws and regulations
• Respond to booking requests in a timely manner

BookIt charges a service fee on each transaction as outlined in your Partner agreement.`
        },
        {
            id: "prohibited",
            title: "6. Prohibited Activities",
            content: `Users may not:
• Violate any laws or regulations
• Infringe on intellectual property rights
• Submit false or misleading information
• Interfere with the Platform's operation
• Attempt to gain unauthorized access
• Use the service for any illegal purpose
• Harass, abuse, or harm other users`
        },
        {
            id: "liability",
            title: "7. Limitation of Liability",
            content: `BookIt is provided "as is" without warranties of any kind. We are not liable for:
• Actions or omissions of venue owners
• Quality, safety, or legality of listed venues
• Disputes between users and venue owners
• Any indirect, incidental, or consequential damages

Our total liability shall not exceed the amount you paid for the service in the past 12 months.`
        },
        {
            id: "termination",
            title: "8. Termination",
            content: `We may terminate or suspend your account at any time, with or without cause. Upon termination:
• Your right to use the Platform ceases immediately
• Provisions that should survive termination will remain in effect
• We may delete your data in accordance with our Privacy Policy`
        },
        {
            id: "governing-law",
            title: "9. Governing Law",
            content: `These Terms shall be governed by the laws of India. Any disputes shall be resolved in the courts of Bangalore, Karnataka. If any provision is found unenforceable, the remaining provisions will continue in effect.`
        },
        {
            id: "contact",
            title: "10. Contact Information",
            content: `For questions about these Terms, please contact us at:
• Email: legal@bookit.com
• Address: 123 Business Park, Bangalore, Karnataka 560001, India
• Support: support.bookit.com`
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 pt-16">
            {/* Hero */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-16">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Scroll size={32} className="text-emerald-400" />
                    </div>
                    <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
                    <p className="text-slate-300 text-lg">
                        Please read these terms carefully before using our platform.
                    </p>
                    <div className="flex items-center justify-center gap-2 mt-4 text-sm text-slate-400">
                        <Calendar size={16} />
                        Last updated: {lastUpdated}
                    </div>
                </div>
            </div>

            {/* Table of Contents */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-8">
                    <h2 className="text-lg font-bold text-slate-900 mb-4">Table of Contents</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {sections.map((section, idx) => (
                            <a
                                key={section.id}
                                href={`#${section.id}`}
                                className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 text-slate-600 hover:text-emerald-600 transition-colors"
                            >
                                <ChevronRight size={16} />
                                {section.title}
                            </a>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-8 space-y-8">
                        {sections.map((section) => (
                            <section key={section.id} id={section.id} className="scroll-mt-24">
                                <h2 className="text-xl font-bold text-slate-900 mb-4">{section.title}</h2>
                                <div className="text-slate-600 leading-relaxed whitespace-pre-line">
                                    {section.content}
                                </div>
                            </section>
                        ))}
                    </div>
                </div>

                {/* Related Links */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link href="/privacy" className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-100 hover:border-emerald-200 hover:shadow-md transition-all">
                        <Shield size={24} className="text-emerald-600" />
                        <div>
                            <p className="font-semibold text-slate-900">Privacy Policy</p>
                            <p className="text-sm text-slate-500">How we handle your data</p>
                        </div>
                    </Link>
                    <Link href="/refunds" className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-100 hover:border-emerald-200 hover:shadow-md transition-all">
                        <Scale size={24} className="text-emerald-600" />
                        <div>
                            <p className="font-semibold text-slate-900">Refund Policy</p>
                            <p className="text-sm text-slate-500">Returns and cancellations</p>
                        </div>
                    </Link>
                    <Link href="/contact" className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-100 hover:border-emerald-200 hover:shadow-md transition-all">
                        <FileText size={24} className="text-emerald-600" />
                        <div>
                            <p className="font-semibold text-slate-900">Contact Us</p>
                            <p className="text-sm text-slate-500">Get in touch</p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
