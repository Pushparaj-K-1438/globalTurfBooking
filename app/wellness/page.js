"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, MapPin, Clock, Star, Heart, Sparkles, Filter, ChevronDown, Leaf, Sun, Moon } from "lucide-react";

export default function WellnessPage() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [priceRange, setPriceRange] = useState("all");

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const res = await fetch("/api/public/browse?type=wellness");
                const data = await res.json();
                setServices(data.listings || data || []);
            } catch (error) {
                console.error("Failed to fetch wellness services");
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
    }, []);

    const categories = [
        { id: "all", label: "All Services", icon: "✨" },
        { id: "spa", label: "Spa & Massage", icon: "💆" },
        { id: "yoga", label: "Yoga", icon: "🧘" },
        { id: "meditation", label: "Meditation", icon: "🕯️" },
        { id: "facial", label: "Facial & Skin", icon: "🧴" },
        { id: "ayurveda", label: "Ayurveda", icon: "🌿" },
        { id: "salon", label: "Salon", icon: "💇" },
    ];

    const filteredServices = services.filter(service => {
        const matchesSearch = service.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            service.location?.city?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === "all" || service.category === selectedCategory;

        let matchesPrice = true;
        if (priceRange === "budget") matchesPrice = (service.priceConfig?.basePrice || 0) < 1000;
        else if (priceRange === "mid") matchesPrice = (service.priceConfig?.basePrice || 0) >= 1000 && (service.priceConfig?.basePrice || 0) < 3000;
        else if (priceRange === "premium") matchesPrice = (service.priceConfig?.basePrice || 0) >= 3000;

        return matchesSearch && matchesCategory && matchesPrice;
    });

    // Demo services if none from API
    const displayServices = filteredServices.length > 0 ? filteredServices : [
        { _id: "1", title: "Deep Tissue Massage", category: "spa", duration: 60, priceConfig: { basePrice: 1500 }, location: { city: "Mumbai" }, averageRating: 4.9, totalReviews: 234, images: [], amenities: ["Aromatherapy", "Hot Stones"] },
        { _id: "2", title: "Hatha Yoga Session", category: "yoga", duration: 90, priceConfig: { basePrice: 800 }, location: { city: "Bangalore" }, averageRating: 4.8, totalReviews: 156, images: [], amenities: ["Mat Provided", "Beginner Friendly"] },
        { _id: "3", title: "Traditional Ayurveda Package", category: "ayurveda", duration: 120, priceConfig: { basePrice: 3500 }, location: { city: "Kerala" }, averageRating: 5.0, totalReviews: 89, images: [], amenities: ["Herbal Treatment", "Consultation"] },
        { _id: "4", title: "Mindfulness Meditation", category: "meditation", duration: 45, priceConfig: { basePrice: 500 }, location: { city: "Delhi" }, averageRating: 4.7, totalReviews: 312, images: [], amenities: ["Guided Session", "Group Available"] },
        { _id: "5", title: "Luxury Facial Treatment", category: "facial", duration: 75, priceConfig: { basePrice: 2500 }, location: { city: "Hyderabad" }, averageRating: 4.8, totalReviews: 178, images: [], amenities: ["Organic Products", "Anti-aging"] },
        { _id: "6", title: "Hair Spa & Styling", category: "salon", duration: 60, priceConfig: { basePrice: 1200 }, location: { city: "Chennai" }, averageRating: 4.6, totalReviews: 245, images: [], amenities: ["Keratin", "Color Specialist"] },
    ];

    const getCategoryGradient = (category) => {
        const gradients = {
            spa: "from-pink-500 to-rose-600",
            yoga: "from-green-500 to-emerald-600",
            meditation: "from-indigo-500 to-purple-600",
            facial: "from-rose-400 to-pink-500",
            ayurveda: "from-amber-500 to-orange-600",
            salon: "from-violet-500 to-fuchsia-600",
        };
        return gradients[category] || "from-pink-500 to-purple-600";
    };

    const getCategoryEmoji = (category) => {
        const emojis = { spa: "💆", yoga: "🧘", meditation: "🕯️", facial: "🧴", ayurveda: "🌿", salon: "💇" };
        return emojis[category] || "✨";
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-600 mx-auto"></div>
                    <p className="mt-4 text-pink-600 font-medium">Discovering wellness...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50 font-sans">
            {/* Hero Section */}
            <section className="relative overflow-hidden py-20 px-4">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-600/90 to-purple-700/90"></div>
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-10 left-10 w-64 h-64 bg-white/20 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-yellow-300/20 rounded-full blur-3xl"></div>
                </div>

                <div className="relative max-w-6xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm mb-6">
                        <Sparkles size={16} />
                        <span>Rejuvenate Mind, Body & Soul</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                        Discover Your Path to
                        <span className="block bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
                            Wellness & Relaxation
                        </span>
                    </h1>
                    <p className="text-xl text-white/90 max-w-2xl mx-auto mb-10">
                        From spa treatments to yoga retreats, find the perfect wellness experience for your journey
                    </p>

                    {/* Search Bar */}
                    <div className="max-w-2xl mx-auto">
                        <div className="bg-white rounded-2xl p-2 shadow-2xl flex items-center gap-2">
                            <div className="flex-1 flex items-center gap-3 px-4">
                                <Search className="text-slate-400" size={22} />
                                <input
                                    type="text"
                                    placeholder="Search spa, yoga, meditation..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full py-3 text-slate-900 placeholder:text-slate-400 outline-none text-lg"
                                />
                            </div>
                            <button className="bg-gradient-to-r from-pink-600 to-purple-600 text-white px-8 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity">
                                Search
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Category Pills */}
            <section className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex flex-wrap justify-center gap-3">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${selectedCategory === cat.id
                                    ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg"
                                    : "bg-white text-slate-600 hover:bg-pink-50 border border-slate-200"
                                }`}
                        >
                            <span>{cat.icon}</span>
                            {cat.label}
                        </button>
                    ))}
                </div>
            </section>

            {/* Filters Bar */}
            <section className="max-w-7xl mx-auto px-4 pb-8">
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <span className="text-slate-600 font-medium">Price Range:</span>
                        {["all", "budget", "mid", "premium"].map((range) => (
                            <button
                                key={range}
                                onClick={() => setPriceRange(range)}
                                className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize ${priceRange === range
                                        ? "bg-pink-100 text-pink-700"
                                        : "text-slate-500 hover:bg-slate-100"
                                    }`}
                            >
                                {range === "all" ? "All" : range === "budget" ? "Under ₹1000" : range === "mid" ? "₹1000-3000" : "₹3000+"}
                            </button>
                        ))}
                    </div>
                    <p className="text-slate-500 text-sm">
                        Showing <span className="font-bold text-slate-900">{displayServices.length}</span> wellness experiences
                    </p>
                </div>
            </section>

            {/* Services Grid */}
            <section className="max-w-7xl mx-auto px-4 pb-16">
                {displayServices.length === 0 ? (
                    <div className="text-center py-20">
                        <Heart size={48} className="mx-auto text-slate-300 mb-4" />
                        <h3 className="text-xl font-bold text-slate-900">No wellness services found</h3>
                        <p className="text-slate-500 mt-2">Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {displayServices.map((service) => (
                            <Link
                                href={`/listings/${service._id}`}
                                key={service._id}
                                className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 border border-slate-100"
                            >
                                {/* Image */}
                                <div className={`aspect-[4/3] bg-gradient-to-br ${getCategoryGradient(service.category)} relative overflow-hidden`}>
                                    {service.images?.[0] ? (
                                        <img
                                            src={service.images[0]}
                                            alt={service.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <span className="text-6xl">{getCategoryEmoji(service.category)}</span>
                                        </div>
                                    )}

                                    {/* Category Badge */}
                                    <div className="absolute top-4 left-4">
                                        <span className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-semibold text-slate-700 capitalize">
                                            {service.category}
                                        </span>
                                    </div>

                                    {/* Duration */}
                                    <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm flex items-center gap-1">
                                        <Clock size={14} />
                                        {service.duration || 60} min
                                    </div>

                                    {/* Price */}
                                    <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-2xl">
                                        <span className="text-xl font-bold text-slate-900">₹{service.priceConfig?.basePrice || 999}</span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-pink-600 transition-colors">
                                        {service.title}
                                    </h3>

                                    <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                                        <span className="flex items-center gap-1">
                                            <MapPin size={14} className="text-pink-500" />
                                            {service.location?.city || "Multiple Locations"}
                                        </span>
                                        {service.averageRating && (
                                            <span className="flex items-center gap-1">
                                                <Star size={14} className="text-amber-400 fill-amber-400" />
                                                <span className="font-medium text-slate-700">{service.averageRating}</span>
                                                <span className="text-slate-400">({service.totalReviews})</span>
                                            </span>
                                        )}
                                    </div>

                                    {/* Amenities */}
                                    {service.amenities?.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {service.amenities.slice(0, 3).map((amenity, idx) => (
                                                <span
                                                    key={idx}
                                                    className="bg-pink-50 text-pink-700 px-3 py-1 rounded-full text-xs font-medium"
                                                >
                                                    {amenity}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            {/* Benefits Section */}
            <section className="bg-white py-16 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">Why Choose Our Wellness Partners?</h2>
                        <p className="text-slate-600 max-w-2xl mx-auto">Experience the best in wellness with our carefully curated partners</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: Leaf, title: "Natural & Organic", desc: "All treatments use certified organic and natural products", color: "from-green-500 to-emerald-600" },
                            { icon: Star, title: "Expert Practitioners", desc: "Certified therapists with years of experience", color: "from-amber-500 to-orange-600" },
                            { icon: Heart, title: "Personalized Care", desc: "Treatments tailored to your specific needs", color: "from-pink-500 to-rose-600" },
                        ].map((feature, idx) => (
                            <div key={idx} className="text-center p-8 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-200 hover:shadow-xl transition-shadow">
                                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mx-auto mb-6`}>
                                    <feature.icon size={28} className="text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                                <p className="text-slate-600">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 px-4">
                <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-pink-600 to-purple-700 rounded-3xl p-12">
                    <h2 className="text-3xl font-bold text-white mb-4">Are You a Wellness Provider?</h2>
                    <p className="text-white/90 text-lg mb-8">Join our platform and reach thousands of customers looking for wellness services</p>
                    <Link
                        href="/register"
                        className="inline-flex items-center gap-2 bg-white text-pink-600 px-8 py-4 rounded-xl font-bold hover:bg-pink-50 transition-colors"
                    >
                        Partner With Us
                    </Link>
                </div>
            </section>
        </div>
    );
}
