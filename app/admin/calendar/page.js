"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User, MapPin, Eye, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";
import Link from "next/link";

export default function BookingCalendarPage() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState("month"); // month, week, day
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedBooking, setSelectedBooking] = useState(null);

    useEffect(() => {
        fetchBookings();
    }, [currentDate]);

    const fetchBookings = async () => {
        try {
            const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

            const res = await fetch(`/api/admin/bookings?startDate=${startOfMonth.toISOString()}&endDate=${endOfMonth.toISOString()}`);
            const data = await res.json();
            setBookings(data.bookings || data || []);
        } catch (error) {
            console.error("Failed to fetch bookings");
        } finally {
            setLoading(false);
        }
    };

    // Calendar helpers
    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startDayOfWeek = firstDay.getDay();

        const days = [];

        // Previous month days
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = startDayOfWeek - 1; i >= 0; i--) {
            days.push({ day: prevMonthLastDay - i, isCurrentMonth: false, date: new Date(year, month - 1, prevMonthLastDay - i) });
        }

        // Current month days
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({ day: i, isCurrentMonth: true, date: new Date(year, month, i) });
        }

        // Next month days
        const remainingDays = 42 - days.length;
        for (let i = 1; i <= remainingDays; i++) {
            days.push({ day: i, isCurrentMonth: false, date: new Date(year, month + 1, i) });
        }

        return days;
    };

    const getBookingsForDate = (date) => {
        return bookings.filter(b => {
            const bookingDate = new Date(b.date);
            return bookingDate.toDateString() === date.toDateString();
        });
    };

    const navigateMonth = (direction) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'confirmed': return 'bg-emerald-500';
            case 'pending': return 'bg-amber-500';
            case 'completed': return 'bg-blue-500';
            case 'cancelled': return 'bg-red-500';
            default: return 'bg-slate-400';
        }
    };

    const getStatusBadge = (status) => {
        const colors = {
            confirmed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
            pending: 'bg-amber-100 text-amber-700 border-amber-200',
            completed: 'bg-blue-100 text-blue-700 border-blue-200',
            cancelled: 'bg-red-100 text-red-700 border-red-200',
        };
        return colors[status?.toLowerCase()] || 'bg-slate-100 text-slate-700';
    };

    const days = getDaysInMonth(currentDate);
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const today = new Date();
    const isToday = (date) => date.toDateString() === today.toDateString();

    // Stats
    const stats = {
        total: bookings.length,
        confirmed: bookings.filter(b => b.status?.toLowerCase() === 'confirmed').length,
        pending: bookings.filter(b => b.status?.toLowerCase() === 'pending').length,
        revenue: bookings.filter(b => b.status !== 'cancelled').reduce((sum, b) => sum + (b.finalAmount || 0), 0)
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans p-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Booking Calendar</h1>
                    <p className="text-slate-500 mt-1">View and manage all bookings in calendar view</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={goToToday} className="px-4 py-2 text-sm font-medium text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100">
                        Today
                    </button>
                    <Link href="/admin/bookings" className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">
                        List View
                    </Link>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <p className="text-sm text-slate-500">This Month</p>
                    <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                    <p className="text-xs text-slate-400">Total bookings</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <p className="text-sm text-slate-500">Confirmed</p>
                    <p className="text-2xl font-bold text-emerald-600">{stats.confirmed}</p>
                    <p className="text-xs text-slate-400">Confirmed bookings</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <p className="text-sm text-slate-500">Pending</p>
                    <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
                    <p className="text-xs text-slate-400">Awaiting confirmation</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <p className="text-sm text-slate-500">Revenue</p>
                    <p className="text-2xl font-bold text-slate-900">₹{stats.revenue.toLocaleString()}</p>
                    <p className="text-xs text-slate-400">This month</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-4 gap-6">
                {/* Calendar */}
                <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    {/* Calendar Header */}
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button onClick={() => navigateMonth(-1)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                                <ChevronLeft size={20} className="text-slate-600" />
                            </button>
                            <h2 className="text-lg font-bold text-slate-900">
                                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                            </h2>
                            <button onClick={() => navigateMonth(1)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                                <ChevronRight size={20} className="text-slate-600" />
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            {['month', 'week'].map(v => (
                                <button
                                    key={v}
                                    onClick={() => setView(v)}
                                    className={`px-3 py-1.5 text-sm font-medium rounded-lg capitalize ${view === v ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                                >
                                    {v}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Week Days Header */}
                    <div className="grid grid-cols-7 border-b border-slate-100">
                        {weekDays.map(day => (
                            <div key={day} className="p-3 text-center text-xs font-bold text-slate-500 uppercase">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7">
                        {days.map((dayObj, idx) => {
                            const dayBookings = getBookingsForDate(dayObj.date);
                            const hasBookings = dayBookings.length > 0;

                            return (
                                <div
                                    key={idx}
                                    onClick={() => { setSelectedDate(dayObj.date); setSelectedBooking(null); }}
                                    className={`min-h-[100px] p-2 border-b border-r border-slate-100 cursor-pointer transition-colors
                                        ${dayObj.isCurrentMonth ? 'bg-white' : 'bg-slate-50/50'}
                                        ${isToday(dayObj.date) ? 'bg-emerald-50/50' : ''}
                                        ${selectedDate?.toDateString() === dayObj.date.toDateString() ? 'ring-2 ring-emerald-500 ring-inset' : ''}
                                        hover:bg-slate-50
                                    `}
                                >
                                    <div className={`text-sm font-medium mb-1 ${dayObj.isCurrentMonth ? 'text-slate-900' : 'text-slate-400'} ${isToday(dayObj.date) ? 'text-emerald-600' : ''}`}>
                                        {isToday(dayObj.date) ? (
                                            <span className="inline-flex items-center justify-center w-6 h-6 bg-emerald-600 text-white rounded-full text-xs">
                                                {dayObj.day}
                                            </span>
                                        ) : dayObj.day}
                                    </div>

                                    <div className="space-y-1">
                                        {dayBookings.slice(0, 3).map(booking => (
                                            <div
                                                key={booking._id}
                                                onClick={(e) => { e.stopPropagation(); setSelectedBooking(booking); }}
                                                className={`text-xs px-1.5 py-0.5 rounded truncate text-white cursor-pointer hover:opacity-80 ${getStatusColor(booking.status)}`}
                                            >
                                                {booking.timeSlots?.[0] || ''} {booking.name?.split(' ')[0]}
                                            </div>
                                        ))}
                                        {dayBookings.length > 3 && (
                                            <div className="text-xs text-slate-500 pl-1">+{dayBookings.length - 3} more</div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Sidebar - Selected Day/Booking Details */}
                <div className="lg:col-span-1 space-y-4">
                    {/* Selected Date Bookings */}
                    {selectedDate && (
                        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                            <div className="p-4 border-b border-slate-100 bg-slate-50">
                                <h3 className="font-bold text-slate-900">
                                    {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                                </h3>
                                <p className="text-sm text-slate-500">{getBookingsForDate(selectedDate).length} bookings</p>
                            </div>
                            <div className="p-4 max-h-[400px] overflow-y-auto">
                                {getBookingsForDate(selectedDate).length === 0 ? (
                                    <div className="text-center py-8 text-slate-400">
                                        <CalendarIcon size={32} className="mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">No bookings for this day</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {getBookingsForDate(selectedDate).map(booking => (
                                            <div
                                                key={booking._id}
                                                onClick={() => setSelectedBooking(booking)}
                                                className={`p-3 rounded-xl border cursor-pointer transition-all ${selectedBooking?._id === booking._id ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}`}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-medium text-sm text-slate-900">{booking.name}</span>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize border ${getStatusBadge(booking.status)}`}>
                                                        {booking.status}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                                    <Clock size={12} />
                                                    {Array.isArray(booking.timeSlots) ? booking.timeSlots.join(', ') : booking.timeSlots}
                                                </div>
                                                <div className="text-sm font-bold text-slate-900 mt-2">₹{booking.finalAmount}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Selected Booking Details */}
                    {selectedBooking && (
                        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                            <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-teal-50">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-slate-900">Booking Details</h3>
                                    <button onClick={() => setSelectedBooking(null)} className="text-slate-400 hover:text-slate-600">
                                        <XCircle size={18} />
                                    </button>
                                </div>
                            </div>
                            <div className="p-4 space-y-4">
                                <div>
                                    <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Customer</p>
                                    <p className="font-medium text-slate-900">{selectedBooking.name}</p>
                                    <p className="text-sm text-slate-500">{selectedBooking.email}</p>
                                    <p className="text-sm text-slate-500">{selectedBooking.mobile}</p>
                                </div>

                                <div>
                                    <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Venue</p>
                                    <p className="font-medium text-slate-900">{selectedBooking.listingId?.title || 'N/A'}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Date</p>
                                        <p className="text-sm text-slate-900">{new Date(selectedBooking.date).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Time</p>
                                        <p className="text-sm text-slate-900">{Array.isArray(selectedBooking.timeSlots) ? selectedBooking.timeSlots.join(', ') : selectedBooking.timeSlots}</p>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-100">
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-500">Total Amount</span>
                                        <span className="text-xl font-bold text-slate-900">₹{selectedBooking.finalAmount}</span>
                                    </div>
                                </div>

                                <Link
                                    href={`/admin/bookings?id=${selectedBooking._id}`}
                                    className="block w-full text-center py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                                >
                                    View Full Details
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Legend */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-4">
                        <h4 className="text-sm font-bold text-slate-900 mb-3">Status Legend</h4>
                        <div className="space-y-2">
                            {[
                                { status: 'confirmed', label: 'Confirmed' },
                                { status: 'pending', label: 'Pending' },
                                { status: 'completed', label: 'Completed' },
                                { status: 'cancelled', label: 'Cancelled' },
                            ].map(item => (
                                <div key={item.status} className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${getStatusColor(item.status)}`}></div>
                                    <span className="text-sm text-slate-600">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
