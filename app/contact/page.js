"use client";

import { useState } from "react";
import { MapPin, Phone, Mail, Clock, Send, MessageSquare, ArrowRight, Check, Building2, Globe } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSuccess(true);
    setLoading(false);
    setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: "Visit Our Office",
      details: ["123 Business Park, Tech Hub", "Bangalore, Karnataka 560001"],
      action: { label: "Get Directions", href: "https://maps.google.com" }
    },
    {
      icon: Phone,
      title: "Call Us",
      details: ["+91 98765 43210", "+91 87654 32109"],
      action: { label: "Call Now", href: "tel:+919876543210" }
    },
    {
      icon: Mail,
      title: "Email Us",
      details: ["support@bookit.com", "sales@bookit.com"],
      action: { label: "Send Email", href: "mailto:support@bookit.com" }
    },
    {
      icon: Clock,
      title: "Working Hours",
      details: ["Monday - Friday: 9AM - 6PM", "Saturday: 10AM - 4PM"],
      action: null
    },
  ];

  const faqs = [
    { q: "How do I get started?", a: "Simply click 'Get Started' and create your free account. Setup takes less than 5 minutes." },
    { q: "Is there a free trial?", a: "Yes! We offer a 14-day free trial with full access to all features. No credit card required." },
    { q: "Can I customize my booking page?", a: "Absolutely. You can customize colors, logo, and even use your own domain name." },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-16">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-300 rounded-full text-sm font-medium border border-emerald-500/30 mb-6">
            <MessageSquare size={16} /> We're Here to Help
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Get in Touch</h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Have questions about our platform? We'd love to hear from you. Our team is ready to help.
          </p>
        </div>
      </div>

      {/* Contact Cards */}
      <div className="max-w-7xl mx-auto px-4 -mt-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {contactInfo.map((item, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 hover:shadow-xl transition-all duration-300 group">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <item.icon size={28} className="text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
              {item.details.map((detail, i) => (
                <p key={i} className="text-slate-500 text-sm">{detail}</p>
              ))}
              {item.action && (
                <a href={item.action.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-emerald-600 font-medium text-sm mt-4 hover:gap-2 transition-all">
                  {item.action.label} <ArrowRight size={14} />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Send Us a Message</h2>
            <p className="text-slate-500 mb-8">Fill out the form below and we'll get back to you within 24 hours.</p>

            {success ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-emerald-800 mb-2">Message Sent!</h3>
                <p className="text-emerald-600">Thank you for reaching out. We'll respond within 24 hours.</p>
                <button onClick={() => setSuccess(false)} className="mt-6 text-emerald-700 font-medium hover:underline">
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Subject</label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white"
                    >
                      <option value="">Select a topic</option>
                      <option value="general">General Inquiry</option>
                      <option value="sales">Sales & Pricing</option>
                      <option value="support">Technical Support</option>
                      <option value="partnership">Partnership</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Your Message</label>
                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
                    placeholder="Tell us how we can help..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white font-bold rounded-xl hover:from-emerald-700 hover:to-cyan-700 transition-all shadow-lg shadow-emerald-500/30 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={18} /> Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* FAQ Section */}
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Frequently Asked Questions</h2>
            <p className="text-slate-500 mb-8">Quick answers to common questions.</p>

            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all">
                  <h3 className="font-bold text-slate-900 mb-2 flex items-start gap-3">
                    <span className="w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">?</span>
                    {faq.q}
                  </h3>
                  <p className="text-slate-500 pl-9">{faq.a}</p>
                </div>
              ))}
            </div>

            {/* Map Placeholder */}
            <div className="mt-8 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl h-64 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v11/static/77.5946,12.9716,12,0/600x300?access_token=pk.placeholder')] bg-cover bg-center opacity-50"></div>
              <div className="relative text-center z-10">
                <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <MapPin size={24} className="text-white" />
                </div>
                <p className="font-semibold text-slate-700">Bangalore, India</p>
                <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="text-emerald-600 text-sm font-medium hover:underline">
                  View on Google Maps
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-cyan-600 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <Building2 size={48} className="mx-auto mb-4 opacity-80" />
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Business?</h2>
          <p className="text-xl text-white/80 mb-8">Start your 14-day free trial. No credit card required.</p>
          <a href="/register-tenant" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-emerald-600 font-bold rounded-xl hover:bg-slate-100 transition-all shadow-lg">
            Get Started Free <ArrowRight size={20} />
          </a>
        </div>
      </div>
    </div>
  );
}