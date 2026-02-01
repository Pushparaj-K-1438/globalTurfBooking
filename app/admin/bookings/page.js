"use client";

import { useState, useEffect } from "react";
import { Search, Filter, Calendar, CheckCircle, XCircle, Clock, Eye, AlertCircle, Download, RefreshCw } from "lucide-react";
import { toast } from "react-toastify";

export default function AdminBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/admin/bookings");
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.details || errData.error || `Error ${res.status}`);
            }
            const data = await res.json();
            if (Array.isArray(data)) {
                setBookings(data);
            } else if (data.bookings && Array.isArray(data.bookings)) {
                setBookings(data.bookings);
            } else {
                setBookings([]);
            }
        } catch (error) {
            console.error("Failed to fetch bookings", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (bookingId, newStatus) => {
        try {
            const res = await fetch(`/api/admin/bookings/${bookingId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                toast.success(`Booking ${newStatus}`);
                fetchBookings();
            } else {
                toast.error("Failed to update booking status");
            }
        } catch (error) {
            toast.error("An error occurred");
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'confirmed': return 'bg-emerald-100 text-emerald-700';
            case 'pending': return 'bg-amber-100 text-amber-700';
            case 'cancelled': return 'bg-red-100 text-red-700';
            case 'completed': return 'bg-blue-100 text-blue-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'confirmed': return <CheckCircle size={14} />;
            case 'pending': return <Clock size={14} />;
            case 'cancelled': return <XCircle size={14} />;
            case 'completed': return <CheckCircle size={14} />;
            default: return null;
        }
    };

    const filteredBookings = bookings.filter(b => {
        const matchesSearch =
            b.bookingId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.listingId?.title?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || b.status?.toLowerCase() === statusFilter.toLowerCase();
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: bookings.length,
        confirmed: bookings.filter(b => b.status?.toLowerCase() === 'confirmed').length,
        pending: bookings.filter(b => b.status?.toLowerCase() === 'pending').length,
        completed: bookings.filter(b => b.status?.toLowerCase() === 'completed').length,
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 p-8">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Bookings</h1>
                    <p className="text-slate-500 mt-1">Manage all your reservations</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={fetchBookings}
                        className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600"
                    >
                        <RefreshCw size={16} /> Refresh
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600">
                        <Download size={16} /> Export
                    </button>
                </div>
            </header>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'Total', count: stats.total, color: 'bg-slate-100 text-slate-700' },
                    { label: 'Confirmed', count: stats.confirmed, color: 'bg-emerald-100 text-emerald-700' },
                    { label: 'Pending', count: stats.pending, color: 'bg-amber-100 text-amber-700' },
                    { label: 'Completed', count: stats.completed, color: 'bg-blue-100 text-blue-700' },
                ].map(stat => (
                    <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between shadow-sm">
                        <span className="text-sm font-medium text-slate-500">{stat.label}</span>
                        <span className={`text-2xl font-bold ${stat.color.split(' ')[1]}`}>{stat.count}</span>
                    </div>
                ))}
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
                    <AlertCircle size={20} />
                    <span>Failed to load bookings: {error}</span>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 flex flex-wrap items-center gap-4 shadow-sm">
                <div className="flex-1 min-w-[200px] relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by ID, name, email, or listing..."
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter size={16} className="text-slate-400" />
                    {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${statusFilter === status
                                ? 'bg-slate-900 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Bookings Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Booking ID</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Listing</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Customer</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Date & Time</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Amount</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredBookings.length > 0 ? filteredBookings.map((booking) => (
                                <tr key={booking._id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 font-mono text-sm font-medium text-slate-900">{booking.bookingId}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-slate-900 text-sm">{booking.listingId?.title || 'Unknown Listing'}</div>
                                        <div className="text-xs text-slate-500">{booking.listingId?.type}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-slate-900">{booking.name}</div>
                                        <div className="text-xs text-slate-500">{booking.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <Calendar size={14} />
                                            {booking.date ? new Date(booking.date).toLocaleDateString() : 'N/A'}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                            <Clock size={14} />
                                            {Array.isArray(booking.timeSlots) ? booking.timeSlots.join(', ') : (booking.timeSlot || 'N/A')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-900">₹{booking.finalAmount || booking.totalAmount}</div>
                                        {booking.totalAmount > booking.finalAmount && (
                                            <span className="text-xs text-emerald-600">Discounted</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold capitalize ${getStatusColor(booking.status)}`}>
                                            {getStatusIcon(booking.status)}
                                            {booking.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        {booking.status?.toLowerCase() === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => handleStatusUpdate(booking._id, 'confirmed')}
                                                    className="text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:underline"
                                                >
                                                    Confirm
                                                </button>
                                                <button
                                                    onClick={() => handleStatusUpdate(booking._id, 'cancelled')}
                                                    className="text-sm font-medium text-red-600 hover:text-red-700 hover:underline"
                                                >
                                                    Cancel
                                                </button>
                                            </>
                                        )}
                                        {booking.status?.toLowerCase() === 'confirmed' && (
                                            <button
                                                onClick={() => handleStatusUpdate(booking._id, 'completed')}
                                                className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
                                            >
                                                Complete
                                            </button>
                                        )}
                                        <button className="text-sm font-medium text-slate-600 hover:text-slate-700 hover:underline">
                                            <Eye size={14} className="inline" /> View
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <AlertCircle size={32} className="text-slate-300" />
                                            <p>No bookings found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
