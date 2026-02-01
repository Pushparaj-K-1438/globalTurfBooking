"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, Dumbbell, MapPin, Users, Clock, X, Activity } from "lucide-react";
import { toast } from "react-toastify";

export default function GymPage() {
    const [gyms, setGyms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    const initialFormState = {
        title: "", description: "", type: "gym",
        priceConfig: { basePrice: 0, pricingModel: "monthly" },
        location: { address: "", city: "" },
        capacity: 50, openTime: "06:00", closeTime: "22:00",
        amenities: [], images: []
    };
    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => { fetchGyms(); }, []);

    const fetchGyms = async () => {
        try {
            const res = await fetch("/api/admin/gyms");
            const data = await res.json();
            setGyms(res.ok && Array.isArray(data) ? data : []);
        } catch { setGyms([]); }
        finally { setLoading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = editMode ? `/api/admin/gyms/${currentId}` : "/api/admin/gyms";
        const res = await fetch(url, {
            method: editMode ? "PATCH" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...formData, type: "gym" }),
        });
        if (res.ok) {
            toast.success(editMode ? "Gym updated" : "Gym added");
            setShowForm(false); fetchGyms();
        } else toast.error("Operation failed");
    };

    const handleEdit = (g) => {
        setFormData({
            title: g.title, description: g.description || "", type: "gym",
            priceConfig: g.priceConfig || { basePrice: g.price, pricingModel: "monthly" },
            location: g.location || {}, capacity: g.capacity || 50,
            openTime: g.openTime || "06:00", closeTime: g.closeTime || "22:00",
            amenities: g.amenities || [], images: g.images || []
        });
        setCurrentId(g._id); setEditMode(true); setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (confirm("Delete this gym?")) {
            const res = await fetch(`/api/admin/gyms/${id}`, { method: "DELETE" });
            if (res.ok) { toast.success("Deleted"); fetchGyms(); }
        }
    };

    const amenityOptions = ["Cardio Equipment", "Weight Training", "Personal Trainer", "Yoga Studio", "Sauna", "Steam Room", "Locker Room", "Shower", "Parking", "WiFi", "AC"];

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-10 w-10 border-4 border-orange-600 border-t-transparent rounded-full" /></div>;

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <header className="mb-8 flex justify-between items-center">
                <div><h1 className="text-2xl font-bold">Gym & Fitness</h1><p className="text-slate-500">Manage fitness centers</p></div>
                <button onClick={() => { setFormData(initialFormState); setEditMode(false); setShowForm(true); }} className="flex items-center gap-2 bg-orange-600 text-white px-5 py-2.5 rounded-lg"><Plus size={18} /> Add Gym</button>
            </header>
            <div className="mb-6 relative max-w-lg">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input type="text" placeholder="Search gyms..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-white border pl-10 pr-4 py-2.5 rounded-lg focus:ring-2 focus:ring-orange-500/20" />
            </div>
            {gyms.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border-dashed border-2"><Dumbbell className="w-12 h-12 text-slate-300 mx-auto mb-4" /><h3 className="font-semibold">No gyms</h3></div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {gyms.filter(g => g.title?.toLowerCase().includes(searchTerm.toLowerCase())).map(gym => (
                        <div key={gym._id} className="bg-white rounded-2xl overflow-hidden border hover:shadow-lg transition-all">
                            <div className="aspect-video bg-gradient-to-br from-orange-500 to-red-500 relative flex items-center justify-center">
                                {gym.images?.[0] ? <img src={gym.images[0]} alt="" className="w-full h-full object-cover" /> : <Activity size={48} className="text-white/50" />}
                                <span className="absolute bottom-3 right-3 bg-white/90 px-3 py-1 rounded-full font-bold">₹{gym.priceConfig?.basePrice || gym.price}/mo</span>
                            </div>
                            <div className="p-5">
                                <h3 className="text-lg font-bold mb-2">{gym.title}</h3>
                                <div className="space-y-1 text-sm text-slate-600 mb-3">
                                    <div className="flex items-center gap-2"><Clock size={14} />{gym.openTime} - {gym.closeTime}</div>
                                    <div className="flex items-center gap-2"><MapPin size={14} />{gym.location?.city || 'Location TBD'}</div>
                                    <div className="flex items-center gap-2"><Users size={14} />{gym.capacity} members</div>
                                </div>
                                {gym.amenities?.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mb-4">
                                        {gym.amenities.slice(0, 3).map(a => <span key={a} className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full">{a}</span>)}
                                        {gym.amenities.length > 3 && <span className="text-xs text-slate-400">+{gym.amenities.length - 3}</span>}
                                    </div>
                                )}
                                <div className="flex gap-2 pt-4 border-t">
                                    <button onClick={() => handleEdit(gym)} className="flex-1 py-2 border rounded-lg text-sm hover:border-orange-500 hover:text-orange-600 flex items-center justify-center gap-1"><Edit2 size={14} />Edit</button>
                                    <button onClick={() => handleDelete(gym._id)} className="w-10 flex items-center justify-center border rounded-lg hover:border-red-300 hover:text-red-500"><Trash2 size={14} /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {showForm && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-5 border-b flex justify-between items-center sticky top-0 bg-white">
                            <h2 className="font-bold">{editMode ? 'Edit Gym' : 'Add Gym'}</h2>
                            <button onClick={() => setShowForm(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-5 space-y-4">
                            <input type="text" required placeholder="Gym name" className="w-full border rounded-lg px-4 py-2.5" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                            <div className="grid grid-cols-2 gap-4">
                                <input type="number" placeholder="Monthly Fee" className="border rounded-lg px-4 py-2.5" value={formData.priceConfig.basePrice} onChange={e => setFormData({ ...formData, priceConfig: { ...formData.priceConfig, basePrice: +e.target.value } })} />
                                <input type="number" placeholder="Capacity" className="border rounded-lg px-4 py-2.5" value={formData.capacity} onChange={e => setFormData({ ...formData, capacity: +e.target.value })} />
                                <input type="time" className="border rounded-lg px-4 py-2.5" value={formData.openTime} onChange={e => setFormData({ ...formData, openTime: e.target.value })} />
                                <input type="time" className="border rounded-lg px-4 py-2.5" value={formData.closeTime} onChange={e => setFormData({ ...formData, closeTime: e.target.value })} />
                            </div>
                            <textarea rows="2" placeholder="Description" className="w-full border rounded-lg px-4 py-2.5" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                            <input type="text" placeholder="City" className="w-full border rounded-lg px-4 py-2.5" value={formData.location.city} onChange={e => setFormData({ ...formData, location: { ...formData.location, city: e.target.value } })} />
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Amenities</label>
                                <div className="flex flex-wrap gap-2">
                                    {amenityOptions.map(a => (
                                        <button type="button" key={a} onClick={() => {
                                            const newAmenities = formData.amenities.includes(a) ? formData.amenities.filter(x => x !== a) : [...formData.amenities, a];
                                            setFormData({ ...formData, amenities: newAmenities });
                                        }} className={`px-3 py-1 rounded-full text-sm ${formData.amenities.includes(a) ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600'}`}>{a}</button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4 border-t">
                                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 border rounded-lg">Cancel</button>
                                <button type="submit" className="flex-1 py-2.5 bg-orange-600 text-white rounded-lg">{editMode ? 'Update' : 'Add'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
