'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Layers, Users, UserCheck, LogOut, Menu, X, ShieldCheck, DollarSign, Check, Globe, Receipt, Shield, Tag, Star, Bell, Calendar, FileText, Settings } from 'lucide-react';

export default function SuperAdminLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch("/api/auth/session");
                if (res.ok) {
                    const data = await res.json();
                    if (data.authenticated && data.user.role === 'SUPER_ADMIN') {
                        setIsAuthenticated(true);
                    } else {
                        // Redirect if not authenticated or not SUPER_ADMIN
                        router.push('/login');
                    }
                } else {
                    router.push('/login');
                }
            } catch (error) {
                console.error("Auth check failed", error);
                router.push('/login');
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [router]);

    const navItems = [
        { name: 'Dashboard', href: '/super-admin/dashboard', icon: LayoutDashboard },
        { name: 'Bookings', href: '/super-admin/bookings', icon: Calendar },
        { name: 'Tenants', href: '/super-admin/tenants', icon: Users },
        { name: 'Users', href: '/super-admin/users', icon: UserCheck },
        { name: 'Listing Types', href: '/super-admin/types', icon: Layers },
        { name: 'Pricing Models', href: '/super-admin/pricing-models', icon: DollarSign },
        { name: 'Amenities', href: '/super-admin/amenities', icon: Check },
        { name: 'Currencies', href: '/super-admin/currencies', icon: Globe },
        { name: 'Tax Rules', href: '/super-admin/tax-rules', icon: Receipt },
        { name: 'Roles', href: '/super-admin/roles', icon: Shield },
        { name: 'Coupons', href: '/super-admin/coupons', icon: Tag },
        { name: 'Reviews', href: '/super-admin/reviews', icon: Star },
        { name: 'Audit Logs', href: '/super-admin/audit-logs', icon: FileText },
        { name: 'Settings', href: '/super-admin/settings', icon: Settings },
    ];

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/login');
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans">
            {/* Mobile menu button */}
            <div className="lg:hidden fixed top-4 left-4 z-50">
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="bg-white p-2 rounded-lg shadow-sm border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                    {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800 text-white transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } lg:translate-x-0 lg:static lg:inset-0`}>
                <div className="flex flex-col h-full">
                    {/* Brand */}
                    <div className="flex items-center justify-center h-20 border-b border-slate-800">
                        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
                            <div className="p-1.5 bg-emerald-500 rounded-lg text-white">
                                <ShieldCheck size={20} />
                            </div>
                            <span className="text-white">SuperAdmin</span>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 group font-medium ${isActive
                                        ? 'bg-emerald-600 text-white shadow-md'
                                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                        }`}
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    <Icon size={20} className={`mr-3 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} />
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Logout */}
                    <div className="p-4 border-t border-slate-800">
                        <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-3 text-slate-400 hover:bg-red-900/20 hover:text-red-400 rounded-lg transition-colors group font-medium"
                        >
                            <LogOut size={20} className="mr-3 text-slate-500 group-hover:text-red-400" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50">
                <main className="flex-1 overflow-x-hidden overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                    {children}
                </main>
            </div>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
}
