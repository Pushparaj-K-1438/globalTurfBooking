"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Building2, Users, Calendar, CreditCard, TrendingUp, TrendingDown,
    Activity, Database, Server, HardDrive, RefreshCw, AlertCircle,
    CheckCircle, Clock, ArrowUpRight, FileText, Settings, Shield
} from "lucide-react";

export default function SuperAdminDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/super-admin/platform/stats');
            const data = await res.json();
            setStats(data);
        } catch (error) {
            console.error("Failed to fetch stats:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    const quickLinks = [
        { label: "Manage Tenants", href: "/super-admin/tenants", icon: Building2, color: "bg-blue-500" },
        { label: "All Users", href: "/super-admin/users", icon: Users, color: "bg-purple-500" },
        { label: "Audit Logs", href: "/super-admin/audit-logs", icon: Shield, color: "bg-amber-500" },
        { label: "Settings", href: "/super-admin/settings", icon: Settings, color: "bg-slate-500" }
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Platform Dashboard</h1>
                    <p className="text-slate-500">
                        Last updated: {new Date(stats?.timestamp).toLocaleString()}
                    </p>
                </div>
                <button
                    onClick={fetchStats}
                    className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                    <RefreshCw size={16} /> Refresh
                </button>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <Building2 size={24} className="text-blue-600" />
                        </div>
                        <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                            {stats?.overview?.tenants?.active} active
                        </span>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">{stats?.overview?.tenants?.total || 0}</p>
                    <p className="text-slate-500 text-sm">Total Tenants</p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                            <Users size={24} className="text-purple-600" />
                        </div>
                        <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                            {stats?.overview?.users?.active} active
                        </span>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">{stats?.overview?.users?.total || 0}</p>
                    <p className="text-slate-500 text-sm">Total Users</p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                            <Calendar size={24} className="text-emerald-600" />
                        </div>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1 ${stats?.growth?.bookings >= 0 ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'
                            }`}>
                            {stats?.growth?.bookings >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                            {stats?.growth?.bookings}%
                        </span>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">{stats?.overview?.bookings?.total || 0}</p>
                    <p className="text-slate-500 text-sm">Total Bookings</p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                            <CreditCard size={24} className="text-amber-600" />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">{formatCurrency(stats?.overview?.revenue?.total || 0)}</p>
                    <p className="text-slate-500 text-sm">Total Revenue</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Quick Actions */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-2 gap-3">
                        {quickLinks.map((link, idx) => (
                            <Link
                                key={idx}
                                href={link.href}
                                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                            >
                                <div className={`w-10 h-10 ${link.color} rounded-lg flex items-center justify-center`}>
                                    <link.icon size={20} className="text-white" />
                                </div>
                                <span className="text-sm font-medium text-slate-700 text-center">{link.label}</span>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Today's Stats */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <h2 className="text-lg font-bold text-slate-900 mb-4">Today's Activity</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <span className="text-slate-600">Bookings Today</span>
                            <span className="font-bold text-slate-900">{stats?.overview?.bookings?.today || 0}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <span className="text-slate-600">This Month</span>
                            <span className="font-bold text-slate-900">{stats?.overview?.bookings?.thisMonth || 0}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <span className="text-slate-600">Revenue (Month)</span>
                            <span className="font-bold text-emerald-600">{formatCurrency(stats?.overview?.revenue?.thisMonth || 0)}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <span className="text-slate-600">Active Listings</span>
                            <span className="font-bold text-slate-900">{stats?.overview?.listings?.active || 0}</span>
                        </div>
                    </div>
                </div>

                {/* System Health */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <h2 className="text-lg font-bold text-slate-900 mb-4">System Health</h2>
                    <div className="space-y-3">
                        {Object.entries(stats?.systemHealth || {}).map(([key, status]) => (
                            <div key={key} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    {key === 'database' && <Database size={18} className="text-slate-500" />}
                                    {key === 'cache' && <Server size={18} className="text-slate-500" />}
                                    {key === 'queue' && <Clock size={18} className="text-slate-500" />}
                                    {key === 'storage' && <HardDrive size={18} className="text-slate-500" />}
                                    <span className="text-slate-700 capitalize">{key}</span>
                                </div>
                                <span className={`flex items-center gap-1 text-sm font-medium ${status === 'healthy' ? 'text-emerald-600' : 'text-amber-600'
                                    }`}>
                                    {status === 'healthy' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                                    {status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Bookings & Top Tenants */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Bookings */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-slate-900">Recent Bookings</h2>
                        <Link href="/super-admin/bookings" className="text-sm text-emerald-600 font-medium hover:underline flex items-center gap-1">
                            View All <ArrowUpRight size={14} />
                        </Link>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {stats?.recentBookings?.slice(0, 5).map((booking) => (
                            <div key={booking.id} className="p-4 hover:bg-slate-50 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-slate-900">{booking.tenant || 'Unknown'}</p>
                                        <p className="text-sm text-slate-500">
                                            {new Date(booking.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-emerald-600">{formatCurrency(booking.amount)}</p>
                                        <span className={`text-xs px-2 py-1 rounded-full ${booking.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-700' :
                                                booking.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-slate-100 text-slate-700'
                                            }`}>
                                            {booking.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Tenants */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-slate-900">Top Tenants</h2>
                        <Link href="/super-admin/tenants" className="text-sm text-emerald-600 font-medium hover:underline flex items-center gap-1">
                            View All <ArrowUpRight size={14} />
                        </Link>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {stats?.topTenants?.slice(0, 5).map((tenant, idx) => (
                            <div key={tenant._id} className="p-4 hover:bg-slate-50 transition-colors flex items-center gap-4">
                                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-sm font-bold text-slate-600">
                                    {idx + 1}
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-slate-900">{tenant.name}</p>
                                    <p className="text-sm text-slate-500">{tenant.slug}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-slate-900">{tenant.bookingCount}</p>
                                    <p className="text-xs text-slate-500">bookings</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
