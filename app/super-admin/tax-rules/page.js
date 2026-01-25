"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, XCircle, Receipt, Percent } from "lucide-react";
import { toast } from "react-toastify";

const COUNTRIES = [
    { code: 'IN', name: 'India' }, { code: 'US', name: 'United States' }, { code: 'UK', name: 'United Kingdom' },
    { code: 'CA', name: 'Canada' }, { code: 'AU', name: 'Australia' }, { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' }, { code: 'AE', name: 'UAE' }, { code: 'SG', name: 'Singapore' },
];

export default function TaxRulesPage() {
    const [taxRules, setTaxRules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [formData, setFormData] = useState({ name: "", code: "", rate: 0, country: "IN", state: "", category: "service", isInclusive: false, isActive: true });

    useEffect(() => { fetchTaxRules(); }, []);

    const fetchTaxRules = async () => {
        try {
            const res = await fetch("/api/super-admin/tax-rules");
            const data = await res.json();
            if (Array.isArray(data)) setTaxRules(data);
        } catch (error) { toast.error("Failed to fetch tax rules"); }
        finally { setLoading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editMode ? `/api/super-admin/tax-rules/${currentId}` : "/api/super-admin/tax-rules";
            const res = await fetch(url, {
                method: editMode ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                toast.success(editMode ? "Tax rule updated" : "Tax rule created");
                setShowModal(false); resetForm(); fetchTaxRules();
            } else {
                const data = await res.json();
                toast.error(data.error || "Operation failed");
            }
        } catch (error) { toast.error("An error occurred"); }
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this tax rule?")) return;
        try {
            const res = await fetch(`/api/super-admin/tax-rules/${id}`, { method: "DELETE" });
            if (res.ok) { toast.success("Tax rule deleted"); fetchTaxRules(); }
        } catch (error) { toast.error("Failed to delete"); }
    };

    const openEdit = (item) => {
        setFormData({ name: item.name, code: item.code, rate: item.rate, country: item.country, state: item.state || "", category: item.category, isInclusive: item.isInclusive, isActive: item.isActive });
        setCurrentId(item._id); setEditMode(true); setShowModal(true);
    };

    const resetForm = () => {
        setFormData({ name: "", code: "", rate: 0, country: "IN", state: "", category: "service", isInclusive: false, isActive: true });
        setEditMode(false); setCurrentId(null);
    };

    if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-600"></div></div>;

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 p-8">
            <header className="mb-10 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Tax Rules</h1>
                    <p className="text-slate-500 mt-1">Configure country-wise tax rates (GST, VAT, etc.)</p>
                </div>
                <button onClick={() => { resetForm(); setShowModal(true); }} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
                    <Plus className="w-4 h-4" /><span>Add Tax Rule</span>
                </button>
            </header>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Name</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Code</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Country</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Rate</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Category</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Type</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Status</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {taxRules.map((item) => (
                            <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-semibold text-slate-900">{item.name}</td>
                                <td className="px-6 py-4 text-slate-500 font-mono text-sm">{item.code}</td>
                                <td className="px-6 py-4"><span className="px-2 py-1 bg-slate-100 rounded text-sm">{item.country}</span></td>
                                <td className="px-6 py-4 font-bold text-emerald-600">{item.rate}%</td>
                                <td className="px-6 py-4 text-sm capitalize">{item.category}</td>
                                <td className="px-6 py-4"><span className={`text-xs px-2 py-0.5 rounded-full ${item.isInclusive ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>{item.isInclusive ? 'Inclusive' : 'Exclusive'}</span></td>
                                <td className="px-6 py-4"><span className={`text-xs px-2 py-0.5 rounded-full ${item.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{item.isActive ? 'Active' : 'Inactive'}</span></td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => openEdit(item)} className="p-1.5 text-slate-400 hover:text-emerald-600 rounded"><Edit2 size={16} /></button>
                                    <button onClick={() => handleDelete(item._id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded"><Trash2 size={16} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h2 className="text-lg font-bold text-slate-900">{editMode ? "Edit Tax Rule" : "New Tax Rule"}</h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><XCircle size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Name</label>
                                    <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="GST" className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Code</label>
                                    <input type="text" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} placeholder="GST18" className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none" required />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Country</label>
                                    <select value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none">
                                        {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Rate (%)</label>
                                    <input type="number" step="0.01" value={formData.rate} onChange={(e) => setFormData({ ...formData, rate: parseFloat(e.target.value) })} className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none" required />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Category</label>
                                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none">
                                    <option value="service">Service</option>
                                    <option value="goods">Goods</option>
                                    <option value="accommodation">Accommodation</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-6">
                                <label className="flex items-center gap-2"><input type="checkbox" checked={formData.isInclusive} onChange={(e) => setFormData({ ...formData, isInclusive: e.target.checked })} className="rounded text-emerald-600" /><span className="text-sm font-medium text-slate-700">Tax Inclusive</span></label>
                                <label className="flex items-center gap-2"><input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="rounded text-emerald-600" /><span className="text-sm font-medium text-slate-700">Active</span></label>
                            </div>
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
