"use client";

import { useState, useEffect } from "react";
import { Palette, Save, Globe, Image as ImageIcon, Facebook, Instagram, Twitter, Linkedin, Youtube } from "lucide-react";
import { toast } from "react-toastify";

export default function BrandingPage() {
    const [branding, setBranding] = useState({
        logo: "",
        logoLight: "",
        favicon: "",
        primaryColor: "#10b981",
        secondaryColor: "#3b82f6",
        accentColor: "#f59e0b",
        backgroundColor: "#ffffff",
        textColor: "#1e293b",
        fontFamily: "Inter",
        customDomain: "",
        metaTitle: "",
        metaDescription: "",
        socialLinks: {
            facebook: "",
            instagram: "",
            twitter: "",
            linkedin: "",
            youtube: "",
        }
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => { fetchBranding(); }, []);

    const fetchBranding = async () => {
        try {
            const res = await fetch("/api/admin/branding");
            const data = await res.json();
            if (data && !data.error) {
                setBranding(prev => ({ ...prev, ...data }));
            }
        } catch (error) { console.error("Failed to fetch branding"); }
        finally { setLoading(false); }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/admin/branding", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(branding),
            });
            if (res.ok) {
                toast.success("Branding saved successfully");
            } else {
                toast.error("Failed to save branding");
            }
        } catch (error) { toast.error("An error occurred"); }
        finally { setSaving(false); }
    };

    const handleFileUpload = (e, field) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                toast.error("File size too large (max 2MB)");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setBranding(prev => ({ ...prev, [field]: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const fonts = ["Inter", "Roboto", "Open Sans", "Lato", "Poppins", "Montserrat", "Outfit"];

    if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-600"></div></div>;

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 p-8">
            <header className="mb-10 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Brand Customization</h1>
                    <p className="text-slate-500 mt-1">Customize the look and feel of your booking pages</p>
                </div>
                <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50">
                    <Save className="w-4 h-4" /><span>{saving ? "Saving..." : "Save Changes"}</span>
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Colors */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2.5 bg-purple-100 text-purple-600 rounded-xl"><Palette size={20} /></div>
                            <h2 className="text-lg font-bold text-slate-900">Colors</h2>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {[
                                { key: 'primaryColor', label: 'Primary' },
                                { key: 'secondaryColor', label: 'Secondary' },
                                { key: 'accentColor', label: 'Accent' },
                                { key: 'backgroundColor', label: 'Background' },
                                { key: 'textColor', label: 'Text' },
                            ].map(({ key, label }) => (
                                <div key={key}>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{label}</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={branding[key]}
                                            onChange={(e) => setBranding({ ...branding, [key]: e.target.value })}
                                            className="w-12 h-10 rounded-lg border border-slate-200 cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={branding[key]}
                                            onChange={(e) => setBranding({ ...branding, [key]: e.target.value })}
                                            className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                        />
                                    </div>
                                </div>
                            ))}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Font Family</label>
                                <select
                                    value={branding.fontFamily}
                                    onChange={(e) => setBranding({ ...branding, fontFamily: e.target.value })}
                                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                >
                                    {fonts.map(font => <option key={font} value={font}>{font}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Logos */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl"><ImageIcon size={20} /></div>
                            <h2 className="text-lg font-bold text-slate-900">Logos & Media</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Logo</label>
                                <div className="space-y-2">
                                    <div className="flex gap-2">
                                        <input type="text" value={branding.logo} onChange={(e) => setBranding({ ...branding, logo: e.target.value })} placeholder="https://..." className="flex-1 border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none" />
                                        <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2.5 rounded-lg font-medium transition-colors">
                                            Upload
                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'logo')} />
                                        </label>
                                    </div>
                                    {branding.logo && <img src={branding.logo} alt="Preview" className="h-8 object-contain" />}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Light Logo</label>
                                <div className="space-y-2">
                                    <div className="flex gap-2">
                                        <input type="text" value={branding.logoLight} onChange={(e) => setBranding({ ...branding, logoLight: e.target.value })} placeholder="https://..." className="flex-1 border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none" />
                                        <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2.5 rounded-lg font-medium transition-colors">
                                            Upload
                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'logoLight')} />
                                        </label>
                                    </div>
                                    {branding.logoLight && <div className="bg-slate-800 p-2 rounded"><img src={branding.logoLight} alt="Preview" className="h-8 object-contain" /></div>}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Favicon</label>
                                <div className="space-y-2">
                                    <div className="flex gap-2">
                                        <input type="text" value={branding.favicon} onChange={(e) => setBranding({ ...branding, favicon: e.target.value })} placeholder="https://..." className="flex-1 border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none" />
                                        <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2.5 rounded-lg font-medium transition-colors">
                                            Upload
                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'favicon')} />
                                        </label>
                                    </div>
                                    {branding.favicon && <img src={branding.favicon} alt="Preview" className="h-8 w-8 object-contain" />}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SEO */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-xl"><Globe size={20} /></div>
                            <h2 className="text-lg font-bold text-slate-900">SEO & Domain</h2>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Custom Domain</label>
                                <input type="text" value={branding.customDomain} onChange={(e) => setBranding({ ...branding, customDomain: e.target.value })} placeholder="booking.yoursite.com" className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none" />
                                <p className="text-xs text-slate-400 mt-1">Point your domain's CNAME to our servers to use a custom domain</p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Meta Title</label>
                                <input type="text" value={branding.metaTitle} onChange={(e) => setBranding({ ...branding, metaTitle: e.target.value })} placeholder="Your Business Name - Book Now" className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Meta Description</label>
                                <textarea value={branding.metaDescription} onChange={(e) => setBranding({ ...branding, metaDescription: e.target.value })} rows={2} placeholder="Brief description for search engines..." className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none resize-none" />
                            </div>
                        </div>
                    </div>

                    {/* Social Links */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6">
                        <h2 className="text-lg font-bold text-slate-900 mb-6">Social Media Links</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { key: 'facebook', icon: Facebook, placeholder: 'facebook.com/yourbusiness' },
                                { key: 'instagram', icon: Instagram, placeholder: 'instagram.com/yourbusiness' },
                                { key: 'twitter', icon: Twitter, placeholder: 'twitter.com/yourbusiness' },
                                { key: 'linkedin', icon: Linkedin, placeholder: 'linkedin.com/company/yourbusiness' },
                                { key: 'youtube', icon: Youtube, placeholder: 'youtube.com/@yourbusiness' },
                            ].map(({ key, icon: Icon, placeholder }) => (
                                <div key={key} className="flex items-center gap-3">
                                    <Icon size={18} className="text-slate-400" />
                                    <input
                                        type="text"
                                        value={branding.socialLinks?.[key] || ''}
                                        onChange={(e) => setBranding({ ...branding, socialLinks: { ...branding.socialLinks, [key]: e.target.value } })}
                                        placeholder={placeholder}
                                        className="flex-1 border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Preview */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 sticky top-8">
                        <h2 className="text-lg font-bold text-slate-900 mb-4">Preview</h2>
                        <div className="rounded-xl overflow-hidden border border-slate-200" style={{ backgroundColor: branding.backgroundColor }}>
                            <div className="p-4" style={{ backgroundColor: branding.primaryColor }}>
                                {branding.logo ? (
                                    <img src={branding.logo} alt="Logo" className="h-8" />
                                ) : (
                                    <div className="text-white font-bold" style={{ fontFamily: branding.fontFamily }}>Your Logo</div>
                                )}
                            </div>
                            <div className="p-6" style={{ fontFamily: branding.fontFamily }}>
                                <h3 className="text-lg font-bold mb-2" style={{ color: branding.textColor }}>Sample Heading</h3>
                                <p className="text-sm mb-4" style={{ color: branding.textColor, opacity: 0.7 }}>This is how your text will appear on the booking page.</p>
                                <button className="w-full py-2.5 rounded-lg text-white font-medium" style={{ backgroundColor: branding.primaryColor }}>Book Now</button>
                                <button className="w-full py-2.5 rounded-lg font-medium mt-2 border-2" style={{ borderColor: branding.secondaryColor, color: branding.secondaryColor }}>Learn More</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
