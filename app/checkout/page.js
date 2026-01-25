"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CreditCard, Clock, MapPin, Calendar, Check, Shield, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "react-toastify";

function CheckoutContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const slotId = searchParams.get('slotId');
    const couponCode = searchParams.get('coupon');

    const [slot, setSlot] = useState(null);
    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [couponData, setCouponData] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        notes: "",
    });

    useEffect(() => {
        if (slotId) fetchSlotDetails();
    }, [slotId]);

    useEffect(() => {
        if (slot && couponCode) applyCoupon();
    }, [slot, couponCode]);

    const fetchSlotDetails = async () => {
        try {
            const res = await fetch(`/api/slots/${slotId}`);
            const data = await res.json();
            if (data && !data.error) {
                setSlot(data);
                // Fetch listing details
                const listingRes = await fetch(`/api/public/listings/${data.listingId}`);
                const listingData = await listingRes.json();
                if (listingData && !listingData.error) setListing(listingData);
            }
        } catch (error) { console.error("Failed to fetch slot"); }
        finally { setLoading(false); }
    };

    const applyCoupon = async () => {
        if (!couponCode || !slot) return;
        try {
            const res = await fetch("/api/coupons/validate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    code: couponCode,
                    orderValue: slot.price,
                    listingId: slot.listingId,
                }),
            });
            const data = await res.json();
            if (data.valid) setCouponData(data);
        } catch (error) { console.error("Failed to validate coupon"); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.phone) {
            toast.error("Please fill all required fields");
            return;
        }

        setProcessing(true);
        try {
            const bookingData = {
                slotId: slot._id,
                listingId: slot.listingId,
                tenantId: listing?.tenantId?._id || listing?.tenantId,
                customerInfo: {
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                },
                notes: formData.notes,
                couponCode: couponData?.coupon?.code,
                totalAmount: slot.price,
                finalAmount: couponData?.finalAmount || slot.price,
                discount: couponData?.discount || 0,
            };

            const res = await fetch("/api/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bookingData),
            });

            const data = await res.json();
            if (res.ok) {
                toast.success("Booking successful!");
                // Redirect to payment or confirmation
                router.push(`/booking/confirmation/${data._id || data.bookingId}`);
            } else {
                toast.error(data.error || "Booking failed");
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-600"></div></div>;

    if (!slot) return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
            <p className="text-slate-500 mb-4">Invalid booking session</p>
            <button onClick={() => router.back()} className="text-emerald-600 font-medium hover:underline">Go Back</button>
        </div>
    );

    const finalAmount = couponData?.finalAmount || slot.price;

    return (
        <div className="min-h-screen bg-slate-50 font-sans pt-16">
            {/* Header */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Complete Your Booking</h1>
                        <p className="text-sm text-slate-500">Secure checkout</p>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Booking Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Contact Info */}
                        <form onSubmit={handleSubmit}>
                            <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
                                <h2 className="text-lg font-bold text-slate-900 mb-4">Contact Information</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Full Name *</label>
                                        <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="John Doe" className="w-full border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" required />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Phone *</label>
                                        <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+91 98765 43210" className="w-full border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" required />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Email *</label>
                                        <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="john@example.com" className="w-full border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" required />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Special Requests (Optional)</label>
                                        <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={3} placeholder="Any special requirements..." className="w-full border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none" />
                                    </div>
                                </div>
                            </div>

                            {/* Payment Section */}
                            <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
                                <h2 className="text-lg font-bold text-slate-900 mb-4">Payment Method</h2>
                                <div className="space-y-3">
                                    <label className="flex items-center gap-3 p-4 border border-emerald-300 bg-emerald-50 rounded-xl cursor-pointer">
                                        <input type="radio" name="payment" defaultChecked className="text-emerald-600" />
                                        <CreditCard size={20} className="text-emerald-600" />
                                        <span className="font-medium text-slate-900">Pay Online (UPI / Card / Netbanking)</span>
                                    </label>
                                    <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:border-emerald-300 transition-colors">
                                        <input type="radio" name="payment" className="text-emerald-600" />
                                        <span className="text-xl">💵</span>
                                        <span className="font-medium text-slate-900">Pay at Venue</span>
                                    </label>
                                </div>
                            </div>

                            <button type="submit" disabled={processing} className="w-full py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg">
                                {processing ? <><Loader2 size={20} className="animate-spin" /> Processing...</> : <><Shield size={20} /> Confirm & Pay ₹{finalAmount}</>}
                            </button>

                            <p className="text-xs text-slate-500 text-center mt-4 flex items-center justify-center gap-1">
                                <Shield size={14} /> Your payment information is secure and encrypted
                            </p>
                        </form>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 sticky top-24">
                            <h2 className="text-lg font-bold text-slate-900 mb-4">Booking Summary</h2>

                            {/* Listing Preview */}
                            <div className="flex gap-4 pb-4 border-b border-slate-100">
                                <div className="w-20 h-20 bg-slate-200 rounded-lg overflow-hidden flex-shrink-0">
                                    {listing?.images?.[0] && <img src={listing.images[0]?.url || listing.images[0]} alt="" className="w-full h-full object-cover" />}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 line-clamp-2">{listing?.title}</h3>
                                    <p className="text-sm text-slate-500 flex items-center gap-1 mt-1"><MapPin size={12} /> {listing?.location?.address}</p>
                                </div>
                            </div>

                            {/* Booking Details */}
                            <div className="py-4 border-b border-slate-100 space-y-3">
                                <div className="flex items-center gap-3 text-sm">
                                    <Calendar size={16} className="text-slate-400" />
                                    <span className="text-slate-600">{new Date(slot.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Clock size={16} className="text-slate-400" />
                                    <span className="text-slate-600">{slot.startTime} - {slot.endTime}</span>
                                </div>
                            </div>

                            {/* Price Breakdown */}
                            <div className="pt-4 space-y-2 text-sm">
                                <div className="flex justify-between"><span className="text-slate-500">Slot Price</span><span className="font-medium">₹{slot.price}</span></div>
                                {couponData && (
                                    <div className="flex justify-between text-emerald-600">
                                        <span>Discount ({couponData.coupon.code})</span>
                                        <span>-₹{couponData.discount}</span>
                                    </div>
                                )}
                                <div className="flex justify-between pt-3 border-t border-slate-100 text-lg font-bold">
                                    <span>Total</span>
                                    <span className="text-emerald-600">₹{finalAmount}</span>
                                </div>
                            </div>

                            {/* Features */}
                            <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
                                <div className="flex items-center gap-2 text-xs text-slate-500"><Check size={14} className="text-emerald-500" /> Free cancellation (24h before)</div>
                                <div className="flex items-center gap-2 text-xs text-slate-500"><Check size={14} className="text-emerald-500" /> Instant confirmation</div>
                                <div className="flex items-center gap-2 text-xs text-slate-500"><Check size={14} className="text-emerald-500" /> 24/7 customer support</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-600"></div></div>}>
            <CheckoutContent />
        </Suspense>
    );
}
