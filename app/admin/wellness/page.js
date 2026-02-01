"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, MapPin, Clock, X, Heart, Sparkles, Star } from "lucide-react";
import { toast } from "react-toastify";

export default function WellnessPage() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    const initialFormState = {
        title: "", description: "", type: "wellness",
        priceConfig: { basePrice: 0, pricingModel: "per_session" },
        location: { address: "", city: "" },
        duration: 60, category: "spa",
        amenities: [], images: []
    };
    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => { fetchServices(); }, []);

    const fetchServices = async () => {
        try {
            const res = await fetch("/api/admin/wellness");
            const data = await res.json();
            setServices(res.ok && Array.isArray(data) ? data : []);
        } catch { setServices([]); }
        finally { setLoading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = editMode ? `/api/admin/wellness/${currentId}` : "/api/admin/wellness";
        const res = await fetch(url, {
            method: editMode ? "PATCH" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...formData, type: "wellness" }),
        });
        if (res.ok) {
            toast.success(editMode ? "Service updated" : "Service added");
            setShowForm(false); fetchServices();
        } else toast.error("Operation failed");
    };

    const handleEdit = (s) => {
        setFormData({
            title: s.title, description: s.description || "", type: "wellness",
            priceConfig: s.priceConfig || { basePrice: s.price, pricingModel: "per_session" },
            location: s.location || {}, duration: s.duration || 60,
            category: s.category || "spa", amenities: s.amenities || [], images: s.images || []
        });
        setCurrentId(s._id); setEditMode(true); setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (confirm("Delete this service?")) {
            const res = await fetch(`/api/admin/wellness/${id}`, { method: "DELETE" });
            if (res.ok) { toast.success("Deleted"); fetchServices(); }
        }
    };

    const categories = [
        { value: "spa", label: "Spa", color: "bg-pink-100 text-pink-700" },
        { value: "massage", label: "Massage", color: "bg-purple-100 text-purple-700" },
        { value: "facial", label: "Facial", color: "bg-rose-100 text-rose-700" },
        { value: "salon", label: "Salon", color: "bg-amber-100 text-amber-700" },
        { value: "yoga", label: "Yoga", color: "bg-green-100 text-green-700" },
        { value: "meditation", label: "Meditation", color: "bg-blue-100 text-blue-700" },
        { value: "ayurveda", label: "Ayurveda", color: "bg-orange-100 text-orange-700" }
    ];

    const getCatColor = (c) => categories.find(x => x.value === c)?.color || "bg-slate-100 text-slate-700";

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-10 w-10 border-4 border-pink-600 border-t-transparent rounded-full" /></div>;

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <header className="mb-8 flex justify-between items-center">
                <div><h1 className="text-2xl font-bold">Spa & Wellness</h1><p className="text-slate-500">Manage wellness services</p></div>
                <button onClick={() => { setFormData(initialFormState); setEditMode(false); setShowForm(true); }} className="flex items-center gap-2 bg-pink-600 text-white px-5 py-2.5 rounded-lg"><Plus size={18} /> Add Service</button>
            </header>
            <div className="mb-6 relative max-w-lg">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input type="text" placeholder="Search services..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-white border pl-10 pr-4 py-2.5 rounded-lg focus:ring-2 focus:ring-pink-500/20" />
            </div>
            {services.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border-dashed border-2"><Heart className="w-12 h-12 text-slate-300 mx-auto mb-4" /><h3 className="font-semibold">No services</h3></div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.filter(s => s.title?.toLowerCase().includes(searchTerm.toLowerCase())).map(service => (
                        <div key={service._id} className="bg-white rounded-2xl overflow-hidden border hover:shadow-lg transition-all">
                            <div className="aspect-video bg-gradient-to-br from-pink-400 to-purple-500 relative flex items-center justify-center">
                                {service.images?.[0] ? <img src={service.images[0]} alt="" className="w-full h-full object-cover" /> : <Sparkles size={48} className="text-white/50" />}
                                <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold capitalize ${getCatColor(service.category)}`}>{service.category}</span>
                                <span className="absolute bottom-3 right-3 bg-white/90 px-3 py-1 rounded-full font-bold">₹{service.priceConfig?.basePrice || service.price}</span>
                            </div>
                            <div className="p-5">
                                <h3 className="text-lg font-bold mb-2">{service.title}</h3>
                                <div className="space-y-1 text-sm text-slate-600 mb-4">
                                    <div className="flex items-center gap-2"><Clock size={14} />{service.duration || 60} minutes</div>
                                    <div className="flex items-center gap-2"><MapPin size={14} />{service.location?.city || 'Location TBD'}</div>
                                    {service.rating && <div className="flex items-center gap-2"><Star size={14} className="text-amber-500 fill-amber-500" />{service.rating}</div>}
                                </div>
                                <div className="flex gap-2 pt-4 border-t">
                                    <button onClick={() => handleEdit(service)} className="flex-1 py-2 border rounded-lg text-sm hover:border-pink-500 hover:text-pink-600 flex items-center justify-center gap-1"><Edit2 size={14} />Edit</button>
                                    <button onClick={() => handleDelete(service._id)} className="w-10 flex items-center justify-center border rounded-lg hover:border-red-300 hover:text-red-500"><Trash2 size={14} /></button>
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
                            <h2 className="font-bold">{editMode ? 'Edit Service' : 'Add Service'}</h2>
                            <button onClick={() => setShowForm(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-5 space-y-4">
                            <input type="text" required placeholder="Service name" className="w-full border rounded-lg px-4 py-2.5" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                            <div className="grid grid-cols-2 gap-4">
                                <select className="border rounded-lg px-4 py-2.5" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                    {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                </select>
                                <input type="number" placeholder="Price" className="border rounded-lg px-4 py-2.5" value={formData.priceConfig.basePrice} onChange={e => setFormData({ ...formData, priceConfig: { ...formData.priceConfig, basePrice: +e.target.value } })} />
                                <input type="number" placeholder="Duration (mins)" className="border rounded-lg px-4 py-2.5" value={formData.duration} onChange={e => setFormData({ ...formData, duration: +e.target.value })} />
                                <input type="text" placeholder="City" className="border rounded-lg px-4 py-2.5" value={formData.location.city} onChange={e => setFormData({ ...formData, location: { ...formData.location, city: e.target.value } })} />
                            </div>
                            <textarea rows="2" placeholder="Description" className="w-full border rounded-lg px-4 py-2.5" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                            <input type="text" placeholder="Image URL" className="w-full border rounded-lg px-4 py-2.5" value={formData.images[0] || ''} onChange={e => setFormData({ ...formData, images: [e.target.value] })} />
                            <div className="flex gap-3 pt-4 border-t">
                                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 border rounded-lg">Cancel</button>
                                <button type="submit" className="flex-1 py-2.5 bg-pink-600 text-white rounded-lg">{editMode ? 'Update' : 'Add'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
