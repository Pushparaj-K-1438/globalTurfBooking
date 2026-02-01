"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, Users, CreditCard, ChevronDown, Check, AlertCircle, Sparkles, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import RazorpayButton from "./RazorpayButton";

export default function QuickBookingWidget({
    listing,
    onBookingComplete,
    className = ""
}) {
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedSlots, setSelectedSlots] = useState([]);
    const [guests, setGuests] = useState(1);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetchingSlots, setFetchingSlots] = useState(false);
    const [step, setStep] = useState(1); // 1: Date & Slots, 2: Details, 3: Payment

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        mobile: "",
        notes: ""
    });
    const [bookingData, setBookingData] = useState(null);

    // Calculate pricing
    const basePrice = listing?.priceConfig?.basePrice || 500;
    const pricePerSlot = basePrice;
    const subtotal = selectedSlots.length * pricePerSlot;
    const tax = Math.round(subtotal * 0.18);
    const total = subtotal + tax;

    // Get minimum date (today)
    const today = new Date();
    const minDate = today.toISOString().split('T')[0];

    // Get max date (30 days from now)
    const maxDate = new Date(today.setDate(today.getDate() + 30)).toISOString().split('T')[0];

    useEffect(() => {
        if (selectedDate && listing?._id) {
            fetchAvailableSlots();
        }
    }, [selectedDate]);

    const fetchAvailableSlots = async () => {
        setFetchingSlots(true);
        try {
            const res = await fetch(`/api/slots?listingId=${listing._id}&date=${selectedDate}`);
            const data = await res.json();
            if (res.ok) {
                setAvailableSlots(data.filter(slot => slot.isAvailable));
            }
        } catch (error) {
            console.error("Failed to fetch slots");
        } finally {
            setFetchingSlots(false);
        }
    };

    const toggleSlot = (slot) => {
        if (selectedSlots.includes(slot.time)) {
            setSelectedSlots(selectedSlots.filter(s => s !== slot.time));
        } else {
            setSelectedSlots([...selectedSlots, slot.time]);
        }
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.email || !formData.mobile) {
            toast.error("Please fill in all required fields");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/bookings", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-tenant-id": listing.tenantId?._id || listing.tenantId
                },
                body: JSON.stringify({
                    listingId: listing._id,
                    date: selectedDate,
                    timeSlots: selectedSlots,
                    guests,
                    name: formData.name,
                    email: formData.email,
                    mobile: formData.mobile,
                    notes: formData.notes,
                    totalAmount: subtotal,
                    taxAmount: tax,
                    finalAmount: total,
                    status: "pending"
                })
            });

            const data = await res.json();
            if (res.ok) {
                setBookingData(data);
                toast.success("Booking initialized! Please complete payment.");
                setStep(3); // Move to payment step
            } else {
                toast.error(data.error || "Booking failed");
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    // Generate time slots if API doesn't return any
    const displaySlots = availableSlots.length > 0 ? availableSlots : [
        { time: "06:00 - 07:00", isAvailable: true },
        { time: "07:00 - 08:00", isAvailable: true },
        { time: "08:00 - 09:00", isAvailable: true },
        { time: "09:00 - 10:00", isAvailable: true },
        { time: "10:00 - 11:00", isAvailable: true },
        { time: "16:00 - 17:00", isAvailable: true },
        { time: "17:00 - 18:00", isAvailable: true },
        { time: "18:00 - 19:00", isAvailable: true },
        { time: "19:00 - 20:00", isAvailable: true },
        { time: "20:00 - 21:00", isAvailable: true },
    ];

    return (
        <div className={`bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden ${className}`}>
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium opacity-90">Starting from</span>
                    <Sparkles size={18} className="opacity-70" />
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold">₹{basePrice}</span>
                    <span className="opacity-80">/{listing?.priceConfig?.pricingModel === 'per_night' ? 'night' : 'slot'}</span>
                </div>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                {[
                    { num: 1, label: "Select" },
                    { num: 2, label: "Details" },
                    { num: 3, label: "Confirm" }
                ].map((s, idx) => (
                    <div key={s.num} className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= s.num ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'
                            }`}>
                            {step > s.num || (step === 4 && s.num === 3) ? <Check size={16} /> : s.num}
                        </div>
                        <span className={`ml-2 text-sm ${step >= s.num ? 'text-slate-900' : 'text-slate-400'}`}>{s.label}</span>
                        {idx < 2 && <div className={`w-8 h-0.5 mx-3 ${step > s.num ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>}
                    </div>
                ))}
            </div>

            <div className="p-6">
                {/* Step 1: Date & Slots */}
                {step === 1 && (
                    <div className="space-y-6">
                        {/* Date Picker */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                                <Calendar size={16} className="text-emerald-600" />
                                Select Date
                            </label>
                            <input
                                type="date"
                                min={minDate}
                                max={maxDate}
                                value={selectedDate}
                                onChange={(e) => { setSelectedDate(e.target.value); setSelectedSlots([]); }}
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                            />
                        </div>

                        {/* Time Slots */}
                        {selectedDate && (
                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                                    <Clock size={16} className="text-emerald-600" />
                                    Available Slots
                                </label>
                                {fetchingSlots ? (
                                    <div className="text-center py-8 text-slate-400">
                                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-emerald-600 border-t-transparent mx-auto mb-2"></div>
                                        Checking availability...
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto">
                                        {displaySlots.map((slot) => (
                                            <button
                                                key={slot.time}
                                                onClick={() => toggleSlot(slot)}
                                                disabled={!slot.isAvailable}
                                                className={`p-3 rounded-xl text-sm font-medium transition-all ${selectedSlots.includes(slot.time)
                                                    ? 'bg-emerald-600 text-white'
                                                    : slot.isAvailable
                                                        ? 'bg-slate-50 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200'
                                                        : 'bg-slate-100 text-slate-400 cursor-not-allowed line-through'
                                                    }`}
                                            >
                                                {slot.time}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Guests */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                                <Users size={16} className="text-emerald-600" />
                                Number of Guests
                            </label>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setGuests(Math.max(1, guests - 1))}
                                    className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center text-lg font-bold hover:bg-slate-50"
                                >-</button>
                                <span className="text-xl font-bold text-slate-900">{guests}</span>
                                <button
                                    onClick={() => setGuests(Math.min(listing?.capacity || 20, guests + 1))}
                                    className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center text-lg font-bold hover:bg-slate-50"
                                >+</button>
                            </div>
                        </div>

                        {/* Continue Button */}
                        <button
                            onClick={() => setStep(2)}
                            disabled={!selectedDate || selectedSlots.length === 0}
                            className="w-full py-3.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
                        >
                            Continue
                        </button>
                    </div>
                )}

                {/* Step 2: Contact Details */}
                {step === 2 && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name *</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Enter your name"
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email *</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="your@email.com"
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mobile *</label>
                            <input
                                type="tel"
                                value={formData.mobile}
                                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                placeholder="+91 XXXXX XXXXX"
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Notes (optional)</label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Any special requests?"
                                rows={2}
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none resize-none"
                            />
                        </div>

                        {/* Price Summary */}
                        <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                            <div className="flex justify-between text-sm text-slate-600">
                                <span>{selectedSlots.length} slot(s) × ₹{pricePerSlot}</span>
                                <span>₹{subtotal}</span>
                            </div>
                            <div className="flex justify-between text-sm text-slate-600">
                                <span>GST (18%)</span>
                                <span>₹{tax}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold text-slate-900 pt-2 border-t border-slate-200">
                                <span>Total</span>
                                <span>₹{total}</span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setStep(1)}
                                className="flex-1 py-3 border border-slate-200 rounded-xl font-medium text-slate-600 hover:bg-slate-50"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                ) : (
                                    <>
                                        <CreditCard size={18} />
                                        Book Now
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Payment */}
                {step === 3 && (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-slate-900">Final Step: Secure Payment</h3>
                            <p className="text-slate-500 text-sm mt-1">Complete payment to confirm your booking</p>
                        </div>

                        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Venue</span>
                                    <span className="font-medium text-slate-900 line-clamp-1">{listing.title}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Date</span>
                                    <span className="font-medium text-slate-900">{new Date(selectedDate).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Slots</span>
                                    <span className="font-medium text-slate-900">{selectedSlots.length} Selected</span>
                                </div>
                                <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                                    <span className="font-bold text-slate-900">Total Amount</span>
                                    <span className="text-2xl font-black text-emerald-600">₹{total}</span>
                                </div>
                            </div>
                        </div>

                        <RazorpayButton
                            amount={total}
                            bookingId={bookingData?._id}
                            customerName={formData.name}
                            customerEmail={formData.email}
                            customerMobile={formData.mobile}
                            businessName={listing.tenantId?.name || "BookIt"}
                            description={`Booking for ${listing.title}`}
                            onSuccess={(result) => {
                                toast.success("Payment successful!");
                                setStep(4);
                                if (onBookingComplete) onBookingComplete(result);
                            }}
                            onFailure={(error) => {
                                toast.error(error || "Payment failed. Please try again.");
                            }}
                        />

                        <button
                            onClick={() => setStep(2)}
                            className="w-full py-2 text-slate-400 text-sm font-medium hover:text-slate-600 transition-colors"
                        >
                            Change Details
                        </button>
                    </div>
                )}

                {/* Step 4: Final Confirmation */}
                {step === 4 && (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                            <Check size={32} className="text-emerald-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Booking Confirmed!</h3>
                        <p className="text-slate-600 mb-6">We've sent a confirmation email to {formData.email}</p>

                        <div className="bg-emerald-50 rounded-xl p-5 text-left space-y-3 mb-6 border border-emerald-100">
                            <div className="flex justify-between text-sm">
                                <span className="text-emerald-600/70">Booking ID</span>
                                <span className="font-mono font-bold text-emerald-900">{bookingData?.bookingId || 'BK-12345'}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-emerald-600/70">Status</span>
                                <span className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] rounded-full font-bold uppercase tracking-wider">Paid & Confirmed</span>
                            </div>
                            <div className="pt-2 border-t border-emerald-200/50 flex justify-between text-sm">
                                <span className="text-emerald-600/70">Total Paid</span>
                                <span className="font-bold text-emerald-900">₹{total}</span>
                            </div>
                        </div>

                        <button
                            onClick={() => { setStep(1); setSelectedDate(""); setSelectedSlots([]); setFormData({ name: "", email: "", mobile: "", notes: "" }); }}
                            className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg"
                        >
                            Book Another Venue
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
