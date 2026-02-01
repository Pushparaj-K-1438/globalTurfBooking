import { notFound } from "next/navigation";
import connectDB from "../../../../lib/mongoose";
import Tenant from "../../../../models/Tenant";
import Listing from "../../../../models/Listing";
import TenantHeader from "../../../components/Layout/TenantHeader";
import { formatCurrency } from "../../../../lib/currency";
import Link from "next/link";
import {
    Star, MapPin, Calendar, CheckCircle2, Globe, ArrowRight
} from "lucide-react";
import QuickBookingWidget from "../../../../components/ui/QuickBookingWidget";

async function getBookingData(slug) {
    await connectDB();
    const tenant = await Tenant.findOne({ slug }).lean();
    if (!tenant) return null;
    const listings = await Listing.find({ tenantId: tenant._id, isActive: true }).lean();
    return JSON.parse(JSON.stringify({ tenant, listings }));
}

export default async function BookingsPage({ params }) {
    const { slug } = await params;
    const data = await getBookingData(slug);
    if (!data) notFound();

    const { tenant, listings } = data;
    const primaryColor = tenant.settings?.theme?.primaryColor || '#10b981';

    return (
        <div className="min-h-screen bg-slate-50">
            <TenantHeader tenant={tenant} />

            <main className="max-w-7xl mx-auto px-4 pt-32 pb-20">
                <header className="mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                        <Calendar size={12} /> Live Scheduling
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-4">Book Your Sessions</h1>
                    <p className="text-xl text-slate-500 max-w-2xl font-medium">Explore premium turf facilities and book your preferred slots instantly.</p>
                </header>

                <div className="space-y-32">
                    {listings.map((item) => (
                        <div key={item._id} className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                            <div className="space-y-8 animate-in slide-in-from-left-8 duration-700">
                                <div className="relative group rounded-[40px] overflow-hidden shadow-2xl aspect-[4/3]">
                                    <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                    <div className="absolute top-6 left-6 flex gap-2">
                                        <div className="px-4 py-2 bg-white/90 backdrop-blur text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg">
                                            <Star size={12} className="text-amber-500 fill-amber-500" /> {item.rating} ({(item.reviewsCount || 0) + 12} Reviews)
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h2 className="text-4xl font-black text-slate-900 tracking-tight">{item.title || item.name}</h2>
                                    <div className="flex items-center gap-4 text-slate-500 font-bold">
                                        <div className="flex items-center gap-2">
                                            <MapPin size={18} className="text-emerald-500" /> {item.location.address}
                                        </div>
                                    </div>
                                    <p className="text-lg text-slate-500 leading-relaxed font-medium">
                                        {item.description || "Experience top-tier sports facilities with professional standards and premium amenities designed for high-performance play."}
                                    </p>
                                    <div className="flex flex-wrap gap-3 pt-4">
                                        {(item.amenities || ['Floodlights', 'Dressing Room', 'Parking']).map((am, i) => (
                                            <span key={i} className="px-5 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 shadow-sm flex items-center gap-2">
                                                <CheckCircle2 size={14} className="text-emerald-500" /> {am}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="lg:sticky lg:top-32 animate-in slide-in-from-right-8 duration-700">
                                <div className="bg-white rounded-[40px] border border-slate-200 shadow-2xl p-8 md:p-10 space-y-8 outline outline-4 outline-slate-50">
                                    <div className="flex justify-between items-center mb-4">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pricing From</p>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-4xl font-black text-slate-900">{formatCurrency(item.pricing?.basePrice || 1200)}</span>
                                                <span className="text-slate-400 font-bold text-sm">/hour</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Status</p>
                                            <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">Instant Booking</span>
                                        </div>
                                    </div>
                                    <QuickBookingWidget listing={item} primaryColor={primaryColor} />
                                </div>
                            </div>
                        </div>
                    ))}
                    {listings.length === 0 && (
                        <div className="text-center py-40 bg-white rounded-[64px] border border-dashed border-slate-200">
                            <p className="text-slate-400 font-bold">No facilities found.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
