"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, MapPin, Star, Dumbbell, Clock, Users, Zap, Target, Heart, Crown, Filter } from "lucide-react";

export default function GymsPage() {
    const [gyms, setGyms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [amenityFilter, setAmenityFilter] = useState([]);

    const amenities = [
        { id: "personal_training", label: "Personal Training", icon: Target },
        { id: "cardio", label: "Cardio Zone", icon: Zap },
        { id: "weights", label: "Free Weights", icon: Dumbbell },
        { id: "group_classes", label: "Group Classes", icon: Users },
        { id: "spa", label: "Spa & Sauna", icon: Heart },
    ];

    useEffect(() => {
        const fetchGyms = async () => {
            try {
                const res = await fetch("/api/public/browse?type=gym");
                const data = await res.json();
                setGyms(data.listings || data || []);
            } catch (error) {
                console.error("Failed to fetch gyms");
            } finally {
                setLoading(false);
            }
        };
        fetchGyms();
    }, []);

    const toggleAmenity = (id) => {
        setAmenityFilter(prev =>
            prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
        );
    };

    const filteredGyms = gyms
        .filter(g => g.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            g.location?.city?.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="min-h-screen bg-slate-900 text-white font-sans pt-16">
            {/* Hero */}
            <div className="relative py-20 overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-emerald-900/50 to-slate-900"></div>
                    <div className="absolute top-20 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 relative z-10">
                    <div className="flex items-center gap-2 text-emerald-400 mb-4">
                        <Dumbbell size={24} />
                        <span className="font-bold uppercase tracking-wider text-sm">Fitness Centers</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">
                        Transform Your<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Body & Mind</span>
                    </h1>
                    <p className="text-xl text-slate-400 mb-10 max-w-xl">
                        Find state-of-the-art gyms, fitness centers, and wellness studios near you.
                    </p>

                    {/* Search */}
                    <div className="max-w-xl">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search gyms by name or location..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Amenity Filters */}
            <div className="bg-slate-800/50 border-y border-slate-700 sticky top-16 z-30">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-4 overflow-x-auto pb-2">
                        <span className="flex items-center gap-2 text-sm font-medium text-slate-400 whitespace-nowrap">
                            <Filter size={16} /> Amenities:
                        </span>
                        {amenities.map(amenity => (
                            <button
                                key={amenity.id}
                                onClick={() => toggleAmenity(amenity.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${amenityFilter.includes(amenity.id)
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                    }`}
                            >
                                <amenity.icon size={14} /> {amenity.label}
                            </button>
                        ))}
                        <span className="ml-auto text-sm text-slate-500 whitespace-nowrap">{filteredGyms.length} gyms found</span>
                    </div>
                </div>
            </div>

            {/* Gyms Grid */}
            <div className="max-w-7xl mx-auto px-4 py-10">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin h-12 w-12 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
                    </div>
                ) : filteredGyms.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredGyms.map(gym => (
                            <Link href={`/listings/${gym.slug || gym._id}`} key={gym._id} className="group">
                                <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden hover:border-emerald-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10">
                                    {/* Image */}
                                    <div className="relative h-48 bg-slate-700 overflow-hidden">
                                        {gym.images?.[0] ? (
                                            <img src={gym.images[0]?.url || gym.images[0]} alt={gym.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-emerald-600 to-cyan-600 flex items-center justify-center">
                                                <Dumbbell size={48} className="text-white/50" />
                                            </div>
                                        )}

                                        {/* Premium Badge */}
                                        {gym.isPremium && (
                                            <span className="absolute top-4 left-4 flex items-center gap-1 px-3 py-1 bg-amber-500 text-slate-900 text-xs font-bold rounded-full">
                                                <Crown size={12} /> Premium
                                            </span>
                                        )}

                                        {/* Rating */}
                                        <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 bg-black/60 backdrop-blur rounded-lg">
                                            <Star size={14} className="text-amber-400 fill-amber-400" />
                                            <span className="text-sm font-bold text-white">{gym.averageRating || '4.8'}</span>
                                        </div>

                                        {/* Hours Badge */}
                                        <div className="absolute bottom-4 left-4 flex items-center gap-1 px-3 py-1 bg-emerald-500/90 backdrop-blur text-white text-xs font-medium rounded-full">
                                            <Clock size={12} /> Open 24/7
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-5">
                                        <h3 className="font-bold text-lg text-white mb-2 group-hover:text-emerald-400 transition-colors">
                                            {gym.title}
                                        </h3>

                                        <p className="flex items-center gap-1 text-sm text-slate-400 mb-4">
                                            <MapPin size={14} /> {gym.location?.city || gym.location?.address || 'Location'}
                                        </p>

                                        {/* Quick Stats */}
                                        <div className="grid grid-cols-3 gap-2 mb-4">
                                            <div className="text-center p-2 bg-slate-700/50 rounded-lg">
                                                <Dumbbell size={16} className="text-emerald-400 mx-auto mb-1" />
                                                <span className="text-xs text-slate-400">Weights</span>
                                            </div>
                                            <div className="text-center p-2 bg-slate-700/50 rounded-lg">
                                                <Zap size={16} className="text-cyan-400 mx-auto mb-1" />
                                                <span className="text-xs text-slate-400">Cardio</span>
                                            </div>
                                            <div className="text-center p-2 bg-slate-700/50 rounded-lg">
                                                <Users size={16} className="text-pink-400 mx-auto mb-1" />
                                                <span className="text-xs text-slate-400">Classes</span>
                                            </div>
                                        </div>

                                        {/* Price & CTA */}
                                        <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                                            <div>
                                                <span className="text-xs text-slate-500">Membership from</span>
                                                <div className="text-xl font-bold text-white">₹{gym.priceConfig?.basePrice || 1999}<span className="text-sm text-slate-400">/mo</span></div>
                                            </div>
                                            <button className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-sm font-bold rounded-lg hover:shadow-lg hover:shadow-emerald-500/25 transition-all">
                                                Join Now
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Dumbbell size={40} className="text-slate-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">No Gyms Found</h3>
                        <p className="text-slate-400 mb-6">Try a different search term or location</p>
                        <button onClick={() => { setSearchTerm(''); setAmenityFilter([]); }} className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700">
                            Clear Filters
                        </button>
                    </div>
                )}
            </div>

            {/* Features Section */}
            <div className="border-t border-slate-800 py-16 bg-gradient-to-b from-slate-900 to-slate-800">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Why Choose Our Partner Gyms?</h2>
                        <p className="text-slate-400">All our gyms are verified and maintain the highest standards</p>
                    </div>
                    <div className="grid md:grid-cols-4 gap-6">
                        {[
                            { icon: Dumbbell, title: "Premium Equipment", desc: "Latest machines and free weights" },
                            { icon: Users, title: "Expert Trainers", desc: "Certified fitness professionals" },
                            { icon: Clock, title: "Flexible Hours", desc: "Most gyms open 24/7" },
                            { icon: Zap, title: "Instant Access", desc: "Book and start same day" },
                        ].map((feature, i) => (
                            <div key={i} className="text-center p-6 bg-slate-800/50 border border-slate-700 rounded-2xl">
                                <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                                    <feature.icon size={24} className="text-emerald-400" />
                                </div>
                                <h3 className="font-bold text-white mb-2">{feature.title}</h3>
                                <p className="text-sm text-slate-400">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
