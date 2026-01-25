"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Search, MapPin, Star, Filter, X, ChevronDown, Grid, List, SlidersHorizontal } from "lucide-react";

export default function BrowseListingsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ types: [], cities: [] });
    const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState("grid");

    // Current filters from URL
    const [currentFilters, setCurrentFilters] = useState({
        search: searchParams.get('search') || '',
        type: searchParams.get('type') || '',
        city: searchParams.get('city') || '',
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        sortBy: searchParams.get('sortBy') || 'createdAt',
    });

    useEffect(() => {
        fetchListings();
    }, [searchParams]);

    const fetchListings = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams(searchParams);
            const res = await fetch(`/api/public/listings?${params.toString()}`);
            const data = await res.json();
            if (data.listings) {
                setListings(data.listings);
                setFilters(data.filters || { types: [], cities: [] });
                setPagination({ page: data.page, total: data.total, totalPages: data.totalPages });
            }
        } catch (error) { console.error("Failed to fetch listings"); }
        finally { setLoading(false); }
    };

    const applyFilters = () => {
        const params = new URLSearchParams();
        Object.entries(currentFilters).forEach(([key, value]) => {
            if (value) params.set(key, value);
        });
        router.push(`/browse?${params.toString()}`);
        setShowFilters(false);
    };

    const clearFilters = () => {
        setCurrentFilters({ search: '', type: '', city: '', minPrice: '', maxPrice: '', sortBy: 'createdAt' });
        router.push('/browse');
    };

    const ListingCard = ({ listing }) => (
        <Link href={`/listings/${listing.slug || listing._id}`} className="group">
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                {/* Image */}
                <div className="relative h-48 bg-slate-200 overflow-hidden">
                    {listing.images?.[0] ? (
                        <img src={listing.images[0]?.url || listing.images[0]} alt={listing.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-blue-500"></div>
                    )}
                    {listing.isFeatured && (
                        <span className="absolute top-3 left-3 px-2 py-1 bg-amber-500 text-white text-xs font-bold rounded-full">Featured</span>
                    )}
                    {listing.isVerified && (
                        <span className="absolute top-3 right-3 px-2 py-1 bg-blue-500 text-white text-xs font-bold rounded-full">Verified</span>
                    )}
                </div>
                {/* Content */}
                <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-medium">{listing.type}</span>
                        {listing.averageRating > 0 && (
                            <span className="flex items-center gap-1 text-xs text-slate-500">
                                <Star size={12} className="text-amber-400 fill-amber-400" /> {listing.averageRating}
                            </span>
                        )}
                    </div>
                    <h3 className="font-bold text-slate-900 mb-1 line-clamp-1 group-hover:text-emerald-600 transition-colors">{listing.title}</h3>
                    <p className="text-sm text-slate-500 flex items-center gap-1 mb-3">
                        <MapPin size={12} /> {listing.location?.city || listing.location?.address}
                    </p>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                        <div>
                            <span className="text-lg font-bold text-emerald-600">₹{listing.priceConfig?.basePrice}</span>
                            <span className="text-xs text-slate-400">/{listing.priceConfig?.pricingModel?.replace('_', ' ') || 'hour'}</span>
                        </div>
                        <span className="text-xs text-slate-400">{listing.capacity} people</span>
                    </div>
                </div>
            </div>
        </Link>
    );

    return (
        <div className="min-h-screen bg-slate-50 font-sans pt-16">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h1 className="text-3xl md:text-4xl font-bold mb-3">Discover Amazing Venues</h1>
                    <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                        Explore turfs, hotels, event spaces, and more. Book instantly with confidence.
                    </p>
                    {/* Quick Category Chips */}
                    <div className="flex flex-wrap justify-center gap-2 mt-6">
                        {['All', 'Sports Turf', 'Hotel', 'Event Space', 'Coworking'].map((cat, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    if (cat === 'All') {
                                        clearFilters();
                                    } else {
                                        setCurrentFilters({ ...currentFilters, type: cat });
                                        router.push(`/browse?type=${encodeURIComponent(cat)}`);
                                    }
                                }}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${(cat === 'All' && !currentFilters.type) || currentFilters.type === cat
                                        ? 'bg-white text-slate-900'
                                        : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Search/Filter Bar */}
            <div className="bg-white border-b border-slate-200 sticky top-16 z-30">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={currentFilters.search}
                                onChange={(e) => setCurrentFilters({ ...currentFilters, search: e.target.value })}
                                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                                placeholder="Search venues, turfs, spaces..."
                                className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                            />
                        </div>
                        {/* Filter Button */}
                        <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 px-4 py-3 border border-slate-200 rounded-xl font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                            <SlidersHorizontal size={18} /> Filters
                        </button>
                        {/* View Mode */}
                        <div className="flex border border-slate-200 rounded-xl overflow-hidden">
                            <button onClick={() => setViewMode('grid')} className={`p-3 ${viewMode === 'grid' ? 'bg-emerald-50 text-emerald-600' : 'text-slate-400 hover:bg-slate-50'}`}><Grid size={18} /></button>
                            <button onClick={() => setViewMode('list')} className={`p-3 ${viewMode === 'list' ? 'bg-emerald-50 text-emerald-600' : 'text-slate-400 hover:bg-slate-50'}`}><List size={18} /></button>
                        </div>
                    </div>

                    {/* Filter Pills */}
                    {(currentFilters.type || currentFilters.city) && (
                        <div className="flex items-center gap-2 mt-4">
                            {currentFilters.type && (
                                <span className="flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                                    {currentFilters.type}
                                    <button onClick={() => { setCurrentFilters({ ...currentFilters, type: '' }); applyFilters(); }}><X size={14} /></button>
                                </span>
                            )}
                            {currentFilters.city && (
                                <span className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                    {currentFilters.city}
                                    <button onClick={() => { setCurrentFilters({ ...currentFilters, city: '' }); applyFilters(); }}><X size={14} /></button>
                                </span>
                            )}
                            <button onClick={clearFilters} className="text-sm text-slate-500 hover:text-slate-700">Clear all</button>
                        </div>
                    )}
                </div>

                {/* Filter Panel */}
                {showFilters && (
                    <div className="border-t border-slate-200 bg-slate-50 p-4">
                        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Type</label>
                                <select value={currentFilters.type} onChange={(e) => setCurrentFilters({ ...currentFilters, type: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none">
                                    <option value="">All Types</option>
                                    {filters.types.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">City</label>
                                <select value={currentFilters.city} onChange={(e) => setCurrentFilters({ ...currentFilters, city: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none">
                                    <option value="">All Cities</option>
                                    {filters.cities.filter(Boolean).map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Price Range</label>
                                <div className="flex gap-2">
                                    <input type="number" value={currentFilters.minPrice} onChange={(e) => setCurrentFilters({ ...currentFilters, minPrice: e.target.value })} placeholder="Min" className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none" />
                                    <input type="number" value={currentFilters.maxPrice} onChange={(e) => setCurrentFilters({ ...currentFilters, maxPrice: e.target.value })} placeholder="Max" className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Sort By</label>
                                <select value={currentFilters.sortBy} onChange={(e) => setCurrentFilters({ ...currentFilters, sortBy: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none">
                                    <option value="createdAt">Newest</option>
                                    <option value="price">Price: Low to High</option>
                                    <option value="rating">Top Rated</option>
                                </select>
                            </div>
                        </div>
                        <div className="max-w-7xl mx-auto flex justify-end gap-2 mt-4">
                            <button onClick={() => setShowFilters(false)} className="px-4 py-2 text-slate-600 font-medium">Cancel</button>
                            <button onClick={applyFilters} className="px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700">Apply Filters</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Results */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-6">
                    <p className="text-slate-500">{pagination.total} venues found</p>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
                        </div>
                        <p className="text-slate-500 mt-4">Finding amazing venues...</p>
                    </div>
                ) : listings.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="max-w-md mx-auto">
                            <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Search size={40} className="text-emerald-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-3">No Venues Found</h3>
                            <p className="text-slate-500 mb-6 leading-relaxed">
                                We couldn't find any venues matching your criteria. Try adjusting your filters or explore all available spaces.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <button onClick={clearFilters} className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors">
                                    Clear All Filters
                                </button>
                                <Link href="/register-tenant" className="px-6 py-3 border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors">
                                    List Your Venue
                                </Link>
                            </div>
                        </div>

                        {/* Promotional Section */}
                        <div className="mt-16 bg-gradient-to-r from-emerald-600 to-cyan-600 rounded-3xl p-8 text-white max-w-2xl mx-auto">
                            <h4 className="text-xl font-bold mb-2">Own a Venue?</h4>
                            <p className="text-white/80 mb-4">List your turf, hotel, or event space on BookIt and reach thousands of customers.</p>
                            <Link href="/register-tenant" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-emerald-600 font-bold rounded-xl hover:bg-slate-100 transition-colors">
                                Get Started Free <span>→</span>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
                        {listings.map(listing => <ListingCard key={listing._id} listing={listing} />)}
                    </div>
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-12">
                        <button
                            disabled={pagination.page === 1}
                            onClick={() => router.push(`/browse?${new URLSearchParams({ ...Object.fromEntries(searchParams), page: pagination.page - 1 }).toString()}`)}
                            className="px-4 py-2 border border-slate-200 rounded-lg font-medium disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span className="px-4 py-2 text-slate-500">Page {pagination.page} of {pagination.totalPages}</span>
                        <button
                            disabled={pagination.page === pagination.totalPages}
                            onClick={() => router.push(`/browse?${new URLSearchParams({ ...Object.fromEntries(searchParams), page: pagination.page + 1 }).toString()}`)}
                            className="px-4 py-2 border border-slate-200 rounded-lg font-medium disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
