"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, CheckCircle, XCircle, DollarSign, Box } from "lucide-react";
import { toast } from "react-toastify";

export default function ListingTypesPage() {
    const [types, setTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        isPayable: false,
        isActive: true
    });

    useEffect(() => {
        fetchTypes();
    }, []);

    const fetchTypes = async () => {
        try {
            const res = await fetch("/api/super-admin/types");
            const data = await res.json();
            if (Array.isArray(data)) {
                setTypes(data);
            }
        } catch (error) {
            toast.error("Failed to fetch types");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editMode
                ? `/api/super-admin/types/${currentId}`
                : "/api/super-admin/types";
            const method = editMode ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                toast.success(editMode ? "Type updated" : "Type created");
                setShowModal(false);
                resetForm();
                fetchTypes();
            } else {
                const data = await res.json();
                toast.error(data.error || "Operation failed");
            }
        } catch (error) {
            toast.error("An error occurred");
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this type?")) return;
        try {
            const res = await fetch(`/api/super-admin/types/${id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                toast.success("Type deleted");
                fetchTypes();
            }
        } catch (error) {
            toast.error("Failed to delete");
        }
    };

    const openEdit = (type) => {
        setFormData({
            name: type.name,
            description: type.description || "",
            isPayable: type.isPayable,
            isActive: type.isActive
        });
        setCurrentId(type._id);
        setEditMode(true);
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({ name: "", description: "", isPayable: false, isActive: true });
        setEditMode(false);
        setCurrentId(null);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 p-8">
            <header className="mb-10 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Listing Types</h1>
                    <p className="text-slate-500 mt-1">Manage dynamic listing categories</p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm active:scale-95"
                >
                    <Plus className="w-4 h-4" />
                    <span>Add Type</span>
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {types.map((type) => (
                    <div key={type._id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                                <Box size={24} />
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => openEdit(type)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-slate-50 rounded-lg transition-colors">
                                    <Edit2 size={16} />
                                </button>
                                <button onClick={() => handleDelete(type._id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        <h3 className="text-lg font-bold text-slate-900 mb-1">{type.name}</h3>
                        <p className="text-slate-500 text-sm mb-4 line-clamp-2 min-h-[40px]">
                            {type.description || "No description provided."}
                        </p>

                        <div className="flex items-center gap-4 text-xs font-medium">
                            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${type.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                {type.isActive ? <CheckCircle size={12} /> : <XCircle size={12} />}
                                {type.isActive ? 'Active' : 'Inactive'}
                            </div>
                            {type.isPayable && (
                                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
                                    <DollarSign size={12} />
                                    Payable
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h2 className="text-lg font-bold text-slate-900">{editMode ? "Edit Type" : "New Type"}</h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                                <XCircle size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows="3"
                                    className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none resize-none"
                                />
                            </div>
                            <div className="flex items-center gap-4 pt-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.isPayable}
                                        onChange={(e) => setFormData({ ...formData, isPayable: e.target.checked })}
                                        className="rounded text-emerald-600 focus:ring-emerald-500"
                                    />
                                    <span className="text-sm font-medium text-slate-700">Is Payable?</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                        className="rounded text-emerald-600 focus:ring-emerald-500"
                                    />
                                    <span className="text-sm font-medium text-slate-700">Active</span>
                                </label>
                            </div>
                            <div className="flex gap-3 pt-4">
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
