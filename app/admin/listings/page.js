"use client";

import { useState, useEffect } from "react";
import { Plus, MapPin, Edit2, Trash2, Search, X, Filter } from "lucide-react";

export default function TenantListings() {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [newListing, setNewListing] = useState({
        title: "",
        description: "",
        type: "", // Will be set by fetchTypes
        priceConfig: { basePrice: 0, pricingModel: "per_hour" },
        location: { address: "" },
        capacity: 0,
        images: [],
        amenities: [],
        rules: [],
    });
    const [listingTypes, setListingTypes] = useState([]);
    const [pricingModels, setPricingModels] = useState([]);

    useEffect(() => {
        fetchListings();
        fetchTypes();
        fetchPricingModels();
    }, []);

    const fetchTypes = async () => {
        try {
            const res = await fetch("/api/listings/types");
            const data = await res.json();
            if (Array.isArray(data)) {
                setListingTypes(data);
                // Set default type if not set and data exists
                if (data.length > 0) {
                    setNewListing(prev => ({
                        ...prev,
                        type: prev.type || data[0].slug
                    }));
                }
            }
        } catch (error) {
            console.error("Failed to fetch types");
        }
    };

    const fetchPricingModels = async () => {
        try {
            const res = await fetch("/api/listings/pricing-models");
            const data = await res.json();
            if (Array.isArray(data)) {
                setPricingModels(data);
                // Set default pricing model if available
                if (data.length > 0) {
                    setNewListing(prev => ({
                        ...prev,
                        priceConfig: { ...prev.priceConfig, pricingModel: prev.priceConfig.pricingModel || data[0].slug }
                    }));
                }
            }
        } catch (error) {
            console.error("Failed to fetch pricing models");
        }
    };

    const fetchListings = async () => {
        try {
            const res = await fetch("/api/listings");
            const data = await res.json();

            if (res.ok && Array.isArray(data)) {
                setListings(data);
            } else {
                console.error("Failed to fetch listings:", data);
                setListings([]);
            }
        } catch (error) {
            console.error("Network error while fetching listings:", error);
            setListings([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/listings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newListing),
            });
            if (res.ok) {
                setShowForm(false);
                fetchListings();
                setNewListing({
                    title: "",
                    description: "",
                    type: listingTypes.length > 0 ? listingTypes[0].slug : "",
                    priceConfig: { basePrice: 0, pricingModel: "per_hour" },
                    location: { address: "" },
                    capacity: 0,
                    images: [],
                    amenities: [],
                    rules: [],
                });
            }
        } catch (error) {
            console.error("Failed to create listing");
        }
    };

    const filteredListings = listings.filter(l =>
        l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Listings</h1>
                        <p className="text-xs text-slate-500">Manage all your properties</p>
                    </div>
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Listing</span>
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Search & Filter */}
                <div className="mb-8 flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1 max-w-lg">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by name or type..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white border border-slate-200 text-slate-900 pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 placeholder:text-slate-400 shadow-sm"
                        />
                    </div>
                    <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium transition-colors shadow-sm">
                        <Filter className="w-4 h-4" /> Filter
                    </button>
                </div>

                {/* Grid */}
                {filteredListings.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed">
                        <div className="inline-block p-4 rounded-full bg-slate-50 mb-4">
                            <Search className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900">No listings found</h3>
                        <p className="text-slate-500 mt-1">Try adjusting your search or add a new listing.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredListings.map((item) => (
                            <div key={item._id} className="group bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300">
                                <div className="aspect-video bg-slate-100 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10" />
                                    <img
                                        src={`https://source.unsplash.com/random/800x600?${item.type}`}
                                        alt={item.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        onError={(e) => e.target.style.display = 'none'}
                                    />
                                    <div className="absolute top-3 right-3 z-20">
                                        <span className="bg-white/90 backdrop-blur-sm text-slate-900 text-xs font-bold px-3 py-1 rounded-full shadow-sm uppercase tracking-wide">
                                            {item.type}
                                        </span>
                                    </div>
                                    <div className="absolute bottom-3 left-3 z-20 text-white">
                                        <p className="font-bold text-lg leading-none">
                                            ${item.priceConfig.basePrice}
                                        </p>
                                        <p className="text-xs text-white/80 font-medium">per unit</p>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <h3 className="text-lg font-bold text-slate-900 mb-1 truncate" title={item.title}>{item.title}</h3>
                                    <p className="text-slate-500 text-sm mb-4 line-clamp-2 min-h-[40px] leading-relaxed">{item.description}</p>

                                    <div className="flex items-center text-slate-500 text-xs mb-6">
                                        <MapPin className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                                        <span className="truncate">{item.location.address}</span>
                                    </div>

                                    <div className="flex gap-2 pt-4 border-t border-slate-100">
                                        <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-slate-200 text-slate-600 hover:border-emerald-500 hover:text-emerald-600 text-sm font-medium transition-all">
                                            <Edit2 className="w-3.5 h-3.5" /> Edit
                                        </button>
                                        <button className="w-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:border-red-200 hover:bg-red-50 hover:text-red-500 transition-all">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Light Theme Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h2 className="text-lg font-bold text-slate-900">New Listing</h2>
                            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleCreate} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Title</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Luxury Football Turf"
                                    className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition-all placeholder:text-slate-400"
                                    onChange={(e) => setNewListing({ ...newListing, title: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Type</label>
                                    <div className="relative">
                                        <select
                                            className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none appearance-none cursor-pointer"
                                            onChange={(e) => setNewListing({ ...newListing, type: e.target.value })}
                                            value={newListing.type}
                                        >
                                            <option value="" disabled>Select Type</option>
                                            {listingTypes.map((t) => (
                                                <option key={t._id} value={t.slug}>{t.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Capacity</label>
                                    <input
                                        type="number"
                                        placeholder="Max people"
                                        className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition-all placeholder:text-slate-400"
                                        onChange={(e) => setNewListing({ ...newListing, capacity: Number(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Base Price</label>
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition-all placeholder:text-slate-400"
                                        onChange={(e) => setNewListing({ ...newListing, priceConfig: { ...newListing.priceConfig, basePrice: Number(e.target.value) } })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Pricing Model</label>
                                    <select
                                        className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none appearance-none cursor-pointer"
                                        onChange={(e) => setNewListing({ ...newListing, priceConfig: { ...newListing.priceConfig, pricingModel: e.target.value } })}
                                        value={newListing.priceConfig.pricingModel}
                                    >
                                        <option value="" disabled>Select Pricing Model</option>
                                        {pricingModels.map((pm) => (
                                            <option key={pm._id} value={pm.slug}>{pm.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Description</label>
                                <textarea
                                    placeholder="Describe your property..."
                                    rows="3"
                                    className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition-all placeholder:text-slate-400 resize-none"
                                    onChange={(e) => setNewListing({ ...newListing, description: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Address</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Property Address"
                                        className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition-all placeholder:text-slate-400"
                                        onChange={(e) => setNewListing({ ...newListing, location: { address: e.target.value } })}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Image URL</label>
                                <input
                                    type="text"
                                    placeholder="https://..."
                                    className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition-all placeholder:text-slate-400"
                                    onChange={(e) => setNewListing({ ...newListing, images: [e.target.value] })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Amenities</label>
                                    <input
                                        type="text"
                                        placeholder="WiFi, Parking (comma separated)"
                                        className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition-all placeholder:text-slate-400"
                                        onChange={(e) => setNewListing({ ...newListing, amenities: e.target.value.split(',').map(s => s.trim()) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Rules</label>
                                    <input
                                        type="text"
                                        placeholder="No smoking, No pets (comma separated)"
                                        className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition-all placeholder:text-slate-400"
                                        onChange={(e) => setNewListing({ ...newListing, rules: e.target.value.split(',').map(s => s.trim()) })}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-slate-100 mt-2">
                                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 text-slate-600 font-medium border border-slate-200 bg-white rounded-lg hover:bg-slate-50 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" className="flex-1 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 shadow-sm transition-colors">
                                    Create Listing
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
