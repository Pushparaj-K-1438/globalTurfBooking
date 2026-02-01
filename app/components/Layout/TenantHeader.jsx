"use client";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, LayoutDashboard, LogOut, Home, Phone, ShoppingBag, LogIn, ChevronRight, Search, Globe, User } from "lucide-react";
import Link from 'next/link';

const TenantHeader = ({ tenant }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const fetchAuth = async () => {
            try {
                const res = await fetch('/api/auth/verify', { credentials: 'include' });
                if (res.ok) {
                    const data = await res.json();
                    setUserData(data.authenticated ? data.user : null);
                }
            } catch (e) { console.error("Auth fetch failed", e); }
            finally { setLoading(false); }
        };
        fetchAuth();
    }, [pathname]);

    if (!tenant) return null;

    const brandName = tenant.name;
    const logo = tenant.settings?.theme?.logo;
    const primaryColor = tenant.settings?.theme?.primaryColor || "#10b981";
    const businessType = tenant.settings?.businessType || 'turf';
    const modules = tenant.modules || [];

    const showBookings = modules.includes('bookings') || modules.includes('turfs') || modules.includes('hotels') || ['turf', 'hotel', 'multi'].includes(businessType);
    const showShop = modules.includes('products') || ['ecommerce', 'multi'].includes(businessType);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/60 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Logo Section */}
                    <Link href={`/v/${tenant.slug}`} className="flex-shrink-0 flex items-center gap-3 group">
                        <div
                            className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-xl transition-transform group-hover:scale-105"
                            style={{ background: `linear-gradient(135deg, ${primaryColor}, #0ea5e9)` }}
                        >
                            {logo ? (
                                <img src={logo} alt={brandName} className="w-full h-full object-contain p-1.5" />
                            ) : (
                                brandName[0].toUpperCase()
                            )}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-black text-slate-900 leading-none">
                                {brandName}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mt-1">
                                Official Web
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-10">
                        <Link href={`/v/${tenant.slug}`} className="text-sm font-bold text-slate-900 hover:text-emerald-600 transition-colors">Home</Link>

                        {showBookings && (
                            <Link
                                href={businessType === 'multi' ? `/v/${tenant.slug}/bookings` : `#services`}
                                className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
                            >
                                Bookings
                            </Link>
                        )}

                        {showShop && (
                            <Link
                                href={businessType === 'multi' ? `/v/${tenant.slug}/shop` : `#shop`}
                                className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
                            >
                                Shop
                            </Link>
                        )}

                        <a href="#contact" className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">Contact</a>
                    </div>

                    {/* Right Actions */}
                    <div className="hidden md:flex items-center space-x-6">
                        {userData ? (
                            <Link
                                href={userData.role === 'admin' ? '/admin/dashboard' : '/dashboard'}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-2xl text-sm font-black transition-all hover:scale-105 active:scale-95 shadow-lg shadow-slate-200"
                                style={{ backgroundColor: 'white', color: '#0f172a', border: '1px solid #e2e8f0' }}
                            >
                                <User size={18} /> Dashboard
                            </Link>
                        ) : (
                            <Link
                                href="/login"
                                className="flex items-center gap-2 px-6 py-2.5 rounded-2xl text-sm font-black transition-all hover:scale-105 active:scale-95 shadow-lg shadow-slate-200"
                                style={{ backgroundColor: 'white', color: '#0f172a', border: '1px solid #e2e8f0' }}
                            >
                                <LogIn size={18} /> Sign In
                            </Link>
                        )}

                        {showShop && (
                            <button className="relative p-2.5 bg-slate-100 rounded-full text-slate-700 hover:bg-emerald-100 hover:text-emerald-700 transition-colors">
                                <ShoppingBag size={20} />
                                <span className="absolute top-0 right-0 w-4 h-4 bg-emerald-600 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white">0</span>
                            </button>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2.5 text-slate-600 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden py-6 border-t border-slate-100 bg-white/95 backdrop-blur-xl absolute left-0 right-0 shadow-2xl rounded-b-[32px] px-6 space-y-4 animate-in slide-in-from-top-4">
                        <Link href={`/v/${tenant.slug}`} onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 text-slate-900 font-black">
                            <Home size={20} /> Home
                        </Link>
                        {showBookings && (
                            <Link
                                href={businessType === 'multi' ? `/v/${tenant.slug}/bookings` : `#services`}
                                onClick={() => setIsMenuOpen(false)}
                                className="flex items-center gap-4 p-4 rounded-2xl text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                            >
                                <Globe size={20} /> Bookings
                            </Link>
                        )}
                        {showShop && (
                            <Link
                                href={businessType === 'multi' ? `/v/${tenant.slug}/shop` : `#shop`}
                                onClick={() => setIsMenuOpen(false)}
                                className="flex items-center gap-4 p-4 rounded-2xl text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                            >
                                <ShoppingBag size={20} /> Shop
                            </Link>
                        )}
                        <a href="#contact" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 p-4 rounded-2xl text-slate-600 font-bold hover:bg-slate-50 transition-colors">
                            <Phone size={20} /> Contact
                        </a>
                        <div className="pt-4 border-t border-slate-100">
                            {userData ? (
                                <Link href={userData.role === 'admin' ? '/admin/dashboard' : '/dashboard'} onClick={() => setIsMenuOpen(false)} className="w-full inline-flex items-center justify-center p-4 rounded-2xl bg-slate-900 text-white font-black">
                                    Dashboard
                                </Link>
                            ) : (
                                <Link href="/login" onClick={() => setIsMenuOpen(false)} className="w-full inline-flex items-center justify-center p-4 rounded-2xl bg-slate-900 text-white font-black">
                                    Sign In
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default TenantHeader;
