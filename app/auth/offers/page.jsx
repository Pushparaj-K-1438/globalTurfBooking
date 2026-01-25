'use client';
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Tag, Percent, Calendar, CheckCircle, XCircle, X, DollarSign } from 'lucide-react';
import { toast } from 'react-toastify';

const OffersPage = () => {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingOffer, setEditingOffer] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        minSlots: 1,
        discountType: 'percentage',
        discountValue: 0,
        validFrom: '',
        validUntil: '',
        isActive: true
    });

    const fetchOffers = async () => {
        try {
            const response = await fetch('/api/admin/offers');
            const data = await response.json();
            if (response.ok && Array.isArray(data.offers)) {
                setOffers(data.offers);
            } else {
                setOffers([]);
                toast.error(data.error || 'Failed to fetch offers');
            }
        } catch (error) {
            toast.error('Error fetching offers');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOffers();
    }, []);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (
                (name === 'minSlots' || name === 'discountValue')
                    ? (value === '' ? '' : parseFloat(value))
                    : value
            )
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.description || !formData.validFrom || !formData.validUntil) {
            toast.error('Please fill all required fields');
            return;
        }

        if (new Date(formData.validFrom) >= new Date(formData.validUntil)) {
            toast.error('Valid until date must be after valid from date');
            return;
        }

        try {
            const url = editingOffer ? `/api/admin/offers/${editingOffer._id}` : '/api/admin/offers';
            const method = editingOffer ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(editingOffer ? 'Offer updated successfully' : 'Offer created successfully');
                setShowAddModal(false);
                setEditingOffer(null);
                resetForm();
                fetchOffers();
            } else {
                toast.error(data.error || 'Failed to save offer');
            }
        } catch (error) {
            toast.error('Error saving offer');
        }
    };

    const handleEdit = (offer) => {
        setEditingOffer(offer);
        setFormData({
            name: offer.name,
            description: offer.description,
            minSlots: offer.minSlots,
            discountType: offer.discountType,
            discountValue: offer.discountValue,
            validFrom: new Date(offer.validFrom).toISOString().split('T')[0],
            validUntil: new Date(offer.validUntil).toISOString().split('T')[0],
            isActive: offer.isActive
        });
        setShowAddModal(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this offer?')) return;

        try {
            const response = await fetch(`/api/admin/offers/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                toast.success('Offer deleted successfully');
                fetchOffers();
            } else {
                toast.error('Failed to delete offer');
            }
        } catch (error) {
            toast.error('Error deleting offer');
        }
    };

    const handleToggleActive = async (offer) => {
        try {
            const response = await fetch(`/api/admin/offers/${offer._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !offer.isActive }),
            });

            if (response.ok) {
                toast.success(`Offer ${!offer.isActive ? 'activated' : 'deactivated'} successfully`);
                fetchOffers();
            } else {
                toast.error('Failed to update offer status');
            }
        } catch (error) {
            toast.error('Error updating offer status');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            minSlots: 1,
            discountType: 'percentage',
            discountValue: 0,
            validFrom: '',
            validUntil: '',
            isActive: true
        });
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

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
                        <h1 className="text-xl font-bold text-slate-900">Offers Management</h1>
                        <p className="text-xs text-slate-500">Create and manage promotional offers</p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Offer</span>
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Grid */}
                {offers.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed">
                        <div className="inline-block p-4 rounded-full bg-slate-50 mb-4">
                            <Tag className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900">No offers found</h3>
                        <p className="text-slate-500 mt-1">Get started by creating your first offer.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {offers.map((offer) => (
                            <div key={offer._id} className="group bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 relative overflow-hidden flex flex-col h-full">
                                {/* Decorative background element */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-full -mr-8 -mt-8 z-0 group-hover:bg-emerald-50 transition-colors"></div>

                                <div className="relative z-10 flex-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                                                <Tag size={20} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg text-slate-900 leading-tight">{offer.name}</h3>
                                                <div className="flex items-center gap-1 mt-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md w-fit">
                                                    {offer.discountType === 'percentage' ? (
                                                        <><Percent size={10} /> {offer.discountValue}% OFF</>
                                                    ) : (
                                                        <><DollarSign size={10} /> ₹{offer.discountValue} OFF</>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-slate-500 text-sm mb-6 line-clamp-2">{offer.description}</p>

                                    <div className="space-y-3 mb-6">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-slate-500">Min Slots</span>
                                            <span className="font-semibold text-slate-900">{offer.minSlots}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-slate-500 flex items-center gap-1"><Calendar size={14} /> Validity</span>
                                            <span className="font-medium text-slate-900">
                                                {formatDate(offer.validFrom)} - {formatDate(offer.validUntil)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="relative z-10 mt-auto pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                                    <button
                                        onClick={() => handleToggleActive(offer)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${offer.isActive
                                                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                            }`}
                                    >
                                        {offer.isActive ? <CheckCircle size={12} strokeWidth={3} /> : <XCircle size={12} strokeWidth={3} />}
                                        {offer.isActive ? 'Active' : 'Inactive'}
                                    </button>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(offer)}
                                            className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:border-emerald-500 hover:text-emerald-600 transition-all font-medium text-xs flex items-center gap-1"
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(offer._id)}
                                            className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:border-red-200 hover:bg-red-50 hover:text-red-500 transition-all"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Add/Edit Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h2 className="text-lg font-bold text-slate-900">
                                {editingOffer ? 'Edit Offer' : 'New Offer'}
                            </h2>
                            <button
                                onClick={() => {
                                    setShowAddModal(false);
                                    setEditingOffer(null);
                                    resetForm();
                                }}
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Offer Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Summer Special"
                                    className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition-all placeholder:text-slate-400"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Description *</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={3}
                                    placeholder="Brief details about the offer..."
                                    className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition-all placeholder:text-slate-400 resize-none"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Min Slots</label>
                                    <input
                                        type="number"
                                        name="minSlots"
                                        value={formData.minSlots || ''}
                                        onChange={handleInputChange}
                                        min="1"
                                        className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Discount Value</label>
                                    <input
                                        type="number"
                                        name="discountValue"
                                        value={formData.discountValue || ''}
                                        onChange={handleInputChange}
                                        min="0"
                                        step={formData.discountType === 'percentage' ? '1' : '0.01'}
                                        className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Discount Type</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <label className={`cursor-pointer border rounded-lg p-3 flex items-center justify-center gap-2 transition-all ${formData.discountType === 'percentage' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-1 ring-emerald-500' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                                        <input
                                            type="radio"
                                            name="discountType"
                                            value="percentage"
                                            checked={formData.discountType === 'percentage'}
                                            onChange={handleInputChange}
                                            className="hidden"
                                        />
                                        <Percent size={16} /> Percentage
                                    </label>
                                    <label className={`cursor-pointer border rounded-lg p-3 flex items-center justify-center gap-2 transition-all ${formData.discountType === 'fixed' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-1 ring-emerald-500' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                                        <input
                                            type="radio"
                                            name="discountType"
                                            value="fixed"
                                            checked={formData.discountType === 'fixed'}
                                            onChange={handleInputChange}
                                            className="hidden"
                                        />
                                        <DollarSign size={16} /> Fixed Amount
                                    </label>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Valid From *</label>
                                    <input
                                        type="date"
                                        name="validFrom"
                                        value={formData.validFrom}
                                        onChange={handleInputChange}
                                        className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition-all"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Valid Until *</label>
                                    <input
                                        type="date"
                                        name="validUntil"
                                        value={formData.validUntil}
                                        onChange={handleInputChange}
                                        className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 mt-2">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    name="isActive"
                                    checked={formData.isActive}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, isActive: e.target.checked }))
                                    }
                                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded cursor-pointer"
                                />
                                <label htmlFor="isActive" className="text-sm font-medium text-slate-700 cursor-pointer select-none">
                                    Activate this offer immediately
                                </label>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-slate-100 mt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddModal(false);
                                        setEditingOffer(null);
                                        resetForm();
                                    }}
                                    className="flex-1 py-2.5 text-slate-600 font-medium border border-slate-200 bg-white rounded-lg hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 shadow-sm transition-colors"
                                >
                                    {editingOffer ? 'Update Offer' : 'Create Offer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OffersPage;
