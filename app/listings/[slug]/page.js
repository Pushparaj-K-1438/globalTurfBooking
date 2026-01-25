"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { MapPin, Clock, Users, Star, Check, Calendar, ChevronLeft, ChevronRight, Shield, Zap, Heart } from "lucide-react";
import { toast } from "react-toastify";

export default function ListingDetailPage() {
    const { slug } = useParams();
    const router = useRouter();
    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [slots, setSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [couponCode, setCouponCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [activeTab, setActiveTab] = useState("overview");

    useEffect(() => {
        fetchListing();
    }, [slug]);

    useEffect(() => {
        if (listing) fetchSlots();
    }, [listing, selectedDate]);

    const fetchListing = async () => {
        try {
            const res = await fetch(`/api/public/listings/${slug}`);
            const data = await res.json();
            if (data && !data.error) {
                setListing(data);
                fetchReviews(data._id);
            }
        } catch (error) { console.error("Failed to fetch listing"); }
        finally { setLoading(false); }
    };

    const fetchSlots = async () => {
        if (!listing) return;
        try {
            const dateStr = selectedDate.toISOString().split('T')[0];
            const res = await fetch(`/api/public/slots?listingId=${listing._id}&date=${dateStr}`);
            const data = await res.json();
            if (Array.isArray(data)) setSlots(data);
        } catch (error) { console.error("Failed to fetch slots"); }
    };

    const fetchReviews = async (listingId) => {
        try {
            const res = await fetch(`/api/reviews?listingId=${listingId}&limit=5`);
            const data = await res.json();
            if (data.reviews) setReviews(data.reviews);
        } catch (error) { console.error("Failed to fetch reviews"); }
    };

    const applyCoupon = async () => {
        if (!couponCode.trim()) return;
        try {
            const res = await fetch("/api/coupons/validate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    code: couponCode,
                    orderValue: selectedSlot?.price || listing?.priceConfig?.basePrice,
                    listingId: listing?._id,
                    tenantId: listing?.tenantId,
                }),
            });
            const data = await res.json();
            if (data.valid) {
                setAppliedCoupon(data);
                toast.success(`Coupon applied! You save ₹${data.discount}`);
            } else {
                toast.error(data.error || "Invalid coupon");
            }
        } catch (error) { toast.error("Failed to validate coupon"); }
    };

    const handleBooking = async () => {
        if (!selectedSlot) {
            toast.error("Please select a time slot");
            return;
        }
        // Redirect to checkout or proceed with booking
        router.push(`/checkout?slotId=${selectedSlot._id}&coupon=${appliedCoupon?.coupon?.code || ''}`);
    };

    const changeDate = (days) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + days);
        if (newDate >= new Date().setHours(0, 0, 0, 0)) {
            setSelectedDate(newDate);
            setSelectedSlot(null);
        }
    };

    const renderStars = (rating) => [...Array(5)].map((_, i) => (
        <Star key={i} size={14} className={i < rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} />
    ));

    const formatDate = (date) => date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

    if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-600"></div></div>;

    if (!listing) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><p className="text-slate-500">Listing not found</p></div>;

    const basePrice = listing.priceConfig?.basePrice || 0;
    const finalPrice = appliedCoupon ? appliedCoupon.finalAmount : (selectedSlot?.price || basePrice);

    return (
        <div className="min-h-screen bg-slate-50 font-sans pt-16">
            {/* Hero Section */}
            <div className="relative h-[50vh] bg-slate-900">
                {listing.images?.length > 0 ? (
                    <img src={listing.images[0]?.url || listing.images[0]} alt={listing.title} className="w-full h-full object-cover opacity-80" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-emerald-600 to-blue-600"></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-8 max-w-7xl mx-auto">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="px-3 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full">{listing.type}</span>
                        {listing.isVerified && <span className="px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center gap-1"><Shield size={12} /> Verified</span>}
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-2">{listing.title}</h1>
                    <div className="flex items-center gap-4 text-white/80 text-sm">
                        <span className="flex items-center gap-1"><MapPin size={14} /> {listing.location?.address}</span>
                        {listing.averageRating > 0 && (
                            <span className="flex items-center gap-1">
                                <Star size={14} className="text-amber-400 fill-amber-400" />
                                {listing.averageRating} ({listing.totalReviews} reviews)
                            </span>
                        )}
                        {listing.capacity && <span className="flex items-center gap-1"><Users size={14} /> Up to {listing.capacity} people</span>}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Tabs */}
                        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                            <div className="flex border-b border-slate-200">
                                {['overview', 'amenities', 'reviews', 'policies'].map(tab => (
                                    <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-4 text-sm font-semibold capitalize transition-colors ${activeTab === tab ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50/50' : 'text-slate-500 hover:text-slate-700'}`}>{tab}</button>
                                ))}
                            </div>
                            <div className="p-6">
                                {activeTab === 'overview' && (
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-3">About this place</h3>
                                        <p className="text-slate-600 leading-relaxed">{listing.description}</p>
                                        {listing.rules?.length > 0 && (
                                            <div className="mt-6">
                                                <h4 className="font-semibold text-slate-900 mb-2">House Rules</h4>
                                                <ul className="space-y-1">
                                                    {listing.rules.map((rule, idx) => (
                                                        <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                                                            <Check size={16} className="text-emerald-500 mt-0.5" /> {rule}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {activeTab === 'amenities' && (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {listing.amenities?.map((amenity, idx) => (
                                            <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                                                <Check size={18} className="text-emerald-500" />
                                                <span className="text-sm font-medium text-slate-700">{amenity}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {activeTab === 'reviews' && (
                                    <div>
                                        {reviews.length > 0 ? reviews.map(review => (
                                            <div key={review._id} className="py-4 border-b border-slate-100 last:border-0">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center font-bold text-sm">{review.userId?.name?.charAt(0)}</div>
                                                    <div>
                                                        <p className="font-semibold text-slate-900 text-sm">{review.userId?.name}</p>
                                                        <div className="flex">{renderStars(review.overallRating)}</div>
                                                    </div>
                                                </div>
                                                <p className="text-slate-600 text-sm">{review.comment}</p>
                                            </div>
                                        )) : <p className="text-slate-500 text-center py-8">No reviews yet</p>}
                                    </div>
                                )}
                                {activeTab === 'policies' && (
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="font-semibold text-slate-900 mb-1">Cancellation Policy</h4>
                                            <p className="text-slate-600 text-sm capitalize">{listing.cancellationPolicy || 'Moderate'} - {listing.cancellationDetails || 'Free cancellation up to 24 hours before the booking'}</p>
                                        </div>
                                        {listing.availabilityConfig && (
                                            <div>
                                                <h4 className="font-semibold text-slate-900 mb-1">Timing</h4>
                                                <p className="text-slate-600 text-sm">{listing.availabilityConfig.startTime} - {listing.availabilityConfig.endTime}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Booking Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 sticky top-24 shadow-lg">
                            <div className="flex items-baseline gap-2 mb-6">
                                <span className="text-3xl font-bold text-slate-900">₹{basePrice}</span>
                                <span className="text-slate-500">/ {listing.priceConfig?.pricingModel?.replace('_', ' ') || 'hour'}</span>
                            </div>

                            {/* Date Selector */}
                            <div className="mb-4">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Select Date</label>
                                <div className="flex items-center justify-between bg-slate-50 rounded-lg p-3">
                                    <button onClick={() => changeDate(-1)} className="p-1 hover:bg-slate-200 rounded disabled:opacity-50" disabled={selectedDate <= new Date().setHours(0, 0, 0, 0)}><ChevronLeft size={20} /></button>
                                    <span className="font-semibold text-slate-900">{formatDate(selectedDate)}</span>
                                    <button onClick={() => changeDate(1)} className="p-1 hover:bg-slate-200 rounded"><ChevronRight size={20} /></button>
                                </div>
                            </div>

                            {/* Time Slots */}
                            <div className="mb-4">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Available Slots</label>
                                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                                    {slots.length > 0 ? slots.map(slot => (
                                        <button
                                            key={slot._id}
                                            onClick={() => setSelectedSlot(slot)}
                                            disabled={!slot.isAvailable}
                                            className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${selectedSlot?._id === slot._id
                                                ? 'bg-emerald-600 text-white'
                                                : slot.isAvailable
                                                    ? 'bg-slate-100 text-slate-700 hover:bg-emerald-100'
                                                    : 'bg-slate-100 text-slate-400 cursor-not-allowed line-through'
                                                }`}
                                        >
                                            {slot.startTime}
                                        </button>
                                    )) : <p className="col-span-3 text-center text-slate-500 py-4">No slots available</p>}
                                </div>
                            </div>

                            {/* Coupon */}
                            <div className="mb-4">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Have a coupon?</label>
                                <div className="flex gap-2">
                                    <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="Enter code" className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                                    <button onClick={applyCoupon} className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800">Apply</button>
                                </div>
                                {appliedCoupon && (
                                    <p className="text-sm text-emerald-600 mt-2 flex items-center gap-1"><Check size={14} /> {appliedCoupon.coupon.code} applied - ₹{appliedCoupon.discount} off</p>
                                )}
                            </div>

                            {/* Price Summary */}
                            <div className="border-t border-slate-200 pt-4 mb-4 space-y-2 text-sm">
                                <div className="flex justify-between"><span className="text-slate-500">Slot Price</span><span className="font-medium">₹{selectedSlot?.price || basePrice}</span></div>
                                {appliedCoupon && <div className="flex justify-between text-emerald-600"><span>Discount</span><span>-₹{appliedCoupon.discount}</span></div>}
                                <div className="flex justify-between text-lg font-bold pt-2 border-t border-slate-100"><span>Total</span><span className="text-emerald-600">₹{finalPrice}</span></div>
                            </div>

                            <button onClick={handleBooking} disabled={!selectedSlot} className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                <Zap size={18} /> Book Now
                            </button>

                            <p className="text-xs text-slate-500 text-center mt-3">You won't be charged yet</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
