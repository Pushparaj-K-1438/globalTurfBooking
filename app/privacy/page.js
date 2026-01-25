"use client";

import { useState } from "react";
import Link from "next/link";
import { Shield, Eye, Lock, Database, Globe, UserCheck, Trash2, Calendar, ChevronRight, Mail } from "lucide-react";

export default function PrivacyPage() {
    const [lastUpdated] = useState("January 1, 2026");

    const sections = [
        {
            id: "overview",
            icon: Shield,
            title: "1. Overview",
            content: `This Privacy Policy explains how BookIt ("we", "us", "our") collects, uses, shares, and protects your personal information when you use our platform and services.

We are committed to protecting your privacy and ensuring the security of your personal data. This policy applies to all users of our website, mobile applications, and related services.`
        },
        {
            id: "collection",
            icon: Database,
            title: "2. Information We Collect",
            content: `We collect the following types of information:

**Personal Information:**
• Name, email address, phone number
• Account credentials
• Payment information (processed securely by our payment partners)
• Profile information and preferences

**Usage Information:**
• Device information (browser type, operating system)
• IP address and location data
• Pages visited and features used
• Booking history and preferences

**Communications:**
• Messages between users and venue owners
• Customer support interactions
• Survey responses and feedback`
        },
        {
            id: "usage",
            icon: Eye,
            title: "3. How We Use Your Information",
            content: `We use your information to:

• Process bookings and payments
• Communicate with you about your bookings
• Improve our services and user experience
• Send promotional communications (with your consent)
• Prevent fraud and ensure security
• Comply with legal obligations
• Provide customer support
• Personalize your experience`
        },
        {
            id: "sharing",
            icon: Globe,
            title: "4. Information Sharing",
            content: `We may share your information with:

**Venue Owners:** Basic contact information to fulfill your bookings
**Payment Processors:** To process transactions securely
**Service Providers:** Who help us operate our platform
**Legal Authorities:** When required by law or to protect our rights

We do NOT sell your personal information to third parties.`
        },
        {
            id: "security",
            icon: Lock,
            title: "5. Data Security",
            content: `We implement robust security measures:

• SSL/TLS encryption for data transmission
• AES-256 encryption for sensitive data at rest
• Regular security audits and penetration testing
• Access controls and authentication
• Secure data centers with physical security
• Employee security training

Despite our efforts, no method of transmission over the Internet is 100% secure.`
        },
        {
            id: "rights",
            icon: UserCheck,
            title: "6. Your Rights (GDPR/CCPA)",
            content: `You have the right to:

**Access:** Request a copy of your personal data
**Rectification:** Correct any inaccurate information
**Erasure:** Request deletion of your data ("Right to be Forgotten")
**Portability:** Receive your data in a portable format
**Restrict Processing:** Limit how we use your data
**Object:** Opt-out of certain processing activities
**Withdraw Consent:** Revoke previously given consent

To exercise these rights, contact us at privacy@bookit.com or use the settings in your account dashboard.`
        },
        {
            id: "cookies",
            icon: Database,
            title: "7. Cookies & Tracking",
            content: `We use cookies and similar technologies for:

**Essential Cookies:** Required for the platform to function
**Analytics Cookies:** Help us understand usage patterns
**Marketing Cookies:** Enable personalized advertising (with consent)

You can manage cookie preferences through your browser settings or our cookie consent tool. Note that disabling certain cookies may affect functionality.`
        },
        {
            id: "retention",
            icon: Trash2,
            title: "8. Data Retention",
            content: `We retain your data for:

• **Active Accounts:** For the duration of your account
• **Booking Records:** 7 years (for legal/tax compliance)
• **Marketing Data:** Until you unsubscribe
• **Audit Logs:** 90 days

After these periods, data is securely deleted or anonymized.`
        },
        {
            id: "international",
            icon: Globe,
            title: "9. International Transfers",
            content: `Your data may be transferred to and processed in countries outside your residence. We ensure appropriate safeguards are in place, including:

• Standard Contractual Clauses (SCCs)
• Adequacy decisions by relevant authorities
• Privacy Shield certification (where applicable)`
        },
        {
            id: "contact",
            icon: Mail,
            title: "10. Contact Us",
            content: `For privacy-related inquiries:

**Data Protection Officer:**
Email: privacy@bookit.com

**Mailing Address:**
BookIt Legal Team
123 Business Park
Bangalore, Karnataka 560001, India

**Response Time:** We respond to requests within 30 days.`
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 pt-16">
            {/* Hero */}
            <div className="bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 text-white py-16">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Shield size={32} className="text-emerald-400" />
                    </div>
                    <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
                    <p className="text-slate-300 text-lg">
                        Your privacy matters. Learn how we collect, use, and protect your data.
                    </p>
                    <div className="flex items-center justify-center gap-2 mt-4 text-sm text-slate-400">
                        <Calendar size={16} />
                        Last updated: {lastUpdated}
                    </div>
                </div>
            </div>

            {/* Quick Summary */}
            <div className="max-w-4xl mx-auto px-4 -mt-8">
                <div className="bg-gradient-to-r from-emerald-600 to-cyan-600 rounded-2xl p-6 text-white shadow-xl">
                    <h2 className="font-bold text-lg mb-2">🔒 Privacy at a Glance</h2>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <li className="flex items-center gap-2"><Shield size={14} /> We never sell your data</li>
                        <li className="flex items-center gap-2"><Lock size={14} /> End-to-end encryption</li>
                        <li className="flex items-center gap-2"><UserCheck size={14} /> Full GDPR compliance</li>
                        <li className="flex items-center gap-2"><Trash2 size={14} /> Delete your data anytime</li>
                    </ul>
                </div>
            </div>

            {/* Table of Contents */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-8">
                    <h2 className="text-lg font-bold text-slate-900 mb-4">Table of Contents</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {sections.map((section) => (
                            <a
                                key={section.id}
                                href={`#${section.id}`}
                                className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 text-slate-600 hover:text-emerald-600 transition-colors"
                            >
                                <section.icon size={16} />
                                {section.title}
                            </a>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-8 space-y-10">
                        {sections.map((section) => (
                            <section key={section.id} id={section.id} className="scroll-mt-24">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                        <section.icon size={20} className="text-emerald-600" />
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-900">{section.title}</h2>
                                </div>
                                <div className="text-slate-600 leading-relaxed whitespace-pre-line pl-13">
                                    {section.content}
                                </div>
                            </section>
                        ))}
                    </div>
                </div>

                {/* Data Request CTA */}
                <div className="mt-8 bg-slate-900 rounded-2xl p-8 text-white text-center">
                    <h3 className="text-xl font-bold mb-2">Want to exercise your data rights?</h3>
                    <p className="text-slate-400 mb-6">Download your data or request deletion from your account settings.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/admin/settings" className="px-6 py-3 bg-emerald-600 rounded-xl font-semibold hover:bg-emerald-700 transition-colors">
                            Manage My Data
                        </Link>
                        <Link href="/contact" className="px-6 py-3 border border-white/20 rounded-xl font-semibold hover:bg-white/10 transition-colors">
                            Contact Privacy Team
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
