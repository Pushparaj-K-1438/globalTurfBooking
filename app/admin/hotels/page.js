"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Filter, Edit2, Trash2, Star, MapPin, Bed, Users, X, Upload } from "lucide-react";
import { toast } from "react-toastify";
import DeleteConfirmationModal from "../../components/ui/DeleteModal";

export default function HotelsPage() {
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const initialFormState = {
        title: "",
        description: "",
        type: "hotel",
        priceConfig: { basePrice: 0, pricingModel: "per_night" },
        location: { address: "", city: "", state: "" },
        capacity: 1,
        rooms: 1,
        amenities: [],
        images: [],
        rating: 0,
        checkInTime: "14:00",
        checkOutTime: "11:00"
    };
    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        fetchHotels();
    }, []);

    const fetchHotels = async () => {
        try {
            const res = await fetch("/api/admin/hotels");
            const data = await res.json();
            if (res.ok && Array.isArray(data)) {
                setHotels(data);
            } else {
                setHotels([]);
            }
        } catch (error) {
            console.error("Error fetching hotels:", error);
            setHotels([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editMode ? `/api/admin/hotels/${currentId}` : "/api/admin/hotels";
            const method = editMode ? "PATCH" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, type: "hotel" }),
            });

            if (res.ok) {
                toast.success(editMode ? "Hotel updated successfully" : "Hotel added successfully");
                setShowForm(false);
                fetchHotels();
                resetForm();
            } else {
                const errorData = await res.json();
                toast.error(errorData.error || "Operation failed");
            }
        } catch (error) {
            toast.error("An error occurred");
        }
    };

    const handleEdit = (hotel) => {
        setFormData({
            title: hotel.title,
            description: hotel.description || "",
            type: "hotel",
            priceConfig: hotel.priceConfig || { basePrice: hotel.price, pricingModel: "per_night" },
            location: hotel.location || { address: "", city: "", state: "" },
            capacity: hotel.capacity || 1,
            rooms: hotel.rooms || 1,
            amenities: hotel.amenities || [],
            images: hotel.images || [],
            rating: hotel.rating || 0,
            checkInTime: hotel.checkInTime || "14:00",
            checkOutTime: hotel.checkOutTime || "11:00"
        });
        setCurrentId(hotel._id);
        setEditMode(true);
        setShowForm(true);
    };

    const handleDelete = (id) => {
        setDeletingId(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/admin/hotels/${deletingId}`, { method: "DELETE" });
            if (res.ok) {
                toast.success("Hotel deleted successfully");
                fetchHotels();
                setShowDeleteModal(false);
            } else {
                toast.error("Failed to delete hotel");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setIsDeleting(false);
            setDeletingId(null);
        }
    };

    const resetForm = () => {
        setFormData(initialFormState);
        setEditMode(false);
        setCurrentId(null);
    };

    const filteredHotels = hotels.filter(h =>
        h.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.location?.city?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const amenityOptions = ["WiFi", "Parking", "Pool", "Gym", "Restaurant", "Room Service", "Spa", "Bar", "AC", "TV", "Mini Bar", "Laundry"];

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 p-8">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Hotels & Rooms</h1>
                    <p className="text-slate-500 mt-1">Manage your hotel properties and rooms</p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowForm(true); }}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
                >
                    <Plus size={18} /> Add Hotel
                </button>
            </header>

            {/* Search */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-lg">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search hotels..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white border border-slate-200 text-slate-900 pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">
                    <Filter className="w-4 h-4" /> Filter
                </button>
            </div>

            {/* Hotels Grid */}
            {filteredHotels.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed">
                    <Bed className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900">No hotels found</h3>
                    <p className="text-slate-500 mt-1">Add your first hotel property to get started.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredHotels.map((hotel) => (
                        <div key={hotel._id} className="group bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300">
                            <div className="aspect-video bg-slate-100 relative overflow-hidden">
                                <img
                                    src={hotel.images?.[0] || `https://source.unsplash.com/random/800x600?hotel`}
                                    alt={hotel.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    onError={(e) => e.target.src = 'https://via.placeholder.com/800x600?text=Hotel'}
                                />
                                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
                                    <Star size={14} className="text-amber-500 fill-amber-500" />
                                    <span className="text-sm font-bold text-slate-900">{hotel.rating || 0}</span>
                                </div>
                                <div className="absolute bottom-3 left-3 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                                    ₹{hotel.priceConfig?.basePrice || hotel.price}/night
                                </div>
                            </div>
                            <div className="p-5">
                                <h3 className="text-lg font-bold text-slate-900 mb-1 truncate">{hotel.title}</h3>
                                <div className="flex items-center text-slate-500 text-sm mb-3">
                                    <MapPin className="w-4 h-4 mr-1 text-blue-500" />
                                    <span className="truncate">{hotel.location?.city || hotel.location?.address}</span>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
                                    <span className="flex items-center gap-1"><Bed size={16} /> {hotel.rooms || 1} Rooms</span>
                                    <span className="flex items-center gap-1"><Users size={16} /> {hotel.capacity} Guests</span>
                                </div>
                                <div className="flex gap-2 pt-4 border-t border-slate-100">
                                    <button onClick={() => handleEdit(hotel)} className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-slate-200 text-slate-600 hover:border-blue-500 hover:text-blue-600 text-sm font-medium transition-all">
                                        <Edit2 className="w-4 h-4" /> Edit
                                    </button>
                                    <button onClick={() => handleDelete(hotel._id)} className="w-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:border-red-200 hover:bg-red-50 hover:text-red-500 transition-all">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title="Delete Hotel"
                message="Are you sure you want to delete this hotel? All associated bookings will be affected."
                isDeleting={isDeleting}
            />

            {/* Add/Edit Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 sticky top-0">
                            <h2 className="text-lg font-bold text-slate-900">{editMode ? 'Edit Hotel' : 'Add New Hotel'}</h2>
                            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Hotel Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
                                        placeholder="e.g., Grand Hyatt"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Price per Night (₹)</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
                                        value={formData.priceConfig.basePrice}
                                        onChange={(e) => setFormData({ ...formData, priceConfig: { ...formData.priceConfig, basePrice: Number(e.target.value) } })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Number of Rooms</label>
                                    <input
                                        type="number"
                                        className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
                                        value={formData.rooms}
                                        onChange={(e) => setFormData({ ...formData, rooms: Number(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Max Guests</label>
                                    <input
                                        type="number"
                                        className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
                                        value={formData.capacity}
                                        onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Rating</label>
                                    <select
                                        className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
                                        value={formData.rating}
                                        onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                                    >
                                        {[0, 1, 2, 3, 4, 5].map(r => <option key={r} value={r}>{r} Star</option>)}
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Description</label>
                                    <textarea
                                        rows="3"
                                        className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none resize-none"
                                        placeholder="Describe your hotel..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Address</label>
                                    <input
                                        type="text"
                                        className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
                                        placeholder="Full address"
                                        value={formData.location.address}
                                        onChange={(e) => setFormData({ ...formData, location: { ...formData.location, address: e.target.value } })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">City</label>
                                    <input
                                        type="text"
                                        className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
                                        placeholder="City"
                                        value={formData.location.city}
                                        onChange={(e) => setFormData({ ...formData, location: { ...formData.location, city: e.target.value } })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">State</label>
                                    <input
                                        type="text"
                                        className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
                                        placeholder="State"
                                        value={formData.location.state}
                                        onChange={(e) => setFormData({ ...formData, location: { ...formData.location, state: e.target.value } })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Check-in Time</label>
                                    <input
                                        type="time"
                                        className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
                                        value={formData.checkInTime}
                                        onChange={(e) => setFormData({ ...formData, checkInTime: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Check-out Time</label>
                                    <input
                                        type="time"
                                        className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
                                        value={formData.checkOutTime}
                                        onChange={(e) => setFormData({ ...formData, checkOutTime: e.target.value })}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Amenities</label>
                                    <div className="flex flex-wrap gap-2">
                                        {amenityOptions.map(amenity => (
                                            <button
                                                type="button"
                                                key={amenity}
                                                onClick={() => {
                                                    const newAmenities = formData.amenities.includes(amenity)
                                                        ? formData.amenities.filter(a => a !== amenity)
                                                        : [...formData.amenities, amenity];
                                                    setFormData({ ...formData, amenities: newAmenities });
                                                }}
                                                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${formData.amenities.includes(amenity)
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                    }`}
                                            >
                                                {amenity}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Image URL</label>
                                    <input
                                        type="text"
                                        className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
                                        placeholder="https://..."
                                        value={formData.images[0] || ''}
                                        onChange={(e) => setFormData({ ...formData, images: [e.target.value] })}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4 border-t border-slate-100">
                                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 text-slate-600 font-medium border border-slate-200 rounded-lg hover:bg-slate-50">
                                    Cancel
                                </button>
                                <button type="submit" className="flex-1 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow-sm">
                                    {editMode ? 'Update Hotel' : 'Add Hotel'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
