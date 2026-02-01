"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
    MapPin, Star, Clock, Users, Check, ChevronLeft, ChevronRight,
    Heart, Share2, Calendar, Phone, Mail, Wifi, Car, Coffee,
    Dumbbell, Sparkles, Shield, Award, MessageCircle
} from "lucide-react";
import QuickBookingWidget from "@/components/ui/QuickBookingWidget";

export default function ListingDetailPage() {
    const { id } = useParams();
    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isFavorite, setIsFavorite] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [showAllAmenities, setShowAllAmenities] = useState(false);

    useEffect(() => {
        if (id) {
            fetchListing();
            fetchReviews();
        }
    }, [id]);

    const fetchListing = async () => {
        try {
            const res = await fetch(`/api/public/listings/${id}`);
            if (res.ok) {
                const data = await res.json();
                setListing(data);
            }
        } catch (error) {
            console.error("Failed to fetch listing");
        } finally {
            setLoading(false);
        }
    };

    const fetchReviews = async () => {
        try {
            const res = await fetch(`/api/public/reviews?listingId=${id}&limit=5`);
            if (res.ok) {
                const data = await res.json();
                setReviews(data.reviews || data || []);
            }
        } catch (error) {
            console.error("Failed to fetch reviews");
        }
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: listing?.title,
                text: listing?.description,
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert("Link copied to clipboard!");
        }
    };

    // Demo listing if none from API
    const displayListing = listing || {
        _id: id,
        title: "Premium Sports Arena & Event Venue",
        description: "Experience the best in sports and recreation at our state-of-the-art facility. Perfect for football, cricket, badminton, and more. Our venue offers professional-grade equipment, well-maintained grounds, and excellent amenities for both casual players and serious athletes.",
        type: "turf",
        priceConfig: { basePrice: 1200, pricingModel: "per_hour" },
        location: { address: "123 Sports Complex Road, Stadium Area", city: "Mumbai", state: "Maharashtra" },
        images: [],
        amenities: ["Floodlights", "Changing Rooms", "Parking", "Cafeteria", "First Aid", "WiFi", "Equipment Rental", "Coaching Available"],
        capacity: 22,
        averageRating: 4.8,
        totalReviews: 156,
        isVerified: true,
        isFeatured: true,
        operatingHours: { open: "06:00", close: "23:00" },
        rules: ["No smoking", "Wear appropriate footwear", "Booking required", "Follow safety guidelines"],
        tenantId: { name: "Elite Sports Arena" }
    };

    const displayReviews = reviews.length > 0 ? reviews : [
        { _id: "1", userName: "Rahul S.", rating: 5, comment: "Excellent facility! The turf quality is amazing and the staff is very helpful.", createdAt: new Date(Date.now() - 86400000 * 2) },
        { _id: "2", userName: "Priya M.", rating: 4, comment: "Great place for evening games. Floodlights work perfectly.", createdAt: new Date(Date.now() - 86400000 * 5) },
        { _id: "3", userName: "Amit K.", rating: 5, comment: "Best turf in the city! Will definitely come back.", createdAt: new Date(Date.now() - 86400000 * 10) },
    ];

    const amenityIcons = {
        "Floodlights": Sparkles,
        "Parking": Car,
        "WiFi": Wifi,
        "Cafeteria": Coffee,
        "Gym": Dumbbell,
        "Security": Shield,
        "default": Check
    };

    const getAmenityIcon = (amenity) => {
        for (const key in amenityIcons) {
            if (amenity.toLowerCase().includes(key.toLowerCase())) {
                return amenityIcons[key];
            }
        }
        return amenityIcons.default;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600 mx-auto"></div>
                    <p className="mt-4 text-slate-600">Loading venue details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* Hero Image Gallery */}
            <div className="relative h-[50vh] md:h-[60vh] bg-slate-900">
                {displayListing.images?.length > 0 ? (
                    <>
                        <img
                            src={displayListing.images[currentImageIndex]}
                            alt={displayListing.title}
                            className="w-full h-full object-cover"
                        />
                        {displayListing.images.length > 1 && (
                            <>
                                <button
                                    onClick={() => setCurrentImageIndex(prev => prev === 0 ? displayListing.images.length - 1 : prev - 1)}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <button
                                    onClick={() => setCurrentImageIndex(prev => prev === displayListing.images.length - 1 ? 0 : prev + 1)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                                >
                                    <ChevronRight size={20} />
                                </button>
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                    {displayListing.images.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setCurrentImageIndex(idx)}
                                            className={`w-2 h-2 rounded-full transition-colors ${idx === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </>
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                        <div className="text-center text-white">
                            <Sparkles size={80} className="mx-auto mb-4 opacity-50" />
                            <p className="text-xl opacity-75">No images available</p>
                        </div>
                    </div>
                )}

                {/* Overlay Actions */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                    <Link
                        href="/browse"
                        className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-slate-700 hover:bg-white transition-colors"
                    >
                        <ChevronLeft size={18} />
                        Back
                    </Link>
                    <div className="flex gap-2">
                        <button
                            onClick={handleShare}
                            className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
                        >
                            <Share2 size={18} className="text-slate-700" />
                        </button>
                        <button
                            onClick={() => setIsFavorite(!isFavorite)}
                            className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
                        >
                            <Heart size={18} className={isFavorite ? 'text-red-500 fill-red-500' : 'text-slate-700'} />
                        </button>
                    </div>
                </div>

                {/* Badges */}
                <div className="absolute bottom-4 left-4 flex gap-2">
                    {displayListing.isVerified && (
                        <span className="bg-emerald-500 text-white px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1">
                            <Shield size={14} /> Verified
                        </span>
                    )}
                    {displayListing.isFeatured && (
                        <span className="bg-amber-500 text-white px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1">
                            <Award size={14} /> Featured
                        </span>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Title & Quick Info */}
                        <div>
                            <div className="flex items-start justify-between gap-4 mb-4">
                                <div>
                                    <p className="text-sm text-emerald-600 font-semibold uppercase tracking-wide mb-1">
                                        {displayListing.type}
                                    </p>
                                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
                                        {displayListing.title}
                                    </h1>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 text-slate-600">
                                <div className="flex items-center gap-1">
                                    <MapPin size={18} className="text-emerald-600" />
                                    <span>{displayListing.location?.city}, {displayListing.location?.state}</span>
                                </div>
                                {displayListing.averageRating && (
                                    <div className="flex items-center gap-1">
                                        <Star size={18} className="text-amber-400 fill-amber-400" />
                                        <span className="font-semibold text-slate-900">{displayListing.averageRating}</span>
                                        <span>({displayListing.totalReviews} reviews)</span>
                                    </div>
                                )}
                                {displayListing.capacity && (
                                    <div className="flex items-center gap-1">
                                        <Users size={18} className="text-blue-500" />
                                        <span>Up to {displayListing.capacity} guests</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-6">
                            <h2 className="text-xl font-bold text-slate-900 mb-4">About</h2>
                            <p className="text-slate-600 leading-relaxed">{displayListing.description}</p>

                            {displayListing.operatingHours && (
                                <div className="mt-6 pt-6 border-t border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <Clock size={20} className="text-emerald-600" />
                                        <div>
                                            <p className="font-semibold text-slate-900">Operating Hours</p>
                                            <p className="text-slate-600">{displayListing.operatingHours.open} - {displayListing.operatingHours.close}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Amenities */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-6">
                            <h2 className="text-xl font-bold text-slate-900 mb-4">Amenities & Features</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {(showAllAmenities ? displayListing.amenities : displayListing.amenities?.slice(0, 6))?.map((amenity, idx) => {
                                    const Icon = getAmenityIcon(amenity);
                                    return (
                                        <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                                <Icon size={18} className="text-emerald-600" />
                                            </div>
                                            <span className="text-slate-700 font-medium">{amenity}</span>
                                        </div>
                                    );
                                })}
                            </div>
                            {displayListing.amenities?.length > 6 && (
                                <button
                                    onClick={() => setShowAllAmenities(!showAllAmenities)}
                                    className="mt-4 text-emerald-600 font-medium hover:underline"
                                >
                                    {showAllAmenities ? 'Show less' : `Show all ${displayListing.amenities.length} amenities`}
                                </button>
                            )}
                        </div>

                        {/* Rules */}
                        {displayListing.rules?.length > 0 && (
                            <div className="bg-white rounded-2xl border border-slate-200 p-6">
                                <h2 className="text-xl font-bold text-slate-900 mb-4">Rules & Guidelines</h2>
                                <ul className="space-y-3">
                                    {displayListing.rules.map((rule, idx) => (
                                        <li key={idx} className="flex items-start gap-3">
                                            <Check size={18} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                                            <span className="text-slate-600">{rule}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Location Map Placeholder */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-6">
                            <h2 className="text-xl font-bold text-slate-900 mb-4">Location</h2>
                            <div className="h-64 bg-slate-100 rounded-xl flex items-center justify-center mb-4">
                                <div className="text-center text-slate-400">
                                    <MapPin size={48} className="mx-auto mb-2 opacity-50" />
                                    <p>Map will be displayed here</p>
                                </div>
                            </div>
                            <p className="text-slate-600 flex items-start gap-2">
                                <MapPin size={18} className="text-emerald-600 mt-1 flex-shrink-0" />
                                {displayListing.location?.address}, {displayListing.location?.city}, {displayListing.location?.state}
                            </p>
                        </div>

                        {/* Reviews */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-slate-900">Reviews</h2>
                                <div className="flex items-center gap-2">
                                    <Star size={20} className="text-amber-400 fill-amber-400" />
                                    <span className="text-2xl font-bold text-slate-900">{displayListing.averageRating}</span>
                                    <span className="text-slate-500">({displayListing.totalReviews})</span>
                                </div>
                            </div>
                            <div className="space-y-6">
                                {displayReviews.map(review => (
                                    <div key={review._id} className="border-b border-slate-100 last:border-0 pb-6 last:pb-0">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold">
                                                {review.userName?.charAt(0)?.toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-900">{review.userName}</p>
                                                <p className="text-xs text-slate-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            <div className="ml-auto flex items-center gap-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        size={14}
                                                        className={i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-slate-600">{review.comment}</p>
                                    </div>
                                ))}
                            </div>
                            <button className="w-full mt-6 py-3 border border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition-colors">
                                View All Reviews
                            </button>
                        </div>
                    </div>

                    {/* Sidebar - Booking Widget */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24">
                            <QuickBookingWidget listing={displayListing} />

                            {/* Host Info */}
                            <div className="mt-6 bg-white rounded-2xl border border-slate-200 p-6">
                                <h3 className="font-bold text-slate-900 mb-4">Hosted by</h3>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-xl">
                                        {displayListing.tenantId?.name?.charAt(0)?.toUpperCase() || 'H'}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900">{displayListing.tenantId?.name || 'Host'}</p>
                                        <p className="text-sm text-slate-500">Response rate: 98%</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <button className="w-full py-2.5 border border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                                        <MessageCircle size={18} />
                                        Contact Host
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
