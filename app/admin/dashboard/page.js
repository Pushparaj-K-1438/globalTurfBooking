"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatCurrency } from "../../../lib/currency";
import {
    DollarSign, Users, TrendingUp, Activity, ArrowUpRight, Calendar,
    Plus, Package, ShoppingBag, Hotel, Dumbbell, Heart, LandPlot,
    PartyPopper, Clock, BarChart3, ArrowRight, Star
} from "lucide-react";

export default function TenantDashboard() {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tenant, setTenant] = useState(null);
    const [recentBookings, setRecentBookings] = useState([]);

    useEffect(() => {
        async function fetchData() {
            try {
                const [analyticsRes, sessionRes, bookingsRes] = await Promise.all([
                    fetch("/api/admin/analytics"),
                    fetch("/api/auth/session"),
                    fetch("/api/bookings?limit=5")
                ]);

                const analyticsData = await analyticsRes.json();
                const sessionData = await sessionRes.json();
                const bookingsData = await bookingsRes.json();

                setAnalytics(analyticsData);
                setTenant(sessionData.tenant || {});
                setRecentBookings(Array.isArray(bookingsData) ? bookingsData.slice(0, 5) : []);
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const modules = tenant?.modules || [];
    const businessType = tenant?.settings?.businessType || 'turf';

    // Define quick actions based on business type
    const getQuickActions = () => {
        const actions = [];

        if (modules.includes('turfs')) {
            actions.push({ name: 'Add Turf', href: '/admin/listings', icon: LandPlot, color: 'bg-emerald-500' });
        }
        if (modules.includes('hotels')) {
            actions.push({ name: 'Add Hotel', href: '/admin/hotels', icon: Hotel, color: 'bg-blue-500' });
        }
        if (modules.includes('events')) {
            actions.push({ name: 'Create Event', href: '/admin/events', icon: PartyPopper, color: 'bg-purple-500' });
        }
        if (modules.includes('gym')) {
            actions.push({ name: 'Add Gym', href: '/admin/gym', icon: Dumbbell, color: 'bg-orange-500' });
        }
        if (modules.includes('wellness')) {
            actions.push({ name: 'Add Service', href: '/admin/wellness', icon: Heart, color: 'bg-pink-500' });
        }
        if (modules.includes('products')) {
            actions.push({ name: 'Add Product', href: '/admin/products', icon: Package, color: 'bg-cyan-500' });
        }
        if (modules.includes('bookings')) {
            actions.push({ name: 'View Bookings', href: '/admin/bookings', icon: Calendar, color: 'bg-indigo-500' });
        }

        return actions.slice(0, 4); // Max 4 quick actions
    };

    // Get business-specific stats labels
    const getStatLabels = () => {
        switch (businessType) {
            case 'hotel':
                return { primary: 'Room Nights', secondary: 'Occupancy Rate', tertiary: 'Avg. Nightly Rate' };
            case 'ecommerce':
                return { primary: 'Total Orders', secondary: 'Products Sold', tertiary: 'Avg. Order Value' };
            case 'gym':
                return { primary: 'Active Members', secondary: 'Check-ins Today', tertiary: 'Retention Rate' };
            case 'events':
                return { primary: 'Events Hosted', secondary: 'Tickets Sold', tertiary: 'Avg. Attendance' };
            default:
                return { primary: 'Total Bookings', secondary: 'Occupancy Rate', tertiary: 'Avg. Booking Value' };
        }
    };

    const statLabels = getStatLabels();
    const quickActions = getQuickActions();

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    const StatCard = ({ title, value, icon: Icon, color, bgInfo, trend }) => (
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${bgInfo} text-white`}>
                    <Icon size={24} className={color} />
                </div>
                {trend && (
                    <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                        <ArrowUpRight size={14} className="mr-1" /> {trend}
                    </span>
                )}
            </div>
            <p className="text-slate-500 text-sm font-medium uppercase tracking-wide">{title}</p>
            <h3 className="text-3xl font-bold text-slate-900 mt-2 group-hover:scale-105 transition-transform origin-left">
                {value}
            </h3>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 p-4 sm:p-6 lg:p-8">
            {/* Header with Welcome Message */}
            <header className="mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            Welcome back, {tenant?.name || 'Admin'}! 👋
                        </h1>
                        <p className="text-slate-500 mt-1">Here's what's happening with your business today</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-medium rounded-full capitalize">
                            {businessType} Business
                        </span>
                    </div>
                </div>
            </header>

            {/* Quick Actions */}
            {quickActions.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {quickActions.map((action) => (
                            <Link
                                key={action.name}
                                href={action.href}
                                className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-xl hover:shadow-md hover:border-slate-300 transition-all group"
                            >
                                <div className={`p-2.5 rounded-lg ${action.color} text-white`}>
                                    <action.icon size={20} />
                                </div>
                                <span className="font-medium text-slate-700 group-hover:text-slate-900">{action.name}</span>
                                <ArrowRight size={16} className="ml-auto text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all" />
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Revenue"
                    value={formatCurrency(analytics?.overview?.totalRevenue || 0)}
                    icon={DollarSign}
                    color="text-emerald-600"
                    bgInfo="bg-emerald-100"
                    trend="+12.5%"
                />
                <StatCard
                    title={statLabels.primary}
                    value={analytics?.overview?.totalBookings || 0}
                    icon={Users}
                    color="text-blue-600"
                    bgInfo="bg-blue-100"
                    trend="+8.2%"
                />
                <StatCard
                    title={statLabels.tertiary}
                    value={formatCurrency(analytics?.overview?.avgBookingValue || 0)}
                    icon={TrendingUp}
                    color="text-purple-600"
                    bgInfo="bg-purple-100"
                />
                <StatCard
                    title={statLabels.secondary}
                    value={analytics?.overview?.occupancyRate ? `${analytics.overview.occupancyRate}%` : "0%"}
                    icon={Activity}
                    color="text-orange-600"
                    bgInfo="bg-orange-100"
                    trend="+2.4%"
                />
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Bookings */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-slate-900">Recent Bookings</h2>
                        <Link href="/admin/bookings" className="text-emerald-600 text-sm font-medium hover:text-emerald-700 transition-colors">
                            View All
                        </Link>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {recentBookings.length > 0 ? (
                            recentBookings.map((booking) => (
                                <div key={booking._id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                                            <Calendar size={18} className="text-slate-500" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900">{booking.listing?.title || booking.userName || 'Booking'}</p>
                                            <p className="text-xs text-slate-500">
                                                {new Date(booking.bookingDate || booking.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-emerald-600">{formatCurrency(booking.totalAmount || 0)}</p>
                                        <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                                booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-slate-100 text-slate-600'
                                            }`}>
                                            {booking.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-slate-500">No recent bookings</div>
                        )}
                    </div>
                </div>

                {/* Top Performing Listings */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-slate-900">Top Performing</h2>
                        <Link href="/admin/listings" className="text-emerald-600 text-sm font-medium hover:text-emerald-700 transition-colors">
                            View All
                        </Link>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {analytics?.topListings?.length > 0 ? (
                            analytics.topListings.slice(0, 5).map((item, index) => (
                                <div key={item._id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-500 font-bold text-sm">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900">{item.listing?.title || 'Listing'}</p>
                                            <p className="text-xs text-slate-500">{item.count} bookings</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-emerald-600">{formatCurrency(item.revenue)}</p>
                                        <div className="flex items-center gap-1 justify-end text-amber-500">
                                            <Star size={12} fill="currentColor" />
                                            <span className="text-xs">4.8</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-slate-500">No data available yet</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Module-specific Tips */}
            <div className="mt-8 p-6 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl text-white">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-white/20 rounded-xl">
                        <BarChart3 size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg mb-1">Grow Your {businessType.charAt(0).toUpperCase() + businessType.slice(1)} Business</h3>
                        <p className="text-emerald-100 text-sm mb-3">
                            {businessType === 'hotel' && 'Optimize your room availability and offer early booking discounts to increase occupancy rates.'}
                            {businessType === 'turf' && 'Enable slot booking and offer membership packages to attract regular customers.'}
                            {businessType === 'ecommerce' && 'Add high-quality product images and offer bundle deals to increase average order value.'}
                            {businessType === 'gym' && 'Create membership tiers and offer personal training sessions to boost retention.'}
                            {businessType === 'events' && 'Promote early-bird tickets and partner with local vendors to enhance event experiences.'}
                            {businessType === 'wellness' && 'Offer package deals and loyalty programs to encourage repeat visits.'}
                            {!['hotel', 'turf', 'ecommerce', 'gym', 'events', 'wellness'].includes(businessType) && 'Explore our features to maximize your business potential.'}
                        </p>
                        <Link href="/admin/settings" className="inline-flex items-center gap-2 px-4 py-2 bg-white text-emerald-600 font-medium rounded-lg hover:bg-emerald-50 transition-colors text-sm">
                            Explore Settings <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
