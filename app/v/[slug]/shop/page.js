import { notFound } from "next/navigation";
import connectDB from "../../../../lib/mongoose";
import Tenant from "../../../../models/Tenant";
import Product from "../../../../models/Product";
import TenantHeader from "../../../components/Layout/TenantHeader";
import { formatCurrency } from "../../../../lib/currency";
import Link from "next/link";
import {
    ShoppingBag, Star, ArrowRight, ShieldCheck, Truck, Award
} from "lucide-react";

async function getShopData(slug) {
    await connectDB();
    const tenant = await Tenant.findOne({ slug }).lean();
    if (!tenant) return null;
    const products = await Product.find({ tenantId: tenant._id, isActive: true }).lean();
    return JSON.parse(JSON.stringify({ tenant, products }));
}

export default async function ShopPage({ params }) {
    const { slug } = await params;
    const data = await getShopData(slug);
    if (!data) notFound();

    const { tenant, products } = data;
    const primaryColor = tenant.settings?.theme?.primaryColor || '#10b981';

    return (
        <div className="min-h-screen bg-slate-50">
            <TenantHeader tenant={tenant} />

            <main className="max-w-7xl mx-auto px-4 pt-32 pb-20">
                <header className="mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                        <ShoppingBag size={12} /> Elite Collection
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-4">Pro Sports Store</h1>
                    <p className="text-xl text-slate-500 max-w-2xl font-medium">Equip yourself with professional grade gear used by champions.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {products.map((p) => (
                        <div key={p._id} className="group bg-white rounded-[40px] p-6 border border-slate-200 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 relative overflow-hidden">
                            <div className="relative aspect-square rounded-[32px] overflow-hidden mb-6 bg-slate-50">
                                <img src={p.images?.[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff'} className="w-full h-full object-contain p-6 transition-transform duration-700 group-hover:scale-110" />
                                {p.category && (
                                    <span className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur rounded-xl text-[8px] font-black uppercase tracking-widest text-slate-900 border border-slate-100">
                                        {p.category}
                                    </span>
                                )}
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-lg font-black text-slate-900 leading-tight group-hover:text-emerald-600 transition-colors">{p.name}</h3>
                                </div>
                                <div className="flex items-center justify-between pt-2">
                                    <span className="text-2xl font-black text-slate-900">{formatCurrency(p.price)}</span>
                                    <button className="w-10 h-10 bg-slate-950 text-white rounded-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-lg">
                                        <ShoppingBag size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {products.length === 0 && (
                        <div className="col-span-full text-center py-40 bg-white rounded-[64px] border border-dashed border-slate-200">
                            <p className="text-slate-400 font-bold">No products currently available.</p>
                        </div>
                    )}
                </div>

                {/* Store Utilities */}
                <section className="mt-40 grid grid-cols-1 md:grid-cols-3 gap-12">
                    <div className="p-10 bg-white border border-slate-200 rounded-[48px] shadow-sm">
                        <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                            <Truck size={28} />
                        </div>
                        <h4 className="text-xl font-black text-slate-900 mb-2">Global Shipping</h4>
                        <p className="text-slate-500 font-medium">Fast and reliable delivery for all premium gear items.</p>
                    </div>
                    <div className="p-10 bg-white border border-slate-200 rounded-[48px] shadow-sm">
                        <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                            <ShieldCheck size={28} />
                        </div>
                        <h4 className="text-xl font-black text-slate-900 mb-2">Secure Checkout</h4>
                        <p className="text-slate-500 font-medium">100% encrypted payment gateways for safe transactions.</p>
                    </div>
                    <div className="p-10 bg-white border border-slate-200 rounded-[48px] shadow-sm">
                        <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
                            <Award size={28} />
                        </div>
                        <h4 className="text-xl font-black text-slate-900 mb-2">Authentic Products</h4>
                        <p className="text-slate-500 font-medium">Sourced directly from certified sporting manufacturers.</p>
                    </div>
                </section>
            </main>
        </div>
    );
}
