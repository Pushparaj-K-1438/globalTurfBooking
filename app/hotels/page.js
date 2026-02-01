"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, MapPin, Star, Wifi, Car, Utensils, Coffee, Calendar, Users, Filter, ChevronDown } from "lucide-react";

export default function HotelsPage() {
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [priceRange, setPriceRange] = useState("all");
    const [sortBy, setSortBy] = useState("rating");

    useEffect(() => {
        const fetchHotels = async () => {
            try {
                const res = await fetch("/api/public/browse?type=hotel");
                const data = await res.json();
                setHotels(data.listings || data || []);
            } catch (error) {
                console.error("Failed to fetch hotels");
            } finally {
                setLoading(false);
            }
        };
        fetchHotels();
    }, []);

    const getAmenityIcon = (amenity) => {
        const icons = { wifi: Wifi, parking: Car, restaurant: Utensils, breakfast: Coffee };
        return icons[amenity.toLowerCase()] || null;
    };

    const filteredHotels = hotels
        .filter(h => h.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            h.location?.city?.toLowerCase().includes(searchTerm.toLowerCase()))
        .filter(h => priceRange === "all" ||
            (priceRange === "budget" && h.priceConfig?.basePrice <= 3000) ||
            (priceRange === "mid" && h.priceConfig?.basePrice > 3000 && h.priceConfig?.basePrice <= 8000) ||
            (priceRange === "luxury" && h.priceConfig?.basePrice > 8000))
        .sort((a, b) => {
            if (sortBy === "price_low") return (a.priceConfig?.basePrice || 0) - (b.priceConfig?.basePrice || 0);
            if (sortBy === "price_high") return (b.priceConfig?.basePrice || 0) - (a.priceConfig?.basePrice || 0);
            if (sortBy === "rating") return (b.averageRating || 0) - (a.averageRating || 0);
            return 0;
        });

    return (
        <div className="min-h-screen bg-slate-50 font-sans pt-16">
            {/* Hero */}
            <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 text-white py-16 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
                <div className="max-w-7xl mx-auto px-4 relative z-10">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Find Your Perfect Stay</h1>
                    <p className="text-xl text-white/80 mb-8 max-w-2xl">Discover amazing hotels, resorts, and vacation rentals at the best prices.</p>

                    {/* Search Bar */}
                    <div className="bg-white rounded-2xl p-4 shadow-2xl max-w-4xl">
                        <div className="grid md:grid-cols-4 gap-4">
                            <div className="md:col-span-2 relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Where are you going?"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 px-4 py-3 border border-slate-200 rounded-xl text-slate-600">
                                    <Calendar size={20} className="text-slate-400" />
                                    <span>Check-in</span>
                                </div>
                            </div>
                            <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-6 rounded-xl hover:shadow-lg transition-all">
                                Search Hotels
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white border-b sticky top-16 z-30">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4 overflow-x-auto">
                    <div className="flex items-center gap-2">
                        <Filter size={18} className="text-slate-400" />
                        <span className="text-sm font-medium text-slate-500">Filters:</span>
                    </div>

                    <select
                        value={priceRange}
                        onChange={e => setPriceRange(e.target.value)}
                        className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700"
                    >
                        <option value="all">All Prices</option>
                        <option value="budget">Budget (Under ₹3,000)</option>
                        <option value="mid">Mid-Range (₹3,000 - ₹8,000)</option>
                        <option value="luxury">Luxury (Above ₹8,000)</option>
                    </select>

                    <select
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value)}
                        className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700"
                    >
                        <option value="rating">Top Rated</option>
                        <option value="price_low">Price: Low to High</option>
                        <option value="price_high">Price: High to Low</option>
                    </select>

                    <div className="ml-auto text-sm text-slate-500">{filteredHotels.length} hotels found</div>
                </div>
            </div>

            {/* Hotels Grid */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin h-12 w-12 border-4 border-purple-600 border-t-transparent rounded-full"></div>
                    </div>
                ) : filteredHotels.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredHotels.map(hotel => (
                            <Link href={`/listings/${hotel.slug || hotel._id}`} key={hotel._id} className="group">
                                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300">
                                    {/* Image */}
                                    <div className="relative h-56 bg-slate-200 overflow-hidden">
                                        {hotel.images?.[0] ? (
                                            <img src={hotel.images[0]?.url || hotel.images[0]} alt={hotel.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white text-4xl font-bold">
                                                {hotel.title?.charAt(0) || 'H'}
                                            </div>
                                        )}
                                        {hotel.isFeatured && (
                                            <span className="absolute top-3 left-3 px-2 py-1 bg-amber-500 text-white text-xs font-bold rounded-full">Featured</span>
                                        )}
                                        <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg flex items-center gap-1">
                                            <Star size={14} className="text-amber-400 fill-amber-400" />
                                            <span className="text-sm font-bold text-slate-900">{hotel.averageRating || '4.5'}</span>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-5">
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <h3 className="font-bold text-lg text-slate-900 group-hover:text-purple-600 transition-colors line-clamp-1">{hotel.title}</h3>
                                        </div>

                                        <p className="flex items-center gap-1 text-sm text-slate-500 mb-3">
                                            <MapPin size={14} /> {hotel.location?.city || hotel.location?.address || 'Location'}
                                        </p>

                                        {/* Amenities */}
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {(hotel.amenities || ['wifi', 'parking', 'restaurant']).slice(0, 4).map((amenity, i) => {
                                                const Icon = getAmenityIcon(amenity);
                                                return (
                                                    <span key={i} className="flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-lg">
                                                        {Icon && <Icon size={12} />}
                                                        {amenity}
                                                    </span>
                                                );
                                            })}
                                        </div>

                                        {/* Price */}
                                        <div className="flex items-end justify-between pt-3 border-t border-slate-100">
                                            <div>
                                                <span className="text-2xl font-bold text-slate-900">₹{hotel.priceConfig?.basePrice || 2999}</span>
                                                <span className="text-sm text-slate-400">/night</span>
                                            </div>
                                            <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold rounded-lg hover:shadow-lg transition-all">
                                                Book Now
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Search size={40} className="text-slate-300" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">No Hotels Found</h3>
                        <p className="text-slate-500 mb-6">Try adjusting your search or filters</p>
                        <button onClick={() => { setSearchTerm(''); setPriceRange('all'); }} className="px-6 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700">
                            Clear Filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
