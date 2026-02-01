"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, MapPin, Calendar, Clock, Users, Ticket, Filter, PartyPopper, Building2, Heart, Music } from "lucide-react";

export default function EventsPage() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [dateFilter, setDateFilter] = useState("upcoming");

    const categories = [
        { id: "all", label: "All Events", icon: PartyPopper },
        { id: "conference", label: "Conferences", icon: Building2 },
        { id: "wedding", label: "Weddings", icon: Heart },
        { id: "concert", label: "Concerts", icon: Music },
        { id: "party", label: "Parties", icon: PartyPopper },
    ];

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await fetch("/api/public/browse?type=event");
                const data = await res.json();
                setEvents(data.listings || data || []);
            } catch (error) {
                console.error("Failed to fetch events");
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    const filteredEvents = events
        .filter(e => e.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            e.location?.city?.toLowerCase().includes(searchTerm.toLowerCase()))
        .filter(e => categoryFilter === "all" || e.category?.toLowerCase() === categoryFilter);

    const formatDate = (date) => {
        if (!date) return "TBD";
        const d = new Date(date);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white font-sans pt-16">
            {/* Hero */}
            <div className="relative py-20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-600 via-pink-600 to-purple-700"></div>
                <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-20"></div>

                <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
                    <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur rounded-full text-sm font-medium mb-6">
                        🎉 Discover Amazing Events Near You
                    </span>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">Unforgettable<br />Experiences Await</h1>
                    <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
                        From grand weddings to corporate conferences, find and book the perfect venue for your next event.
                    </p>

                    {/* Search */}
                    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-2 max-w-2xl mx-auto flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={20} />
                            <input
                                type="text"
                                placeholder="Search events, venues, cities..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:bg-white/20"
                            />
                        </div>
                        <button className="px-8 py-4 bg-white text-purple-600 font-bold rounded-xl hover:bg-purple-50 transition-colors">
                            Search
                        </button>
                    </div>
                </div>
            </div>

            {/* Category Pills */}
            <div className="bg-slate-800 border-b border-slate-700 sticky top-16 z-30">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-3 overflow-x-auto pb-2">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setCategoryFilter(cat.id)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${categoryFilter === cat.id
                                    ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                    }`}
                            >
                                <cat.icon size={16} /> {cat.label}
                            </button>
                        ))}

                        <div className="ml-auto flex items-center gap-2 text-sm text-slate-400">
                            <Filter size={16} />
                            <select
                                value={dateFilter}
                                onChange={e => setDateFilter(e.target.value)}
                                className="bg-slate-700 border border-slate-600 px-3 py-2 rounded-lg text-slate-300"
                            >
                                <option value="upcoming">Upcoming</option>
                                <option value="this_week">This Week</option>
                                <option value="this_month">This Month</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Events Grid */}
            <div className="max-w-7xl mx-auto px-4 py-10">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin h-12 w-12 border-4 border-pink-500 border-t-transparent rounded-full"></div>
                    </div>
                ) : filteredEvents.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredEvents.map(event => (
                            <Link href={`/listings/${event.slug || event._id}`} key={event._id} className="group">
                                <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden hover:border-pink-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-pink-500/10">
                                    {/* Image */}
                                    <div className="relative h-48 bg-slate-700 overflow-hidden">
                                        {event.images?.[0] ? (
                                            <img src={event.images[0]?.url || event.images[0]} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center">
                                                <PartyPopper size={48} className="text-white/50" />
                                            </div>
                                        )}

                                        {/* Date Badge */}
                                        <div className="absolute top-4 left-4 bg-white rounded-xl text-center overflow-hidden shadow-lg">
                                            <div className="bg-pink-600 text-white text-xs font-bold px-3 py-1">
                                                {formatDate(event.eventDate).split(' ')[0]}
                                            </div>
                                            <div className="text-2xl font-bold text-slate-900 px-3 py-1">
                                                {formatDate(event.eventDate).split(' ')[1] || '15'}
                                            </div>
                                        </div>

                                        {/* Category Badge */}
                                        <span className="absolute top-4 right-4 px-3 py-1 bg-black/50 backdrop-blur text-white text-xs font-medium rounded-full capitalize">
                                            {event.category || 'Event'}
                                        </span>
                                    </div>

                                    {/* Content */}
                                    <div className="p-5">
                                        <h3 className="font-bold text-lg text-white mb-2 group-hover:text-pink-400 transition-colors line-clamp-1">
                                            {event.title}
                                        </h3>

                                        <div className="flex flex-col gap-2 text-sm text-slate-400 mb-4">
                                            <span className="flex items-center gap-2">
                                                <MapPin size={14} className="text-pink-500" /> {event.location?.city || 'Venue'}
                                            </span>
                                            <span className="flex items-center gap-2">
                                                <Users size={14} className="text-pink-500" /> Up to {event.capacity || 500} guests
                                            </span>
                                        </div>

                                        {/* Price & CTA */}
                                        <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                                            <div>
                                                <span className="text-xs text-slate-500">Starting from</span>
                                                <div className="text-xl font-bold text-white">₹{event.priceConfig?.basePrice || 25000}</div>
                                            </div>
                                            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-sm font-bold rounded-lg hover:shadow-lg hover:shadow-pink-500/25 transition-all">
                                                <Ticket size={16} /> Book
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
                            <PartyPopper size={40} className="text-slate-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">No Events Found</h3>
                        <p className="text-slate-400 mb-6">Check back later for upcoming events</p>
                        <button onClick={() => { setSearchTerm(''); setCategoryFilter('all'); }} className="px-6 py-3 bg-pink-600 text-white font-bold rounded-xl hover:bg-pink-700">
                            Clear Filters
                        </button>
                    </div>
                )}
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-orange-600 to-pink-600 py-16">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-4">Have a Venue to List?</h2>
                    <p className="text-white/80 mb-8">Join our platform and reach thousands of event organizers looking for the perfect venue.</p>
                    <Link href="/register-tenant" className="inline-block px-8 py-4 bg-white text-pink-600 font-bold rounded-xl hover:bg-pink-50 transition-colors">
                        List Your Venue →
                    </Link>
                </div>
            </div>
        </div>
    );
}
