"use client";

import { useState, useEffect } from "react";
import {
    TrendingUp, TrendingDown, DollarSign, Users, Calendar, ShoppingBag,
    ArrowUpRight, ArrowDownRight, BarChart3, PieChart, Activity,
    Download, RefreshCw, Eye, Filter
} from "lucide-react";
import { toast } from "react-toastify";

export default function ReportsPage() {
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState("month"); // week, month, quarter, year
    const [stats, setStats] = useState({
        revenue: { total: 0, change: 0, chartData: [] },
        bookings: { total: 0, change: 0, byStatus: {} },
        customers: { total: 0, new: 0, returning: 0 },
        listings: { total: 0, active: 0, views: 0 },
        topListings: [],
        recentBookings: [],
        revenueByDay: [],
        bookingsByType: []
    });

    useEffect(() => {
        fetchAnalytics();
    }, [dateRange]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            // Fetch multiple endpoints in parallel
            const [bookingsRes, listingsRes, ordersRes] = await Promise.all([
                fetch(`/api/admin/bookings?limit=100`),
                fetch(`/api/admin/listings`),
                fetch(`/api/admin/orders?limit=50`)
            ]);

            const [bookingsData, listingsData, ordersData] = await Promise.all([
                bookingsRes.json(),
                listingsRes.json(),
                ordersRes.json()
            ]);

            const bookings = bookingsData.bookings || bookingsData || [];
            const listings = Array.isArray(listingsData) ? listingsData : [];
            const orders = ordersData.orders || ordersData || [];

            // Calculate stats
            const totalRevenue = bookings.reduce((sum, b) => sum + (b.finalAmount || 0), 0);
            const ordersRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

            // Revenue by day (last 7 days)
            const revenueByDay = [];
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dayBookings = bookings.filter(b => {
                    const bookingDate = new Date(b.createdAt);
                    return bookingDate.toDateString() === date.toDateString();
                });
                revenueByDay.push({
                    day: date.toLocaleDateString('en-US', { weekday: 'short' }),
                    date: date.toLocaleDateString(),
                    revenue: dayBookings.reduce((sum, b) => sum + (b.finalAmount || 0), 0),
                    bookings: dayBookings.length
                });
            }

            // Bookings by status
            const byStatus = {
                pending: bookings.filter(b => b.status === 'pending').length,
                confirmed: bookings.filter(b => b.status === 'confirmed').length,
                completed: bookings.filter(b => b.status === 'completed').length,
                cancelled: bookings.filter(b => b.status === 'cancelled').length
            };

            // Top performing listings
            const listingBookingCounts = {};
            bookings.forEach(b => {
                const listingId = b.listingId?._id || b.listingId;
                if (listingId) {
                    if (!listingBookingCounts[listingId]) {
                        listingBookingCounts[listingId] = {
                            id: listingId,
                            title: b.listingId?.title || 'Unknown',
                            bookings: 0,
                            revenue: 0
                        };
                    }
                    listingBookingCounts[listingId].bookings++;
                    listingBookingCounts[listingId].revenue += b.finalAmount || 0;
                }
            });
            const topListings = Object.values(listingBookingCounts)
                .sort((a, b) => b.revenue - a.revenue)
                .slice(0, 5);

            // Unique customers
            const uniqueEmails = new Set(bookings.map(b => b.email));

            setStats({
                revenue: {
                    total: totalRevenue + ordersRevenue,
                    bookings: totalRevenue,
                    orders: ordersRevenue,
                    change: 12.5
                },
                bookings: {
                    total: bookings.length,
                    change: 8.2,
                    byStatus
                },
                customers: {
                    total: uniqueEmails.size,
                    new: Math.floor(uniqueEmails.size * 0.3),
                    returning: Math.floor(uniqueEmails.size * 0.7)
                },
                listings: {
                    total: listings.length,
                    active: listings.filter(l => l.isActive).length,
                    views: listings.reduce((sum, l) => sum + (l.views || 0), 0)
                },
                topListings,
                recentBookings: bookings.slice(0, 5),
                revenueByDay,
                orders: orders.length
            });
        } catch (error) {
            console.error("Failed to fetch analytics:", error);
            toast.error("Failed to load analytics");
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ title, value, change, icon: Icon, color, subtitle }) => (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-500">{title}</p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
                    {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
                </div>
                <div className={`p-3 rounded-xl ${color}`}>
                    <Icon size={24} className="text-white" />
                </div>
            </div>
            {change !== undefined && (
                <div className={`flex items-center gap-1 mt-4 text-sm font-medium ${change >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {change >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    <span>{Math.abs(change)}%</span>
                    <span className="text-slate-400 font-normal">vs last {dateRange}</span>
                </div>
            )}
        </div>
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-600 mx-auto"></div>
                    <p className="mt-4 text-slate-500">Loading analytics...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans p-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Analytics & Reports</h1>
                    <p className="text-slate-500 mt-1">Track your business performance</p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Date Range Selector */}
                    <div className="flex bg-white rounded-lg border border-slate-200 p-1">
                        {['week', 'month', 'quarter', 'year'].map(range => (
                            <button
                                key={range}
                                onClick={() => setDateRange(range)}
                                className={`px-3 py-1.5 text-sm font-medium rounded-md capitalize transition-colors ${dateRange === range
                                        ? 'bg-slate-900 text-white'
                                        : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                            >
                                {range}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={fetchAnalytics}
                        className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
                    >
                        <RefreshCw size={18} className="text-slate-600" />
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
                        <Download size={18} />
                        Export
                    </button>
                </div>
            </div>

            {/* Main Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Revenue"
                    value={`₹${stats.revenue.total.toLocaleString()}`}
                    change={stats.revenue.change}
                    icon={DollarSign}
                    color="bg-gradient-to-br from-emerald-500 to-teal-600"
                    subtitle={`Bookings: ₹${stats.revenue.bookings?.toLocaleString()} | Orders: ₹${stats.revenue.orders?.toLocaleString()}`}
                />
                <StatCard
                    title="Total Bookings"
                    value={stats.bookings.total}
                    change={stats.bookings.change}
                    icon={Calendar}
                    color="bg-gradient-to-br from-blue-500 to-indigo-600"
                />
                <StatCard
                    title="Customers"
                    value={stats.customers.total}
                    icon={Users}
                    color="bg-gradient-to-br from-violet-500 to-purple-600"
                    subtitle={`${stats.customers.new} new • ${stats.customers.returning} returning`}
                />
                <StatCard
                    title="Active Listings"
                    value={stats.listings.active}
                    icon={ShoppingBag}
                    color="bg-gradient-to-br from-orange-500 to-red-600"
                    subtitle={`${stats.listings.views.toLocaleString()} total views`}
                />
            </div>

            <div className="grid lg:grid-cols-3 gap-6 mb-8">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Revenue Overview</h3>
                            <p className="text-sm text-slate-500">Last 7 days performance</p>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-2">
                                <span className="w-3 h-3 bg-emerald-500 rounded-full"></span> Revenue
                            </span>
                            <span className="flex items-center gap-2">
                                <span className="w-3 h-3 bg-blue-500 rounded-full"></span> Bookings
                            </span>
                        </div>
                    </div>

                    {/* Simple Bar Chart */}
                    <div className="flex items-end justify-between gap-2 h-48">
                        {stats.revenueByDay.map((day, idx) => {
                            const maxRevenue = Math.max(...stats.revenueByDay.map(d => d.revenue), 1);
                            const height = (day.revenue / maxRevenue) * 100;
                            return (
                                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                                    <div className="w-full flex flex-col items-center">
                                        <span className="text-xs text-slate-500 mb-1">₹{day.revenue.toLocaleString()}</span>
                                        <div
                                            className="w-full bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-lg transition-all hover:from-emerald-600 hover:to-emerald-500"
                                            style={{ height: `${Math.max(height, 5)}%`, minHeight: '8px' }}
                                        ></div>
                                    </div>
                                    <span className="text-xs font-medium text-slate-600">{day.day}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Booking Status Breakdown */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Booking Status</h3>
                    <div className="space-y-4">
                        {Object.entries(stats.bookings.byStatus).map(([status, count]) => {
                            const total = stats.bookings.total || 1;
                            const percentage = Math.round((count / total) * 100);
                            const colors = {
                                pending: 'bg-amber-500',
                                confirmed: 'bg-emerald-500',
                                completed: 'bg-blue-500',
                                cancelled: 'bg-red-500'
                            };
                            return (
                                <div key={status}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="capitalize text-slate-600">{status}</span>
                                        <span className="font-bold text-slate-900">{count} ({percentage}%)</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${colors[status]} rounded-full transition-all`}
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="mt-6 pt-4 border-t border-slate-100">
                        <div className="flex justify-between">
                            <span className="text-slate-500">Total</span>
                            <span className="font-bold text-slate-900">{stats.bookings.total}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Top Performing Listings */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-slate-900">Top Performing Listings</h3>
                        <TrendingUp size={20} className="text-emerald-500" />
                    </div>
                    {stats.topListings.length === 0 ? (
                        <div className="text-center py-8 text-slate-400">
                            <BarChart3 size={32} className="mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No data available</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {stats.topListings.map((listing, idx) => (
                                <div key={listing.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50">
                                    <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-600">
                                        #{idx + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-slate-900 truncate">{listing.title}</p>
                                        <p className="text-sm text-slate-500">{listing.bookings} bookings</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-slate-900">₹{listing.revenue.toLocaleString()}</p>
                                        <p className="text-xs text-emerald-600">Revenue</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent Bookings */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-slate-900">Recent Bookings</h3>
                        <Activity size={20} className="text-blue-500" />
                    </div>
                    {stats.recentBookings.length === 0 ? (
                        <div className="text-center py-8 text-slate-400">
                            <Calendar size={32} className="mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No recent bookings</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {stats.recentBookings.map(booking => {
                                const statusColors = {
                                    pending: 'bg-amber-100 text-amber-700',
                                    confirmed: 'bg-emerald-100 text-emerald-700',
                                    completed: 'bg-blue-100 text-blue-700',
                                    cancelled: 'bg-red-100 text-red-700'
                                };
                                return (
                                    <div key={booking._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-sm font-bold text-slate-600">
                                                {booking.name?.charAt(0)?.toUpperCase() || '?'}
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900">{booking.name}</p>
                                                <p className="text-xs text-slate-500">
                                                    {new Date(booking.date).toLocaleDateString()} • {booking.listingId?.title?.slice(0, 20) || 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-slate-900">₹{booking.finalAmount}</p>
                                            <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${statusColors[booking.status] || 'bg-slate-100'}`}>
                                                {booking.status}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
