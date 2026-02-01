import { notFound } from "next/navigation";
import connectDB from "../../../lib/mongoose";
import Tenant from "../../../models/Tenant";
import Listing from "../../../models/Listing";
import Product from "../../../models/Product";
import TenantHeader from "../../components/Layout/TenantHeader";
import { formatCurrency } from "../../../lib/currency";
import Link from "next/link";
import {
    Star, MapPin, Phone, Mail, ArrowRight, ShoppingBag,
    Calendar, CheckCircle2, Globe, Clock, ShieldCheck, Users,
    Truck, Award, RefreshCcw
} from "lucide-react";
import QuickBookingWidget from "../../../components/ui/QuickBookingWidget";

async function getTenantData(slug) {
    await connectDB();
    const tenant = await Tenant.findOne({ slug }).lean();
    if (!tenant) return null;

    const listings = await Listing.find({ tenantId: tenant._id, isActive: true }).lean();
    const products = await Product.find({ tenantId: tenant._id, isActive: true }).lean();

    // Serialize MongoDB objects (ObjectId, Date) to plain strings for Client Components
    return JSON.parse(JSON.stringify({ tenant, listings, products }));
}

export default async function TenantSite({ params }) {
    const { slug } = await params;
    const data = await getTenantData(slug);

    if (!data) {
        notFound();
    }

    const { tenant, listings, products } = data;
    const businessType = tenant.settings?.businessType || 'turf';
    const primaryColor = tenant.settings?.theme?.primaryColor || '#10b981';

    // Business type specific content
    const isEcommerce = businessType === 'ecommerce';
    const isMulti = businessType === 'multi';
    const isBooking = businessType === 'turf' || businessType === 'hotel' || isMulti;

    return (
        <div className="min-h-screen bg-slate-50">
            <TenantHeader tenant={tenant} />

            {/* Tenant Hero Section */}
            <section className="relative h-[75vh] flex items-center justify-center overflow-hidden pt-20">
                <div className="absolute inset-0 bg-slate-900/60 z-10" />
                <img
                    src={listings[0]?.images?.[0] || "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e"}
                    className="absolute inset-0 w-full h-full object-cover"
                    alt={tenant.name}
                />

                <div className="relative z-20 text-center px-4 max-w-4xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-white text-[10px] font-black uppercase tracking-[0.2em] mb-6 border border-white/20 animate-in fade-in slide-in-from-bottom-4">
                        <Globe size={12} /> {brandTag(businessType)}
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black text-white mb-6 drop-shadow-2xl tracking-tighter">
                        {tenant.name}
                    </h1>
                    <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto font-medium leading-relaxed">
                        {heroDescription(businessType, listings[0]?.location?.city)}
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        {isMulti ? (
                            <>
                                <Link
                                    href={`/v/${tenant.slug}/bookings`}
                                    className="px-10 py-5 text-white rounded-full font-black text-sm uppercase tracking-widest transition-all shadow-2xl hover:scale-105 active:scale-95"
                                    style={{ backgroundColor: primaryColor }}
                                >
                                    Book a Court
                                </Link>
                                <Link
                                    href={`/v/${tenant.slug}/shop`}
                                    className="px-10 py-5 bg-white text-slate-900 rounded-full font-black text-sm uppercase tracking-widest transition-all shadow-2xl hover:scale-105 active:scale-95"
                                >
                                    Shop Official Gear
                                </Link>
                            </>
                        ) : (
                            <>
                                {isBooking && (
                                    <a
                                        href="#services"
                                        className="px-10 py-5 text-white rounded-full font-black text-sm uppercase tracking-widest transition-all shadow-2xl hover:scale-105 active:scale-95"
                                        style={{ backgroundColor: primaryColor }}
                                    >
                                        Book Now
                                    </a>
                                )}
                                {isEcommerce && (
                                    <a
                                        href="#shop"
                                        className="px-10 py-5 text-white rounded-full font-black text-sm uppercase tracking-widest transition-all shadow-2xl hover:scale-105 active:scale-95"
                                        style={{ backgroundColor: primaryColor }}
                                    >
                                        Shop Collection
                                    </a>
                                )}
                            </>
                        )}
                        <a href="#contact" className="px-10 py-5 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/30 rounded-full font-black text-sm uppercase tracking-widest transition-all hover:scale-105 active:scale-95">
                            Contact Us
                        </a>
                    </div>
                </div>
            </section>

            {/* Info Bar */}
            <div className="max-w-7xl mx-auto px-4 -mt-16 relative z-30">
                <div className="bg-white rounded-[32px] shadow-2xl border border-slate-100 p-8 md:p-12 grid grid-cols-1 md:grid-cols-3 gap-12">
                    {(isEcommerce || isMulti) ? (
                        <>
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
                                    <Truck size={28} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Shipping</p>
                                    <p className="font-bold text-slate-900">Pan India Delivery</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-5 border-y md:border-y-0 md:border-x border-slate-100 py-8 md:py-0 md:px-12">
                                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100">
                                    <Award size={28} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Quality</p>
                                    <p className="font-bold text-slate-900">Premium Authentic Gear</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 shadow-sm border border-amber-100">
                                    <RefreshCcw size={28} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Returns</p>
                                    <p className="font-bold text-slate-900">7-Day Easy Exchange</p>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100">
                                    <MapPin size={28} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Location</p>
                                    <p className="font-bold text-slate-900">{listings[0]?.location?.city || 'Bangalore'}, India</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-5 border-y md:border-y-0 md:border-x border-slate-100 py-8 md:py-0 md:px-12">
                                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
                                    <Clock size={28} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Operating</p>
                                    <p className="font-bold text-slate-900">06:00 AM - 11:00 PM</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 shadow-sm border border-amber-100">
                                    <ShieldCheck size={28} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Security</p>
                                    <p className="font-bold text-slate-900">Verified Platform Partner</p>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-32 space-y-40">

                {/* Multi-Business Portal Entry Cards */}
                {isMulti && (
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <Link href={`/v/${tenant.slug}/bookings`} className="group relative h-[500px] rounded-[48px] overflow-hidden flex flex-col justify-end p-12 transition-all hover:-translate-y-2 shadow-2xl">
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent z-10" />
                            <img src={listings[0]?.images[0]} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                            <div className="relative z-20 space-y-4">
                                <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-white mb-6">
                                    <Calendar size={32} />
                                </div>
                                <h3 className="text-4xl font-black text-white">Court Bookings</h3>
                                <p className="text-white/70 text-lg leading-relaxed max-w-sm">Premium turf facilities, floodlighting, and professional standards.</p>
                                <div className="flex items-center gap-3 text-emerald-400 font-black uppercase text-xs tracking-widest pt-4">
                                    Browse Facilities <ArrowRight size={16} />
                                </div>
                            </div>
                        </Link>
                        <Link href={`/v/${tenant.slug}/shop`} className="group relative h-[500px] rounded-[48px] overflow-hidden flex flex-col justify-end p-12 transition-all hover:-translate-y-2 shadow-2xl">
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent z-10" />
                            <img src={products[0]?.images[0]} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                            <div className="relative z-20 space-y-4">
                                <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center text-white mb-6">
                                    <ShoppingBag size={32} />
                                </div>
                                <h3 className="text-4xl font-black text-white">Elite Gear Shop</h3>
                                <p className="text-white/70 text-lg leading-relaxed max-w-sm">Professional grade equipment and apparel for serious athletes.</p>
                                <div className="flex items-center gap-3 text-blue-400 font-black uppercase text-xs tracking-widest pt-4">
                                    Enter Catalog <ArrowRight size={16} />
                                </div>
                            </div>
                        </Link>
                    </section>
                )}

                {/* Available Services */}
                {(!isMulti && isBooking && listings.length > 0) && (
                    <section id="services">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
                            <div>
                                <span className="text-[12px] font-black text-emerald-600 uppercase tracking-[0.3em] mb-3 block">Facilities</span>
                                <h2 className="text-4xl md:text-5xl font-black text-slate-900">Explore & Book</h2>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                            <div className="lg:col-span-2 space-y-10">
                                {listings.map(item => (
                                    <div key={item._id} className="group bg-white rounded-[32px] border border-slate-200 overflow-hidden flex flex-col md:flex-row shadow-sm hover:shadow-2xl transition-all duration-500">
                                        <div className="md:w-80 h-64 md:h-auto relative overflow-hidden">
                                            <img src={item.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                            <span
                                                className="absolute top-6 left-6 px-4 py-1.5 backdrop-blur text-white text-[10px] font-black uppercase tracking-widest rounded-full"
                                                style={{ background: `${primaryColor}cc` }}
                                            >
                                                {item.type}
                                            </span>
                                        </div>
                                        <div className="p-10 flex-1 flex flex-col justify-between">
                                            <div>
                                                <h3 className="text-2xl font-black text-slate-900 mb-3">{item.title}</h3>
                                                <div className="flex items-center gap-5 text-slate-500 text-sm mb-6 font-medium">
                                                    <span className="flex items-center gap-1.5"><MapPin size={16} className="text-emerald-500" /> {item.location.address}</span>
                                                    <span className="flex items-center gap-1.5"><Star size={16} className="text-amber-500 fill-amber-500" /> 4.9</span>
                                                </div>
                                                <p className="text-slate-600 leading-relaxed line-clamp-2">{item.description}</p>
                                            </div>
                                            <div className="flex items-center justify-between mt-8 pt-8 border-t border-slate-100">
                                                <div>
                                                    <span className="text-3xl font-black text-slate-900">₹{item.priceConfig.basePrice}</span>
                                                    <span className="text-xs text-slate-400 font-black uppercase ml-1.5 tracking-tighter">/ Slot</span>
                                                </div>
                                                <button
                                                    className="w-14 h-14 rounded-full text-white flex items-center justify-center transition-all hover:scale-110 active:scale-90 shadow-lg"
                                                    style={{ backgroundColor: primaryColor }}
                                                >
                                                    <ArrowRight size={24} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="lg:col-span-1">
                                <div className="sticky top-28" id="booking">
                                    <QuickBookingWidget listing={listings[0]} />
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* Ecommerce Section */}
                {(isEcommerce || isMulti) && products.length > 0 && (
                    <section id="shop" className="bg-slate-900 rounded-[64px] p-8 md:p-24 overflow-hidden relative shadow-2xl">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] -mr-64 -mt-64" />
                        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] -ml-64 -mb-64" />

                        <div className="relative z-10">
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-20">
                                <div>
                                    <span className="text-[12px] font-black text-emerald-400 uppercase tracking-[0.4em] mb-4 block">Official Gear</span>
                                    <h2 className="text-5xl md:text-6xl font-black text-white">Elite Collection</h2>
                                </div>
                                <button className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all">
                                    View Catalog
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                                {products.map(p => (
                                    <div key={p._id} className="bg-white/5 backdrop-blur-md rounded-[32px] p-8 group hover:bg-white transition-all duration-500 hover:shadow-2xl border border-white/5 hover:border-white">
                                        <div className="h-72 bg-slate-800/50 rounded-2xl mb-8 relative overflow-hidden flex items-center justify-center p-12 group-hover:bg-slate-50 transition-colors">
                                            <img
                                                src={p.images?.[0] || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop&q=60"}
                                                className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700"
                                            />
                                            <button
                                                className="absolute bottom-6 right-6 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-white scale-0 group-hover:scale-100 transition-all duration-500 hover:rotate-12"
                                                style={{ backgroundColor: primaryColor }}
                                            >
                                                <ShoppingBag size={24} />
                                            </button>
                                        </div>
                                        <h4 className="text-xl font-bold text-white group-hover:text-slate-900 mb-2 transition-colors">{p.name}</h4>
                                        <p className="text-[10px] text-emerald-400 font-black uppercase mb-5 tracking-widest">{p.category}</p>
                                        <div className="flex items-center justify-between border-t border-white/10 group-hover:border-slate-100 pt-6 transition-colors">
                                            <span className="text-2xl font-black text-white group-hover:text-emerald-600 transition-colors">₹{p.price}</span>
                                            <div className="flex -space-x-2">
                                                <div className="w-8 h-8 rounded-full bg-red-500 border-4 border-slate-900 group-hover:border-white transition-all shadow-sm" />
                                                <div className="w-8 h-8 rounded-full bg-blue-500 border-4 border-slate-900 group-hover:border-white transition-all shadow-sm" />
                                                <div className="w-8 h-8 rounded-full bg-slate-700 border-4 border-slate-900 group-hover:border-white transition-all shadow-sm" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Dynamic Features Section */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-16 py-20">
                    {featureList(businessType).map((f, i) => (
                        <div key={i} className="space-y-6 group">
                            <div
                                className="w-20 h-20 rounded-[24px] flex items-center justify-center shadow-xl group-hover:rotate-6 transition-all"
                                style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                            >
                                <f.icon size={32} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{f.title}</h3>
                            <p className="text-slate-500 leading-relaxed font-medium">{f.desc}</p>
                        </div>
                    ))}
                </section>

                {/* Contact Section */}
                <section id="contact" className="bg-white rounded-[64px] p-8 md:p-24 border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-slate-50 rounded-full blur-[100px] -mr-48 -mt-48" />
                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20">
                        <div>
                            <span className="text-[12px] font-black text-emerald-600 uppercase tracking-[0.4em] mb-4 block">Get in Touch</span>
                            <h2 className="text-5xl md:text-6xl font-black text-slate-900 mb-8 tracking-tighter">Contact Us</h2>
                            <p className="text-xl text-slate-500 mb-12 leading-relaxed">
                                Have questions about our facilities or gear? Our team is here to help you get the best experience possible.
                            </p>

                            <div className="space-y-8">
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-emerald-600 border border-slate-100 shadow-sm">
                                        <Phone size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Phone</p>
                                        <p className="text-xl font-bold text-slate-900">{tenant.settings?.contact?.phone || '+91 99887 76655'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-blue-600 border border-slate-100 shadow-sm">
                                        <Mail size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email</p>
                                        <p className="text-xl font-bold text-slate-900">{tenant.settings?.contact?.email || `info@${tenant.slug}.com`}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-amber-600 border border-slate-100 shadow-sm">
                                        <MapPin size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Visit Us</p>
                                        <p className="text-xl font-bold text-slate-900">{tenant.settings?.contact?.address || listings[0]?.location?.address || 'Premium Hub, India'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-50 rounded-[40px] p-8 md:p-12 border border-slate-100">
                            <form className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                                        <input type="text" className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none" placeholder="John Doe" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                                        <input type="email" className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none" placeholder="john@example.com" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Message</label>
                                    <textarea rows={4} className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none" placeholder="How can we help you?" />
                                </div>
                                <button
                                    className="w-full py-5 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
                                    style={{ backgroundColor: primaryColor }}
                                >
                                    Send Message
                                </button>
                            </form>
                        </div>
                    </div>
                </section>
            </main>

            {/* Premium Footer */}
            <footer className="bg-slate-950 text-white pt-32 pb-12 px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-20">
                    <div className="lg:col-span-2 space-y-10">
                        <div className="flex items-center gap-4">
                            <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-2xl"
                                style={{ backgroundColor: primaryColor }}
                            >
                                {tenant.name[0]}
                            </div>
                            <h2 className="text-4xl font-black tracking-tight">{tenant.name}</h2>
                        </div>
                        <p className="text-slate-400 max-w-md text-lg leading-relaxed">
                            {footerText(businessType)}
                        </p>
                        <div className="flex gap-4">
                            {[Globe, Mail, Phone].map((Icon, idx) => (
                                <div key={idx} className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-emerald-600 transition-all cursor-pointer border border-white/5">
                                    <Icon size={20} />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h4 className="font-black mb-8 text-[10px] uppercase tracking-[0.4em] text-emerald-500">Contact</h4>
                        <ul className="space-y-5 text-slate-400 font-medium">
                            <li className="flex items-center gap-4 hover:text-white transition-colors"><MapPin size={18} /> {tenant.settings?.contact?.address || listings[0]?.location?.address || 'India'}</li>
                            <li className="flex items-center gap-4 hover:text-white transition-colors"><Phone size={18} /> {tenant.settings?.contact?.phone || '+91 99887 76655'}</li>
                            <li className="flex items-center gap-4 hover:text-white transition-colors"><Mail size={18} /> {tenant.settings?.contact?.email || `info@${tenant.slug}.com`}</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-black mb-8 text-[10px] uppercase tracking-[0.4em] text-emerald-500">Trust</h4>
                        <ul className="space-y-5 text-slate-400 font-medium">
                            <li className="hover:text-white cursor-pointer transition-colors">Safety Protocols</li>
                            <li className="hover:text-white cursor-pointer transition-colors">Booking Policy</li>
                            <li className="hover:text-white cursor-pointer transition-colors">Refund Promise</li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto mt-32 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-slate-500 text-xs font-bold uppercase tracking-widest">
                    <p>© 2026 {tenant.name}. All Rights Reserved.</p>
                    <div className="flex items-center gap-1.5 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all">
                        Powered by <Link href="/" className="text-white hover:text-emerald-500 transition-colors">TurfBooking</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}

// Helper functions for dynamic content
const brandTag = (type) => {
    switch (type) {
        case 'ecommerce': return 'Direct To Consumer Shop';
        case 'multi': return 'Multi-Experience Venue';
        case 'hotel': return 'Premium Stay Partner';
        default: return 'Professional Sporting Venue';
    }
};

const heroDescription = (type, city) => {
    switch (type) {
        case 'ecommerce': return `Explore high-performance sporting gear and professional apparel. Designed for champions, delivered to your doorstep.`;
        case 'multi': return `A world-class destination combining premium turf facilities with luxury amenities and top-tier gear.`;
        case 'hotel': return `Experience unmatched hospitality and premium leisure at our stay-and-play destination.`;
        default: return `Book the finest FIFA-certified turfs in ${city || 'India'}. Premium floodlights, professional grass, and world-class management.`;
    }
};

const footerText = (type) => {
    switch (type) {
        case 'ecommerce': return 'Empowering athletes with world-class gear. We bridge the gap between passion and performance.';
        default: return 'Providing world-class facilities for the modern athlete. Redefining the way you play and experience sports.';
    }
};

const featureList = (type) => {
    if (type === 'ecommerce') {
        return [
            { icon: Globe, title: 'Safe Worldwide', desc: 'Secure payments and global shipping standards for all our collections.' },
            { icon: ShieldCheck, title: 'Authentic Gear', desc: '100% original products sourced directly from professional manufacturers.' },
            { icon: RefreshCcw, title: 'Expert Support', desc: 'Professional advice on gear selection from our in-house experts.' }
        ];
    }
    return [
        { icon: Sparkles, title: 'OLED Lighting', desc: 'Next-gen floodlights ensuring 100% visibility for high-octane night games.' },
        { icon: ShieldCheck, title: 'Secure Arena', desc: '24/7 CCTV surveillance and verified entry for a safe family environment.' },
        { icon: Users, title: 'Pro Coaching', desc: 'Certified trainers and international standards coaching available for all ages.' }
    ];
};

const Sparkles = ({ className, size }) => (
    <svg className={className} width={size || 24} height={size || 24} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" />
    </svg>
);
