"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, XCircle, Tag, Calendar } from "lucide-react";
import { toast } from "react-toastify";

export default function AdminCouponsPage() {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [formData, setFormData] = useState({
        code: "", name: "", description: "", discountType: "percentage", discountValue: 10,
        maxDiscount: "", minOrderValue: 0, totalUsageLimit: "", perUserLimit: 1,
        startDate: new Date().toISOString().split('T')[0], endDate: "", isActive: true
    });

    useEffect(() => { fetchCoupons(); }, []);

    const fetchCoupons = async () => {
        try {
            const res = await fetch("/api/admin/coupons");
            const data = await res.json();
            if (Array.isArray(data)) setCoupons(data);
        } catch (error) { toast.error("Failed to fetch coupons"); }
        finally { setLoading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editMode ? `/api/admin/coupons/${currentId}` : "/api/admin/coupons";
            const res = await fetch(url, {
                method: editMode ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                toast.success(editMode ? "Coupon updated" : "Coupon created");
                setShowModal(false); resetForm(); fetchCoupons();
            } else {
                const data = await res.json();
                toast.error(data.error || "Operation failed");
            }
        } catch (error) { toast.error("An error occurred"); }
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this coupon?")) return;
        try {
            const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
            if (res.ok) { toast.success("Coupon deleted"); fetchCoupons(); }
        } catch (error) { toast.error("Failed to delete"); }
    };

    const openEdit = (item) => {
        setFormData({
            code: item.code, name: item.name, description: item.description || "",
            discountType: item.discountType, discountValue: item.discountValue,
            maxDiscount: item.maxDiscount || "", minOrderValue: item.minOrderValue || 0,
            totalUsageLimit: item.totalUsageLimit || "", perUserLimit: item.perUserLimit || 1,
            startDate: new Date(item.startDate).toISOString().split('T')[0],
            endDate: new Date(item.endDate).toISOString().split('T')[0],
            isActive: item.isActive
        });
        setCurrentId(item._id); setEditMode(true); setShowModal(true);
    };

    const resetForm = () => {
        setFormData({
            code: "", name: "", description: "", discountType: "percentage", discountValue: 10,
            maxDiscount: "", minOrderValue: 0, totalUsageLimit: "", perUserLimit: 1,
            startDate: new Date().toISOString().split('T')[0], endDate: "", isActive: true
        });
        setEditMode(false); setCurrentId(null);
    };

    const isExpired = (endDate) => new Date(endDate) < new Date();

    if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-600"></div></div>;

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 p-8">
            <header className="mb-10 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Coupons & Offers</h1>
                    <p className="text-slate-500 mt-1">Manage discount codes for your listings</p>
                </div>
                <button onClick={() => { resetForm(); setShowModal(true); }} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
                    <Plus className="w-4 h-4" /><span>Create Coupon</span>
                </button>
            </header>

            {coupons.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                    <Tag className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No coupons yet</h3>
                    <p className="text-slate-500 mb-4">Create your first coupon to offer discounts to customers</p>
                    <button onClick={() => { resetForm(); setShowModal(true); }} className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700">Create Coupon</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {coupons.map((coupon) => (
                        <div key={coupon._id} className={`bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition-all ${isExpired(coupon.endDate) ? 'opacity-60 border-slate-200' : 'border-slate-200'}`}>
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-amber-100 text-amber-600 rounded-xl"><Tag size={24} /></div>
                                <div className="flex gap-1">
                                    <button onClick={() => openEdit(coupon)} className="p-1.5 text-slate-400 hover:text-emerald-600 rounded"><Edit2 size={14} /></button>
                                    <button onClick={() => handleDelete(coupon._id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded"><Trash2 size={14} /></button>
                                </div>
                            </div>
                            <div className="mb-3">
                                <span className="px-3 py-1 bg-slate-900 text-white font-mono font-bold rounded text-sm">{coupon.code}</span>
                            </div>
                            <h3 className="font-bold text-slate-900 mb-2">{coupon.name}</h3>
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-2xl font-bold text-emerald-600">
                                    {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                                </span>
                                <span className="text-sm text-slate-500">OFF</span>
                            </div>
                            <div className="text-xs text-slate-500 mb-4 space-y-1">
                                {coupon.minOrderValue > 0 && <p>Min order: ₹{coupon.minOrderValue}</p>}
                                <p className="flex items-center gap-1"><Calendar size={12} /> {new Date(coupon.startDate).toLocaleDateString()} - {new Date(coupon.endDate).toLocaleDateString()}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                                {isExpired(coupon.endDate) && <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full">Expired</span>}
                                <span className={`text-xs px-2 py-0.5 rounded-full ${coupon.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{coupon.isActive ? 'Active' : 'Inactive'}</span>
                                {coupon.usedCount > 0 && <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">{coupon.usedCount} used</span>}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h2 className="text-lg font-bold text-slate-900">{editMode ? "Edit Coupon" : "New Coupon"}</h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><XCircle size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Code</label>
                                    <input type="text" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} placeholder="SAVE20" className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none uppercase font-mono" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Name</label>
                                    <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Weekend Special" className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none" required />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Type</label>
                                    <select value={formData.discountType} onChange={(e) => setFormData({ ...formData, discountType: e.target.value })} className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none">
                                        <option value="percentage">Percentage</option>
                                        <option value="flat">Flat</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Value</label>
                                    <input type="number" value={formData.discountValue} onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) })} className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Max Discount</label>
                                    <input type="number" value={formData.maxDiscount} onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })} placeholder="∞" className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Start Date</label>
                                    <input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">End Date</label>
                                    <input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none" required />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Min Order Value</label>
                                    <input type="number" value={formData.minOrderValue} onChange={(e) => setFormData({ ...formData, minOrderValue: parseFloat(e.target.value) })} className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Usage Limit</label>
                                    <input type="number" value={formData.totalUsageLimit} onChange={(e) => setFormData({ ...formData, totalUsageLimit: e.target.value })} placeholder="Unlimited" className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none" />
                                </div>
                            </div>
                            <label className="flex items-center gap-2">
                                <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="rounded text-emerald-600" />
                                <span className="text-sm font-medium text-slate-700">Active</span>
                            </label>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 text-slate-600 font-medium border border-slate-200 rounded-lg hover:bg-slate-50">Cancel</button>
                                <button type="submit" className="flex-1 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700">Save Coupon</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
