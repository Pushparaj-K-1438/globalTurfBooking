"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, XCircle, DollarSign, Globe } from "lucide-react";
import { toast } from "react-toastify";

export default function CurrenciesPage() {
    const [currencies, setCurrencies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [formData, setFormData] = useState({ code: "", name: "", symbol: "", exchangeRate: 1, decimalPlaces: 2, isBase: false, isActive: true });

    useEffect(() => { fetchCurrencies(); }, []);

    const fetchCurrencies = async () => {
        try {
            const res = await fetch("/api/super-admin/currencies");
            const data = await res.json();
            if (Array.isArray(data)) setCurrencies(data);
        } catch (error) { toast.error("Failed to fetch currencies"); }
        finally { setLoading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editMode ? `/api/super-admin/currencies/${currentId}` : "/api/super-admin/currencies";
            const res = await fetch(url, {
                method: editMode ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                toast.success(editMode ? "Currency updated" : "Currency created");
                setShowModal(false); resetForm(); fetchCurrencies();
            } else {
                const data = await res.json();
                toast.error(data.error || "Operation failed");
            }
        } catch (error) { toast.error("An error occurred"); }
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this currency?")) return;
        try {
            const res = await fetch(`/api/super-admin/currencies/${id}`, { method: "DELETE" });
            if (res.ok) { toast.success("Currency deleted"); fetchCurrencies(); }
            else { const data = await res.json(); toast.error(data.error); }
        } catch (error) { toast.error("Failed to delete"); }
    };

    const openEdit = (item) => {
        setFormData({ code: item.code, name: item.name, symbol: item.symbol, exchangeRate: item.exchangeRate, decimalPlaces: item.decimalPlaces, isBase: item.isBase, isActive: item.isActive });
        setCurrentId(item._id); setEditMode(true); setShowModal(true);
    };

    const resetForm = () => {
        setFormData({ code: "", name: "", symbol: "", exchangeRate: 1, decimalPlaces: 2, isBase: false, isActive: true });
        setEditMode(false); setCurrentId(null);
    };

    if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-600"></div></div>;

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 p-8">
            <header className="mb-10 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Currencies</h1>
                    <p className="text-slate-500 mt-1">Manage supported currencies and exchange rates</p>
                </div>
                <button onClick={() => { resetForm(); setShowModal(true); }} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
                    <Plus className="w-4 h-4" /><span>Add Currency</span>
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {currencies.map((item) => (
                    <div key={item._id} className={`bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition-all ${item.isBase ? 'border-emerald-300 ring-2 ring-emerald-100' : 'border-slate-200'}`}>
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl text-xl font-bold">{item.symbol}</div>
                                <div>
                                    <h3 className="font-bold text-slate-900">{item.code}</h3>
                                    <p className="text-xs text-slate-500">{item.name}</p>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <button onClick={() => openEdit(item)} className="p-1.5 text-slate-400 hover:text-emerald-600 rounded"><Edit2 size={14} /></button>
                                <button onClick={() => handleDelete(item._id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded"><Trash2 size={14} /></button>
                            </div>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-slate-500">Exchange Rate:</span><span className="font-medium">{item.exchangeRate}</span></div>
                            <div className="flex justify-between"><span className="text-slate-500">Decimals:</span><span className="font-medium">{item.decimalPlaces}</span></div>
                        </div>
                        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
                            {item.isBase && <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-medium flex items-center gap-1"><Globe size={10} /> Base</span>}
                            <span className={`text-xs px-2 py-0.5 rounded-full ${item.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{item.isActive ? 'Active' : 'Inactive'}</span>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h2 className="text-lg font-bold text-slate-900">{editMode ? "Edit Currency" : "New Currency"}</h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><XCircle size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Code</label>
                                    <input type="text" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} placeholder="USD" maxLength={3} className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none uppercase" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Symbol</label>
                                    <input type="text" value={formData.symbol} onChange={(e) => setFormData({ ...formData, symbol: e.target.value })} placeholder="$" maxLength={5} className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none" required />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Name</label>
                                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="US Dollar" className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Exchange Rate</label>
                                    <input type="number" step="0.0001" value={formData.exchangeRate} onChange={(e) => setFormData({ ...formData, exchangeRate: parseFloat(e.target.value) })} className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Decimals</label>
                                    <input type="number" min="0" max="4" value={formData.decimalPlaces} onChange={(e) => setFormData({ ...formData, decimalPlaces: parseInt(e.target.value) })} className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none" />
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <label className="flex items-center gap-2"><input type="checkbox" checked={formData.isBase} onChange={(e) => setFormData({ ...formData, isBase: e.target.checked })} className="rounded text-emerald-600" /><span className="text-sm font-medium text-slate-700">Base Currency</span></label>
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
