"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle, Calendar, Clock, MapPin, Download, Share2, ArrowRight, Home } from "lucide-react";
import Link from "next/link";

export default function BookingConfirmationPage() {
    const { id } = useParams();
    const router = useRouter();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBooking();
    }, [id]);

    const fetchBooking = async () => {
        try {
            const res = await fetch(`/api/bookings/${id}`);
            const data = await res.json();
            if (data && !data.error) setBooking(data);
        } catch (error) { console.error("Failed to fetch booking"); }
        finally { setLoading(false); }
    };

    if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-600"></div></div>;

    if (!booking) return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
            <p className="text-slate-500 mb-4">Booking not found</p>
            <Link href="/" className="text-emerald-600 font-medium hover:underline">Go Home</Link>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 font-sans flex items-center justify-center p-4">
            <div className="max-w-lg w-full">
                {/* Success Card */}
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-8 text-center">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <CheckCircle size={48} className="text-emerald-500" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Booking Confirmed!</h1>
                        <p className="text-emerald-100">Your reservation has been successfully processed</p>
                    </div>

                    {/* Booking Details */}
                    <div className="p-6 space-y-4">
                        <div className="bg-slate-50 rounded-xl p-4">
                            <p className="text-xs text-slate-500 uppercase font-bold mb-1">Booking ID</p>
                            <p className="text-lg font-mono font-bold text-slate-900">{booking._id}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 rounded-xl p-4">
                                <div className="flex items-center gap-2 text-slate-500 mb-1">
                                    <Calendar size={14} />
                                    <span className="text-xs uppercase font-bold">Date</span>
                                </div>
                                <p className="font-semibold text-slate-900">
                                    {new Date(booking.bookingDate || booking.slotId?.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                </p>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-4">
                                <div className="flex items-center gap-2 text-slate-500 mb-1">
                                    <Clock size={14} />
                                    <span className="text-xs uppercase font-bold">Time</span>
                                </div>
                                <p className="font-semibold text-slate-900">
                                    {booking.slotId?.startTime || booking.startTime} - {booking.slotId?.endTime || booking.endTime}
                                </p>
                            </div>
                        </div>

                        <div className="bg-slate-50 rounded-xl p-4">
                            <div className="flex items-center gap-2 text-slate-500 mb-1">
                                <MapPin size={14} />
                                <span className="text-xs uppercase font-bold">Venue</span>
                            </div>
                            <p className="font-semibold text-slate-900">{booking.listingId?.title || 'Venue'}</p>
                            <p className="text-sm text-slate-500">{booking.listingId?.location?.address}</p>
                        </div>

                        <div className="bg-emerald-50 rounded-xl p-4 flex justify-between items-center">
                            <span className="text-sm font-medium text-slate-600">Amount Paid</span>
                            <span className="text-xl font-bold text-emerald-600">₹{booking.finalAmount || booking.totalAmount}</span>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-3 pt-4">
                            <button className="flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition-colors">
                                <Download size={16} /> Download
                            </button>
                            <button className="flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition-colors">
                                <Share2 size={16} /> Share
                            </button>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 bg-slate-50 border-t border-slate-100">
                        <p className="text-sm text-slate-500 text-center mb-4">
                            A confirmation email has been sent to your email address
                        </p>
                        <Link href="/" className="flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors">
                            <Home size={18} /> Back to Home
                        </Link>
                    </div>
                </div>

                {/* Additional Info */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-slate-500">
                        Need help? <a href="/support" className="text-emerald-600 font-medium hover:underline">Contact Support</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
