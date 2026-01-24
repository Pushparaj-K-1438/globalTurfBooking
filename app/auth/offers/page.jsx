'use client';
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Tag, Percent, Calendar, ToggleLeft, ToggleRight } from 'lucide-react';
import { toast, Slide } from 'react-toastify';

const page = () => {
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

    // Fetch offers
    const fetchOffers = async () => {
        try {
            const response = await fetch('/api/admin/offers');
            const data = await response.json();
            if (response.ok) {
                setOffers(data.offers);
            } else {
                toast.error('Failed to fetch offers');
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

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'minSlots' || name === 'discountValue' ? parseFloat(value) : value
        }));
    };

    // Handle form submission
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

    // Handle edit
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

    // Handle delete
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

    // Handle toggle active status
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

    // Reset form
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

    // Format date for display
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    return (
        <section className="relative min-h-screen pt-16 overflow-hidden text-black">
            <div className="min-h-screen bg-gray-50">
                <div className="container mx-auto px-4 py-8 flex flex-col gap-3">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Offers Management</h1>
                            <p className="text-gray-600">Create and manage promotional offers</p>
                        </div>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors cursor-pointer ml-auto"
                        >
                            <Plus size={20} />
                            Add Offer
                        </button>
                    </div>

                    {/* Offers Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {offers.map((offer) => (
                            <div key={offer._id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-2">
                                        <Tag size={20} className="text-green-600" />
                                        <h3 className="font-semibold text-lg">{offer.name}</h3>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(offer)}
                                            className="text-blue-600 hover:text-blue-800 p-1 cursor-pointer"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(offer._id)}
                                            className="text-red-600 hover:text-red-800 p-1 cursor-pointer"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <p className="text-gray-600 text-sm">{offer.description}</p>

                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-700 text-sm">Min Slots:</span>
                                        <span className="font-semibold">{offer.minSlots}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-700 text-sm">Discount:</span>
                                        <div className="flex items-center gap-1">
                                            {offer.discountType === 'percentage' ? (
                                                <Percent size={14} className="text-green-600" />
                                            ) : (
                                                <span className="text-green-600">₹</span>
                                            )}
                                            <span className="font-semibold text-green-600">
                                                {offer.discountValue}{offer.discountType === 'percentage' ? '%' : ''}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1 text-gray-700 text-sm">
                                            <Calendar size={14} />
                                            <span>Valid:</span>
                                        </div>
                                        <span className="text-sm">
                                            {formatDate(offer.validFrom)} - {formatDate(offer.validUntil)}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-700 text-sm">Status:</span>
                                        <button
                                            onClick={() => handleToggleActive(offer)}
                                            className={`flex items-center gap-2 px-2 py-1 rounded-full text-sm ${offer.isActive
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                                }`}
                                        >
                                            {offer.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                                            {offer.isActive ? 'Active' : 'Inactive'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {offers.length === 0 && (
                        <div className="text-center py-12">
                            <Tag size={48} className="mx-auto text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No offers found</h3>
                            <p className="text-gray-600">Get started by creating your first offer.</p>
                        </div>
                    )}

                    {/* Add/Edit Modal */}
                    {showAddModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            {/* Backdrop */}
                            <div
                                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                                onClick={() => {
                                    setShowAddModal(false);
                                    setEditingOffer(null);
                                    resetForm();
                                }}
                            />

                            {/* Modal Content */}
                            <div className="relative bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto shadow-lg">
                                <h2 className="text-xl font-bold mb-4">
                                    {editingOffer ? 'Edit Offer' : 'Add New Offer'}
                                </h2>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Offer Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Description *
                                        </label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Min Slots
                                            </label>
                                            <input
                                                type="number"
                                                name="minSlots"
                                                value={formData.minSlots}
                                                onChange={handleInputChange}
                                                min="1"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Discount Value
                                            </label>
                                            <input
                                                type="number"
                                                name="discountValue"
                                                value={formData.discountValue}
                                                onChange={handleInputChange}
                                                min="0"
                                                step={formData.discountType === 'percentage' ? '1' : '0.01'}
                                                max={formData.discountType === 'percentage' ? '100' : undefined}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Discount Type
                                        </label>
                                        <select
                                            name="discountType"
                                            value={formData.discountType}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                        >
                                            <option value="percentage">Percentage (%)</option>
                                            <option value="fixed">Fixed Amount (₹)</option>
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Valid From *
                                            </label>
                                            <input
                                                type="date"
                                                name="validFrom"
                                                value={formData.validFrom}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Valid Until *
                                            </label>
                                            <input
                                                type="date"
                                                name="validUntil"
                                                value={formData.validUntil}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            name="isActive"
                                            checked={formData.isActive}
                                            onChange={(e) =>
                                                setFormData((prev) => ({ ...prev, isActive: e.target.checked }))
                                            }
                                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                        />
                                        <label className="ml-2 text-sm text-gray-700">Active</label>
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowAddModal(false);
                                                setEditingOffer(null);
                                                resetForm();
                                            }}
                                            className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                        >
                                            {editingOffer ? 'Update' : 'Create'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </section>
    );
};

export default page;
