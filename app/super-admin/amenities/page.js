"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, CheckCircle, XCircle, Check } from "lucide-react";
import { toast } from "react-toastify";

const CATEGORIES = ['general', 'sports', 'comfort', 'safety', 'accessibility'];

export default function AmenitiesPage() {
    const [amenities, setAmenities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [formData, setFormData] = useState({ name: "", category: "general", icon: "Check", description: "", isActive: true });

    useEffect(() => { fetchAmenities(); }, []);

    const fetchAmenities = async () => {
        try {
            const res = await fetch("/api/super-admin/amenities");
            const data = await res.json();
            if (Array.isArray(data)) setAmenities(data);
        } catch (error) { toast.error("Failed to fetch amenities"); }
        finally { setLoading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editMode ? `/api/super-admin/amenities/${currentId}` : "/api/super-admin/amenities";
            const res = await fetch(url, {
                method: editMode ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                toast.success(editMode ? "Amenity updated" : "Amenity created");
                setShowModal(false); resetForm(); fetchAmenities();
            } else {
                const data = await res.json();
                toast.error(data.error || "Operation failed");
            }
        } catch (error) { toast.error("An error occurred"); }
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this amenity?")) return;
        try {
            const res = await fetch(`/api/super-admin/amenities/${id}`, { method: "DELETE" });
            if (res.ok) { toast.success("Amenity deleted"); fetchAmenities(); }
        } catch (error) { toast.error("Failed to delete"); }
    };

    const openEdit = (item) => {
        setFormData({ name: item.name, category: item.category, icon: item.icon, description: item.description || "", isActive: item.isActive });
        setCurrentId(item._id); setEditMode(true); setShowModal(true);
    };

    const resetForm = () => {
        setFormData({ name: "", category: "general", icon: "Check", description: "", isActive: true });
        setEditMode(false); setCurrentId(null);
    };

    if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-600"></div></div>;

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 p-8">
            <header className="mb-10 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Amenities</h1>
                    <p className="text-slate-500 mt-1">Manage listing amenities</p>
                </div>
                <button onClick={() => { resetForm(); setShowModal(true); }} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
                    <Plus className="w-4 h-4" /><span>Add Amenity</span>
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {amenities.map((item) => (
                    <div key={item._id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-3">
                            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Check size={20} /></div>
                            <div className="flex gap-1">
                                <button onClick={() => openEdit(item)} className="p-1.5 text-slate-400 hover:text-emerald-600 rounded"><Edit2 size={14} /></button>
                                <button onClick={() => handleDelete(item._id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded"><Trash2 size={14} /></button>
                            </div>
                        </div>
                        <h3 className="font-bold text-slate-900 mb-1">{item.name}</h3>
                        <p className="text-xs text-slate-400 font-mono mb-2">{item.slug}</p>
                        <div className="flex items-center gap-2">
                            <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full capitalize">{item.category}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${item.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                {item.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h2 className="text-lg font-bold text-slate-900">{editMode ? "Edit Amenity" : "New Amenity"}</h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><XCircle size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Name</label>
                                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. WiFi" className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none" required />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Category</label>
                                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none">
                                    {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Description</label>
                                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows="2" className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none resize-none" />
                            </div>
                            <label className="flex items-center gap-2">
                                <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="rounded text-emerald-600" />
                                <span className="text-sm font-medium text-slate-700">Active</span>
                            </label>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 text-slate-600 font-medium border border-slate-200 rounded-lg hover:bg-slate-50">Cancel</button>
                                <button type="submit" className="flex-1 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
