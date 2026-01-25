"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "../../../lib/currency";
import { DollarSign, Users, TrendingUp, Activity, ArrowUpRight } from "lucide-react";

export default function TenantDashboard() {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch("/api/admin/analytics");
                const data = await res.json();
                setAnalytics(data);
            } catch (error) {
                console.error("Failed to fetch analytics", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

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
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 p-8">
            <header className="mb-10">
                <h1 className="text-2xl font-bold text-slate-900">
                    Business Dashboard
                </h1>
                <p className="text-slate-500 mt-1">Overview of your business performance</p>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <StatCard
                    title="Total Revenue"
                    value={formatCurrency(analytics?.overview?.totalRevenue || 0)}
                    icon={DollarSign}
                    color="text-emerald-600"
                    bgInfo="bg-emerald-100"
                    trend="+12.5%"
                />
                <StatCard
                    title="Total Bookings"
                    value={analytics?.overview?.totalBookings || 0}
                    icon={Users}
                    color="text-blue-600"
                    bgInfo="bg-blue-100"
                    trend="+8.2%"
                />
                <StatCard
                    title="Avg. Value"
                    value={formatCurrency(analytics?.overview?.avgBookingValue || 0)}
                    icon={TrendingUp}
                    color="text-purple-600"
                    bgInfo="bg-purple-100"
                />
                <StatCard
                    title="Occupancy Rate"
                    value="85%"
                    icon={Activity}
                    color="text-orange-600"
                    bgInfo="bg-orange-100"
                    trend="+2.4%"
                />
            </div>

            {/* Top Listings */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-900">Top Performing Listings</h2>
                    <button className="text-emerald-600 text-sm font-medium hover:text-emerald-700 transition-colors">View All</button>
                </div>
                <div className="divide-y divide-slate-100">
                    {analytics?.topListings?.length > 0 ? (
                        analytics.topListings.map((item, index) => (
                            <div key={item._id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-500 font-bold text-sm">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900">{item.listing.title}</p>
                                        <p className="text-sm text-slate-500">{item.count} bookings this month</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-emerald-600">{formatCurrency(item.revenue)}</p>
                                    <p className="text-xs text-slate-400">Total Revenue</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center text-slate-500">No data available yet</div>
                    )}
                </div>
            </div>
        </div>
    );
}
